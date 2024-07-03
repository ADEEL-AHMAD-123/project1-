// store.js
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Choose storage (local storage in this case)
import userReducer from './slices/userSlice';
import productReducer from './slices/productsSlice';
import wishlistReducer from './slices/wishlistSlice';
import compareReducer from './slices/compareSlice';
import cartReducer from './slices/cartSlice';
import reviewReducer from './slices/reviewSlice';
import orderReducer from './slices/orderSlice';

const rootReducer = combineReducers({
  user: userReducer,
  products: productReducer,
  wishlist: wishlistReducer,
  compare: compareReducer,
  cart: cartReducer,
  reviews: reviewReducer,
  order: orderReducer,
});

const persistConfig = {
  key: 'root', // Key for the persistor
  storage, // Selected storage
  whitelist: ['wishlist', 'compare', 'cart', 'reviews', 'order', 'user','products'], // Array of reducer slices to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);




export default store;
