import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],               // Array of items in the cart
  numberOfDIDs: 0,         // Count of total DIDs in the cart
  pricePerDID: 0,          // Price per DID (single value)
  totalPrice: 0,           // Total price of all DIDs in the cart
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart
    addToCart: (state, action) => {
      const { _id, type } = action.payload;
      const existingItem = state.items.find(item => item._id === _id && item.type === type);

      if (!existingItem) {
        // If the item does not exist in the cart, push it into the items array
        state.items.push(action.payload);
      }

      // Update number of DIDs in the cart
      state.numberOfDIDs = state.items.length;
      
      // Recalculate the total price based on number of DIDs and price per DID
      state.totalPrice = state.numberOfDIDs * state.pricePerDID;
    },

    // Remove item from cart
    removeFromCart: (state, action) => {
      const { _id, type } = action.payload;
      state.items = state.items.filter(item => !(item._id === _id && item.type === type));

      // Update number of DIDs in the cart
      state.numberOfDIDs = state.items.length;
      
      // Recalculate the total price based on the updated number of DIDs
      state.totalPrice = state.numberOfDIDs * state.pricePerDID;
    },

    // Set cart details (pricePerDID and totalPrice)
    setCartDetails: (state, action) => {
      const { pricePerDID } = action.payload;

      // Set the price per DID
      state.pricePerDID = pricePerDID;

      // Recalculate total price based on the number of DIDs and price per DID
      state.totalPrice = state.numberOfDIDs * state.pricePerDID;
    },

    // Reset cart to initial state
    resetCart: (state) => {
      state.items = [];
      state.numberOfDIDs = 0;
      state.pricePerDID = 0;
      state.totalPrice = 0;
    },
  },
});

export const cartAsyncActions = {
  addToCart: cartSlice.actions.addToCart,
  removeFromCart: cartSlice.actions.removeFromCart,
  setCartDetails: cartSlice.actions.setCartDetails,
  resetCart: cartSlice.actions.resetCart,
};

export default cartSlice.reducer;
