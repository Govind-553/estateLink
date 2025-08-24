import express from "express";
import { createSellListing, getAllSellListings, getSellListingsByContact, updateSellListingByContact, deleteSellListingByContact } from "../controllers/sellController.js";
import { verifyAccessToken } from "../middleware/userAuth.js";
import { checkAdminNumber } from "../middleware/checkAdminNumber.js";

const router = express.Router();

router.post("/create", verifyAccessToken, checkAdminNumber,  createSellListing);
// route 1: create sell listing

router.get("/all", verifyAccessToken, checkAdminNumber, getAllSellListings);
// route 2: get all sell listings

router.get("/by-contact", verifyAccessToken, checkAdminNumber, getSellListingsByContact);
// route 3: get sell listings by contact

router.put("/update", verifyAccessToken, checkAdminNumber, updateSellListingByContact);
// route 4: update sell listings by contact

router.delete("/delete", verifyAccessToken, checkAdminNumber, deleteSellListingByContact);
// route 5: delete sell listings by contact

export default router;