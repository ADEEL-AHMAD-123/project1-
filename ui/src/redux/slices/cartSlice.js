import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // List of items in the cart
  numberOfDIDs: 0, // Number of DIDs
  pricePerDID: 0, // Price of each DID
  totalPrice: 0, // Total price of DIDs
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

      // Update numberOfDIDs and totalPrice
      state.numberOfDIDs = state.items.length;
      state.totalPrice = state.numberOfDIDs * state.pricePerDID;
    },
    removeFromCart: (state, action) => {
      const { _id, type } = action.payload;

      // Remove the item by ID and type from the cart
      state.items = state.items.filter(item => !(item._id === _id && item.type === type));

      // Update numberOfDIDs and totalPrice
      state.numberOfDIDs = state.items.length;
      state.totalPrice = state.numberOfDIDs * state.pricePerDID;
    },
    setCartDetails: (state, action) => {
      const { numberOfDIDs, pricePerDID, totalPrice } = action.payload;

      // Set the number of DIDs and price per DID
      state.numberOfDIDs = numberOfDIDs;
      state.pricePerDID = pricePerDID;
      state.totalPrice = totalPrice;
    },
    resetCart: (state) => {
      state.items = []; // Clear the entire cart
      state.numberOfDIDs = 0; // Reset number of DIDs
      state.totalPrice = 0; // Reset total price
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


