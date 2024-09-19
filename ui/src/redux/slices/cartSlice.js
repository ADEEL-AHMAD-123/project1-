import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // List of items in the cart (can be DIDs, products, etc.)
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { _id, type } = action.payload;

      // Check if the item of the same type and ID already exists in the cart
      const existingItem = state.items.find(item => item._id === _id && item.type === type);

      if (!existingItem) {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action) => {
      const { _id, type } = action.payload;

      // Remove the item by ID and type from the cart
      state.items = state.items.filter(item => !(item._id === _id && item.type === type));
    },
    resetCart: (state) => {
      state.items = []; // Clear the entire cart
    },
  },
});

export const cartAsyncActions = {
  addToCart: cartSlice.actions.addToCart,
  removeFromCart: cartSlice.actions.removeFromCart,
  resetCart: cartSlice.actions.resetCart,
};

export default cartSlice.reducer;
