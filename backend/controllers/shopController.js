const listShops = async (req, res) => {
    try {
        let shops = await ShopModel.find({});
        
        // Ensure all fields are present
        shops = shops.map(shop => ({
            id: shop._id,
            name: shop.name || "No Name",
            address: shop.address || "No Address",
            phone: shop.phone || "No Phone",
            category: shop.category || "No Category",
            image: shop.image || "default-image.jpg",
        }));

        res.json({ success: true, data: shops });
    } catch (error) {
        console.error("Error fetching shops:", error);
        res.status(500).json({ success: false, message: "Error retrieving shops." });
    }
};
