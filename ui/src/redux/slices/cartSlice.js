// src/redux/slices/cartSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // List of DIDs in the cart
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      // Check if DID already exists in the cart
      const existingItem = state.items.find(item => item._id === action.payload._id);
      if (!existingItem) {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action) => {
      // Remove DID from the cart by its _id
      state.items = state.items.filter(item => item._id !== action.payload);
    },
    resetCart: (state) => {
      // Clear the cart
      state.items = [];
    }
  }
});

export const cartAsyncActions = {
  addToCart: cartSlice.actions.addToCart,
  removeFromCart: cartSlice.actions.removeFromCart,
  resetCart: cartSlice.actions.resetCart,
};

export default cartSlice.reducer;
