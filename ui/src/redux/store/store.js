// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 
import userReducer from '../slices/userSlice';
import serverReducer from '../slices/serverSlice';
import vendorReducer from '../slices/vendorSlice';
import logReducer from '../slices/logSlice';
import billingReducer from '../slices/billingSlice';
import didReducer from '../slices/didSlice';  
import orderReducer from '../slices/orderSlice';  
import paymentReducer from '../slices/paymentSlice';  
import cartReducer from '../slices/cartSlice';  

const rootReducer = combineReducers({
  user: userReducer,
  servers: serverReducer,
  vendors: vendorReducer,
  log: logReducer,
  billing: billingReducer,
  did: didReducer,  
  order: orderReducer,  
  payment: paymentReducer,  
  cart: cartReducer,  
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'servers', 'vendors', 'log', 'billing', 'did', 'order', 'payment','cart'],  
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export default store;
