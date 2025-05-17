import Cart from '../models/cartModel.js';
import Profile from '../models/profileModel.js';

// Get profile by mobileNumber or email
const getProfile = async (identifier) => {
  if (!identifier) {
    console.log('Identifier is required');
    throw new Error('Identifier required');
  }
  console.log(`Looking for profile with identifier: ${identifier}`);
  return await Profile.findOne({
    $or: [{ mobileNumber: identifier }, { email: identifier }],
  });
};

export const addToCart = async (req, res) => {
  try {
    const { mobileOrEmail, productId, quantity } = req.body;
    console.log('addToCart called with:', req.body);

    // Validation
    if (!mobileOrEmail || !productId || typeof quantity !== 'number' || quantity <= 0) {
      console.log('Invalid request data');
      return res.status(400).json({ message: 'Invalid request data' });
    }

    // Find user profile
    const profile = await getProfile(mobileOrEmail);  // You should pass either mobile or email
    if (!profile) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Cart logic
    let cart = await Cart.findOne({ profile: profile._id });
    if (!cart) {
      console.log('No existing cart found, creating new cart');
      cart = new Cart({
        profile: profile._id,
        mobileNumber: profile.mobileNumber,
        items: [{ productId, quantity }],
      });
    } else {
      console.log('Existing cart found');
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex !== -1) {
        console.log('Item already in cart, updating quantity');
        cart.items[itemIndex].quantity += quantity;
      } else {
        console.log('Item not in cart, adding new item');
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();
    console.log('Cart saved successfully');
    res.status(200).json({ success: true, message: 'Item added to cart', cart });
  } catch (err) {
    console.error('addToCart error:', err);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
};

export const getCart = async (req, res) => {
  try {
    const { mobileOrEmail } = req.body;
    console.log('getCart called with:', mobileOrEmail);

    // Ensure the identifier is provided
    if (!mobileOrEmail) {
      console.log('Identifier missing');
      return res.status(400).json({ message: 'Identifier required' });
    }

    // Find user profile based on mobile number or email
    const profile = await getProfile(mobileOrEmail);
    if (!profile) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the user's cart using the profile's _id
    const cart = await Cart.findOne({ profile: profile._id }).populate('items.productId');
    if (!cart) {
      console.log('Cart not found', mobileOrEmail);
      return res.status(404).json({ message: 'Cart not found' });
    }
    // Flatten cart items for frontend
    const flatItems = cart.items
  .filter(item => item.productId) // skip broken items
  .map(item => {
    const product = item.productId;
    return {
      _id: item._id,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: item.quantity,
    };
  });

    console.log('✅ Cart fetched and flattened:', mobileOrEmail);
    res.status(200).json({ success: true, cart: { items: flatItems } });

  } catch (err) {
    console.error('getCart error:', err);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { mobileOrEmail, productId } = req.body;
    console.log('removeFromCart called with:', req.body);

    if (!mobileOrEmail || !productId) {
      console.log('Identifier or productId missing');
      return res.status(400).json({ message: 'Identifier and productId required' });
    }

    // Find user profile
    const profile = await getProfile(mobileOrEmail);
    if (!profile) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const cart = await Cart.findOne({ profile: profile._id });
    if (!cart) {
      console.log('Cart not found');
      return res.status(404).json({ message: 'Cart not found' });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    console.log(`Removed ${initialLength - cart.items.length} item(s)`);

    if (cart.items.length === 0) {
      console.log('Cart is empty after removal, deleting cart');
      await Cart.deleteOne({ profile: profile._id });
      return res.status(200).json({ success: true, message: 'Cart deleted' });
    }
     // Emit empty cart event to user room
      io.to(mobileOrEmail).emit('cartUpdated', []); 

      return res.status(200).json({ success: true, message: 'Cart deleted' });
    

    await cart.save();
    console.log('Item removed and cart updated');

  // Emit updated cart to all devices in user's room
    io.to(mobileOrEmail).emit('cartUpdated', cart.items);
  
    res.status(200).json({ success: true, message: 'Item removed from cart', cart });
  } catch (err) {
    console.error('removeFromCart error:', err);
    res.status(500).json({ message: 'Failed to remove item' });
  }
};

export const clearCart = async (req, res) => {
  try {
    const { mobileOrEmail } = req.body;
    console.log('clearCart called with:', mobileOrEmail);

    if (!mobileOrEmail) {
      console.log('Identifier missing');
      return res.status(400).json({ message: 'Identifier required' });
    }

    // Resolve profile
    const profile = await getProfile(mobileOrEmail);
    if (!profile) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Use mobileNumber for consistency
    const cart = await Cart.findOne({ mobileNumber: profile.mobileNumber });
    if (!cart) {
      console.log('Cart not found');
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();
    console.log('Cart cleared');
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    console.error('clearCart error:', err);
    res.status(500).json({ message: 'Error clearing cart' });
  }
};


export const deleteCartAfterOrder = async (mobileOrEmail) => {
  try {
    console.log('deleteCartAfterOrder called for:', mobileOrEmail);
    const profile = await getProfile(mobileOrEmail);

    if (profile) {
      // Proceed with deleting the cart if profile exists
      await Cart.deleteOne({ profile: profile._id });
      console.log('Cart deleted after order');
      return { success: true, message: 'Cart deleted successfully' };
    } else {
      console.log('Profile not found for deleting cart');
      return { success: false, message: 'Profile not found' };
    }
  } catch (err) {
    console.error('Error deleting cart after order:', err);
    return { success: false, message: 'Error deleting cart after order', error: err.message };
  }
};

