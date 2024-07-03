import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

const initialState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist(state, action) {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(product => product._id === newItem._id);
      
      if (existingItemIndex === -1) {
        state.items.push(newItem);
        toast.success("Product added to wishlist");
      } else {
        state.items.splice(existingItemIndex, 1);
        toast.info("Product removed from wishlist");
      }
    },
    removeFromWishlist(state, action) {
      const itemId = action.payload;
      state.items = state.items.filter(item => item._id !== itemId);
      toast.info('Product removed from wishlist');
    },
  },
});

export const { toggleWishlist,removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
