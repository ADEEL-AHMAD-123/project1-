// store.js
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Choose storage (local storage in this case)
import userReducer from '../slices/userSlice';


const rootReducer = combineReducers({
  user: userReducer,

});

const persistConfig = {
  key: 'root', // Key for the persistor
  storage, // Selected storage
  whitelist: [ 'user'], // Array of reducer slices to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);




export default store;
