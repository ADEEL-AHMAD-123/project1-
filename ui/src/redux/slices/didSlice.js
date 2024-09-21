// src/redux/slices/didSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL; 

// Helper function to create async thunks
const createApiAsyncThunk = ({ name, method, url }) => {
  return createAsyncThunk(`did/${name}`, async ({ requestData, data }) => {
    try {
      const requestUrl = requestData ? `${BASE_URL}${url}${requestData}` : `${BASE_URL}${url}`;
      const requestOptions = {
        method,
        url: requestUrl,
        data,
        headers: {
          'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
        },
        withCredentials: true,
      };

      const response = await axios(requestOptions);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
      throw error.response?.data?.message || 'An error occurred';
    }
  });
};

// src/redux/slices/didSlice.js
export const didAsyncActions = {
  fetchAvailableDIDs: createApiAsyncThunk({
    name: "fetchAvailableDIDs",
    method: "GET",
    url: "/dids/available",
  }),
  updateDIDConfig: createApiAsyncThunk({
    name: "updateDIDConfig",
    method: "PUT",
    url: "/dids/",
  }),
  scheduleDIDDeletion: createApiAsyncThunk({
    name: "scheduleDIDDeletion",
    method: "DELETE",
    url: "/dids/",
  }),
  fetchPurchasedDIDs: createApiAsyncThunk({
    name: "fetchPurchasedDIDs",
    method: "GET",
    url: "/dids/purchased",
  }),
  fetchDIDPricing: createApiAsyncThunk({
    name: "fetchDIDPricing",
    method: "GET",
    url: "/dids/pricing",
  }),
};

const initialState = {
  availableDIDs: [],
  pricing: {
    individualPrice: null,
    bulkPrice: null,
    lastModified: null,
  },
  isLoading: false,
  error: null,
};


const didSlice = createSlice({
  name: "did",
  initialState,
  reducers: {
    resetDIDState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    Object.entries(didAsyncActions).forEach(([actionName, action]) => {
      builder.addCase(action.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });
      builder.addCase(action.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        
        // Handle available DIDs data
        if (payload && actionName === "fetchAvailableDIDs") {
          state.availableDIDs = payload.dids;
        }

        // Handle global DID pricing
        if (payload && actionName === "fetchDIDPricing") {
          state.pricing.individualPrice = payload.pricing.individualPrice;
          state.pricing.bulkPrice = payload.pricing.bulkPrice;
          state.pricing.lastModified = payload.pricing.lastModified;
        }
      });
      builder.addCase(action.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      });
    });
  },
});

export default didSlice.reducer;
export const { resetDIDState } = didSlice.actions;

