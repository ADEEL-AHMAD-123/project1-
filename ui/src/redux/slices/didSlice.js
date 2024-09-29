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
  fetchGlobalDIDPricing: createApiAsyncThunk({
    name: "fetchGlobalDIDPricing",
    method: "GET",
    url: "/dids/pricing/global",
  }),
  fetchUserDIDPricing: createApiAsyncThunk({
    name: "fetchUserDIDPricing",
    method: "GET",
    url: "/dids/pricing/user/",
  }),
  setGlobalDIDPricing: createApiAsyncThunk({
    name: "setGlobalDIDPricing",
    method: "POST",
    url: "/dids/pricing/global",
  }),
  setUserDIDPricing: createApiAsyncThunk({
    name: "setUserDIDPricing",
    method: "POST",
    url: "/dids/pricing/user/",
  }),
  fetchMyDIDs: createApiAsyncThunk({
    name: "fetchMyDIDs",
    method: "GET",
    url: "/dids/mydids",
  }),
};

const initialState = {
  availableDIDs: [],
  myDIDs: [],
  globalPricing: {
    nonBulkPrice: null,
    bulkPrice: null,
    bulkThreshold: null,
    lastModified: null,
  },
  userPricing: {
    nonBulkPrice: null,
    bulkPrice: null,
    bulkThreshold: null,
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
        if (payload && actionName === "fetchGlobalDIDPricing" || actionName === "setGlobalDIDPricing") {
          state.globalPricing.nonBulkPrice = payload.pricing.nonBulkPrice;
          state.globalPricing.bulkPrice = payload.pricing.bulkPrice;
          state.globalPricing.bulkThreshold = payload.pricing.bulkThreshold;
          state.globalPricing.lastModified = payload.pricing.lastModified;
        }

        // Handle user DID pricing
        if (payload && actionName === "fetchUserDIDPricing") {
          state.userPricing.nonBulkPrice = payload.pricing.nonBulkPrice;
          state.userPricing.bulkPrice = payload.pricing.bulkPrice;
          state.userPricing.bulkThreshold = payload.pricing.bulkThreshold;
        }

        // Handle "myDIDs" response
        if (payload && actionName === "fetchMyDIDs") {
          state.myDIDs = payload.dids;
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
