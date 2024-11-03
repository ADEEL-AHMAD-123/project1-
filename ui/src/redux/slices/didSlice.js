import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper function to create async thunks
const createApiAsyncThunk = ({ name, method, url }) => {
  return createAsyncThunk(`did/${name}`, async ({ requestData, data }) => {
    try {
      const requestUrl = requestData
        ? `${BASE_URL}${url}${requestData}`
        : `${BASE_URL}${url}`;
      const requestOptions = {
        method,
        url: requestUrl,
        data,
        headers: {
          "Content-Type":
            data instanceof FormData
              ? "multipart/form-data"
              : "application/json",
        },
        withCredentials: true,
      };

      const response = await axios(requestOptions);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      throw error.response?.data?.message || "An error occurred";
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
  addDID: createApiAsyncThunk({
    name: "add-DID",
    method: "POST",
    url: "/dids/",
  }),
  addDIDsFromFile: createApiAsyncThunk({
    name: "add-DIDs-From-File",
    method: "POST",
    url: "/dids/bulk/upload",
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
  pagination: null,
  isLoading: false,
  message: null,
  error: null,
  errors: [],
  added: null,
};

const didSlice = createSlice({
  name: "did",
  initialState,
  reducers: {
    resetDIDState: (state) => initialState,
    clearMessages: (state) => {
      state.message = null;
      state.errors = [];
      state.added = null;
    },
  },
  extraReducers: (builder) => {
    Object.entries(didAsyncActions).forEach(([actionName, action]) => {
      builder.addCase(action.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      });
      builder.addCase(action.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;

        if (actionName === "addDIDsFromFile") {
          state.message = payload.message;
          state.added = payload.added;
          state.errors = payload.errors || [];
        }
        if (actionName === "addDID") {
          state.message = payload.message;
          state.added = 1;
          state.error=payload.error
          state.errors=[]
        }
       
         // Handle available DIDs data
         if (payload && actionName === "fetchAvailableDIDs") {
          state.availableDIDs = payload.dids;
          state.pagination = payload.pagination;
          state.error = null;
          state.isLoading = false;
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
          state.error = null;
          state.isLoading = false;
        }
      });

      builder.addCase(action.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message || "An unexpected error occurred";
        state.errors = payload?.errors || [];
      });
      
    });
  },
});

export default didSlice.reducer;
export const { resetDIDState, clearMessages } = didSlice.actions;
