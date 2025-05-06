import Cart from '../models/cartModel.js'; // Assuming a Cart model is used to store cart items

// Add item to the cart
export const addToCart = async (req, res) => {
  try {
    const { mobileNumber, productId, quantity } = req.body;

    // Validate request data
    if (!mobileNumber || !productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    // Find existing cart for the user or create a new one
    let cart = await Cart.findOne({ mobileNumber });

    if (!cart) {
      // If no cart exists, create a new cart
      cart = new Cart({ mobileNumber, items: [{ productId, quantity }] });
    } else {
      // If cart exists, update the items
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex !== -1) {
        // Item already exists in cart, update quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Item doesn't exist, add new item
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();
    res.status(200).json({ success: true, message: 'Item added to cart', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
};

// Get the user's cart
export const getCart = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    // Validate request data
    if (!mobileNumber) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    // Find cart for the user
    const cart = await Cart.findOne({ mobileNumber });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
};

// Remove item from the cart
export const removeFromCart = async (req, res) => {
    try {
      const { mobileNumber, productId } = req.body;
  
      // Validate request data
      if (!mobileNumber || !productId) {
        return res.status(400).json({ message: 'Mobile number and product ID are required' });
      }
  
      // Find cart for the user
      const cart = await Cart.findOne({ mobileNumber });
  
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
  
      // Remove the item from the cart
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
  
      // If no items left in the cart, delete the entire cart from the database
      if (cart.items.length === 0) {
        await Cart.deleteOne({ mobileNumber });
        return res.status(200).json({ success: true, message: 'Cart is empty now and deleted from the database' });
      }
  
      await cart.save();
      res.status(200).json({ success: true, message: 'Item removed from cart', cart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to remove item from cart' });
    }
  };
  

export const clearCart = async (req, res) => {
    try {
      const { mobileNumber } = req.body;
  
      if (!mobileNumber) {
        return res.status(400).json({ message: 'Mobile number is required' });
      }
  
      const cart = await Cart.findOne({ mobileNumber });
  
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
  
      cart.items = []; // Clear all items
      await cart.save();
  
      res.status(200).json({ success: true, message: 'Cart cleared successfully' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ message: 'Server error while clearing cart' });
    }
  };

  // Delete the cart after an order is placed
export const deleteCartAfterOrder = async (mobileNumber) => {
  try {
    // Find and delete the cart for the user
    const cart = await Cart.findOne({ mobileNumber });

    if (cart) {
      await Cart.deleteOne({ mobileNumber });
      console.log(`Cart deleted for user: ${mobileNumber}`);
    } else {
      console.log(`No cart found for user: ${mobileNumber}`);
    }
  } catch (error) {
    console.error('Error deleting cart after order:', error);
  }
};
