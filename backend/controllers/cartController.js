import Cart from '../models/cartModel.js';
import Profile from '../models/profileModel.js';
import ShopModel from '../models/shopModel.js';

const getProfile = async (identifier) => {
  if (!identifier) {
    console.log('❗ Identifier is required');
    throw new Error('Identifier required');
  }

  try {
    console.log(`🔍 Looking for profile with identifier: ${identifier}`);
    const profile = await Profile.findOne({
      $or: [{ mobileNumber: identifier }, { email: identifier }],
    });

    if (!profile) {
      console.log("❌ No profile found");
    } else {
      console.log("✅ Profile found:", profile._id);
    }

    return profile;
  } catch (err) {
    console.error("❌ Error in getProfile:", err);
    throw err; // Let the controller catch this
  }
};

export const addToCart = async (req, res) => {
  try {
    const { mobileOrEmail, productId, quantity, shopId } = req.body;
    console.log('addToCart called with:', req.body);

    // Validation
    if (!mobileOrEmail || !productId || !shopId || typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    const profile = await getProfile(mobileOrEmail);
    if (!profile) return res.status(404).json({ message: 'User not found' });

    let cart = await Cart.findOne({ profile: profile._id });

    if (!cart) {
      cart = new Cart({
        profile: profile._id,
        mobileNumber: profile.mobileNumber,
        items: [{ productId, quantity, shop: shopId }]
      });
    } else {
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

      // Prevent mixing shops (optional business rule)
      const isDifferentShop = cart.items.length > 0 && cart.items[0].shop.toString() !== shopId;
      if (isDifferentShop) {
        return res.status(400).json({ message: 'Cannot add items from different shops' });
      }

      if (itemIndex !== -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, shop: shopId });
      }
    }

    await cart.save();
    res.status(200).json({ success: true, message: 'Item added to cart', cart });
  } catch (err) {
    console.error('addToCart error:', err);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
};


export const getCart = async (req, res) => {
  try {
    const { mobileOrEmail } = req.body;

    if (!mobileOrEmail) {
      return res.status(400).json({ message: 'Identifier required' });
    }

    const profile = await getProfile(mobileOrEmail);
    if (!profile) return res.status(404).json({ message: 'User not found' });

    const cart = await Cart.findOne({ profile: profile._id })
      .populate('items.productId')
      .populate('items.shop');

    if (!cart || !Array.isArray(cart.items)) {
      return res.status(200).json({ success: true, cart: { items: [] } });
    }

    const flatItems = cart.items
      .filter(item => item.productId)
      .map(item => ({
        _id: item._id,
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        image: item.productId.image,
        quantity: item.quantity,
        shop: {
          _id: item.shop?._id,
          name: item.shop?.name,
        }
      }));

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

    await cart.save();
    console.log('Item removed and cart updated');
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

