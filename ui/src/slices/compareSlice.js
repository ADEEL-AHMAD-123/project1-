import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

const initialState = {
  items: [],
};

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare(state, action) {
      const item = action.payload;
      const existingItem = state.items.find(product => product._id === item._id);
      if (!existingItem) {
        // Product not found in compare, so add it
        state.items.push(item);
        toast.success("Product added to compare");
      } else {
        // Product already exists in compare
        toast.info('Product already in compare');
      }
    },
    removeFromCompare(state, action) {
      const itemId = action.payload;
      state.items = state.items.filter(item => item._id !== itemId);
      toast.info('Product removed from compare');
    },
    resetCompareState: (state) => {
      return initialState;
    },
  },
});

export const { addToCompare, removeFromCompare,resetCompareState } = compareSlice.actions;
export default compareSlice.reducer;
