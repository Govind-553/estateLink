import SellFlat from "../models/sellflats.js";

// Route 1 - Create a new sell listing
export const createSellListing = async (req, res) => {
    const { contact } = req.params;
    const sellData = { ...req.body, contact };

    try {
        const newListing = await SellFlat.create(sellData);
        res.status(201).json({
            message: `New flat for sale listed by ${contact}.`,
            data: newListing
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Route 2 - Get all sell listings
export const getAllSellListings = async (req, res) => {
    try {
        const listings = await SellFlat.find();
        res.status(200).json({
            message: "All the list of flats for sale are listed below.",
            data: listings
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Route 3 - Get specific sell listings by contact
export const getSellListingsByContact = async (req, res) => {
    const { contact } = req.params;

    try {
        const listings = await SellFlat.find({ contact });
        res.status(200).json({
            message: `All flats for sale listed by agent ${contact}.`,
            data: listings
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Route 4 - Delete sell listings by contact
export const deleteSellListing = async (req, res) => {
    const { contact } = req.params;

    try {
        await SellFlat.deleteMany({ contact });
        res.status(200).json({
            message: `All sale listings by ${contact} have been deleted.`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};