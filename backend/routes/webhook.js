import express from "express";
import crypto from "crypto";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Helper: add one calendar month
const addOneMonth = (date) => {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + 1);
  if (d.getDate() < day) {
    d.setDate(0);
  }
  return d;
};

// Razorpay webhook endpoint
router.post(
  "/razorpay-webhook",
  express.json({ type: "application/json" }),
  async (req, res) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest("hex");

      if (digest !== req.headers["x-razorpay-signature"]) {
        return res.status(400).json({ status: "failed", message: "Invalid signature" });
      }

      const event = req.body.event;
      const payload = req.body.payload || {};

      // Handle first activation of subscription
      if (event === "subscription.activated") {
        const subscriptionEntity = payload.subscription?.entity;
        if (!subscriptionEntity) {
          console.warn("subscription.activated: No subscription entity in payload");
        } else {
          const subscriptionId = subscriptionEntity.id;

          const user = await User.findOne({ subscriptionId });
          if (user) {
            const now = new Date();

            if (!user.hasUsedTrial) {
              // First time ever: 7 days free + 1 calendar month
              const trialEnd = new Date(now);
              trialEnd.setDate(trialEnd.getDate() + 7);
              const expiry = addOneMonth(trialEnd);

              user.subscriptionActive = true;
              user.subscriptionStatus = "Active";
              user.subscriptionExpiry = expiry;
              user.hasUsedTrial = true;
            } else {
              // Already used trial – subscription re-created: treat as renewal
              const base = user.subscriptionExpiry && user.subscriptionExpiry > now
                ? user.subscriptionExpiry
                : now;

              const expiry = addOneMonth(base);
              user.subscriptionActive = true;
              user.subscriptionStatus = "Active";
              user.subscriptionExpiry = expiry;
            }

            // Optional: capture email/contact from Razorpay customer details if present
            if (subscriptionEntity.customer_details?.email && !user.email) {
              user.email = subscriptionEntity.customer_details.email;
            }

            await user.save();

            console.log(`✅ Subscription activated for user ${user.mobileNumber}, expires at ${user.subscriptionExpiry}`);
          }
        }
      }

      // Handle automatic monthly charges (for recurring subscriptions)
      if (event === "invoice.paid") {
        const invoiceEntity = payload.invoice?.entity;
        if (invoiceEntity && invoiceEntity.subscription_id) {
          const subscriptionId = invoiceEntity.subscription_id;
          const user = await User.findOne({ subscriptionId });

          if (user) {
            const now = new Date();
            const base = user.subscriptionExpiry && user.subscriptionExpiry > now
              ? user.subscriptionExpiry
              : now;
            const expiry = addOneMonth(base);

            user.subscriptionActive = true;
            user.subscriptionStatus = "Active";
            user.subscriptionExpiry = expiry;

            // Update email/contact from invoice if needed
            if (invoiceEntity.customer_email && !user.email) {
              user.email = invoiceEntity.customer_email;
            }

            await user.save();

            console.log(`📅 Invoice paid: extended subscription for ${user.mobileNumber} to ${user.subscriptionExpiry}`);
          }
        }
      }

      if (event === "subscription.cancelled" || event === "subscription.halted" || event === "subscription.paused") {
        const subscriptionEntity = payload.subscription?.entity;
        if (subscriptionEntity) {
          const subscriptionId = subscriptionEntity.id;

          await User.findOneAndUpdate(
            { subscriptionId },
            { subscriptionActive: false, subscriptionStatus: "Inactive" }
          );

          console.log(`❌ Subscription cancelled/paused: ${subscriptionId}`);
        }
      }

      res.json({ status: "ok" });
    } catch (error) {
      console.error("Error in webhook:", error.message);
      res.status(500).json({
        status: "failed",
        message: "Server error",
      });
    }
  }
);

export default router;
