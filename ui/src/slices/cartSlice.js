import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialState = {
  items: [],
  shippingInfo: {},
  orderInfo: {
    subtotal: 0,
    total: 0,
  },
};

const calculateSubtotal = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const updateOrderInfo = (state) => {
  const subtotal = calculateSubtotal(state.items);
  const total = subtotal; // Add shipping, taxes, etc., if needed
  state.orderInfo.subtotal = subtotal;
  state.orderInfo.total = total;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const { item } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (product) => product._id === item._id
      );

      if (existingItemIndex === -1) {
        state.items.push({ ...item, quantity: 1 });
        toast.success("Product added to cart");
      } else {
        toast.info("Product is already in the cart");
      }
      updateOrderInfo(state);
    },
    incrementQuantity(state, action) {
      const { itemId } = action.payload;
      const existingItem = state.items.find((item) => item._id === itemId);

      if (existingItem && existingItem.quantity < existingItem.stock) {
        existingItem.quantity++;
        updateOrderInfo(state);
      } else {
        toast.error("Cannot increment quantity. Product stock limit reached.");
      }
    },
    decrementQuantity(state, action) {
      const { itemId } = action.payload;
      const existingItem = state.items.find((item) => item._id === itemId);

      if (existingItem && existingItem.quantity > 1) {
        existingItem.quantity--;
        updateOrderInfo(state);
      } else {
        toast.error("Cannot decrement quantity. Minimum quantity reached.");
      }
    },
    removeFromCart(state, action) {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item._id !== itemId);
      toast.info("Product removed from cart");
      updateOrderInfo(state);
    },
    saveShippingInfo(state, action) {
      const shippingInfo = action.payload;
      state.shippingInfo = shippingInfo;
    },
    saveOrderInfo(state, action) {
      const orderInfo = action.payload;
      state.orderInfo = orderInfo;
    },
    resetCartState: (state) => {
      return initialState;
      }
  },
});

export const {
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  saveShippingInfo,
  saveOrderInfo,
  resetCartState
} = cartSlice.actions;
export default cartSlice.reducer;

