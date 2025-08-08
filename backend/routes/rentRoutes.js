import express from "express";
import {
    createRentListing,
    getAllRentListings,
    getRentListingsByContact,
    deleteRentListing
} from "../controllers/rentController.js";

const router = express.Router();

router.post("/create/:contact", createRentListing);
router.get("/all", getAllRentListings);
router.get("/by-contact/:contact", getRentListingsByContact);
router.delete("/delete/:contact", deleteRentListing);

export default router;