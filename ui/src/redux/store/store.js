// store.js
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 
import userReducer from '../slices/userSlice';
import serverReducer from '../slices/serverSlice';
import vendorReduce from '../slices/vendorSlice'
import logReduce from '../slices/logSlice'


const rootReducer = combineReducers({
  user: userReducer,
  servers: serverReducer,
  vendors:vendorReduce,
  log:logReduce
});

const persistConfig = {
  key: 'root', // Key for the persistor
  storage, // Selected storage
  whitelist: [ 'user','servers','vendors','log'], // Array of reducer slices to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);




export default store;
