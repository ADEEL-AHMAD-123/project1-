// src/redux/slices/billingSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { userAsyncActions } from './userSlice'; // Import userAsyncActions

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper function to create async thunks
const createApiAsyncThunk = ({ name, method, url }) => {
  return createAsyncThunk(`billing/${name}`, async ({ requestData, data }, { dispatch }) => {
    try {
      const requestUrl = requestData
        ? `${BASE_URL}${url}${requestData}`
        : `${BASE_URL}${url}`;

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
      
      // Dispatch user profile update on successful billing account creation
      if (name === "create-billing-account") {
        dispatch(userAsyncActions.getUserProfile({ requestData: "" }))
      }

      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
      console.log(error);
      throw error.response?.data?.message || 'An error occurred';
    }
  });
};

export const billingAsyncActions = {
  createBillingAccount: createApiAsyncThunk({
    name: "create-billing-account",
    method: "POST",
    url: "/billing/create",
  }),
  createSIPAccount: createApiAsyncThunk({
    name: "create-SIP-account",
    method: "POST",
    url: "/billing/create",
  }),
  getInboundUsage: createApiAsyncThunk({
    name: "get-inbound-usage",
    method: "GET",
    url: "/billing/summary/days",
  }),
  getOutboundUsage: createApiAsyncThunk({
    name: "get-outbound-usage",
    method: "GET",
    url: "/billing/summary/days",
  }),
  getBalance: createApiAsyncThunk({
    name: "get-balance",
    method: "GET",
    url: "/billing/balance/days",
  }),
};

const initialState = {
  InBoundUsage: [],
  OutBoundUsage: [],
  balance: null,
  isLoading: false,
  error: null,
  pagination: null,
  account: null,
  SIPDetails: null,
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    resetBillingState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    Object.entries(billingAsyncActions).forEach(([actionName, action]) => {
      builder.addCase(action.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });

      builder.addCase(action.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;

        if (payload) {
          if (actionName === "getInboundUsage") {
            state.InBoundUsage = payload.data;
            state.pagination = payload.pagination;
          } else if (actionName === "getOutboundUsage") {
            state.OutBoundUsage = payload.data;
            state.pagination = payload.pagination;
          } else if (actionName === "getBalance") {
            state.balance = payload.balance;
          } else if (actionName === "createBillingAccount") {
            state.account = payload.data;
          } else if (actionName === "createSIPAccount") {
            state.SIPDetails = payload.data;
          }
        }
      });

      builder.addCase(action.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      });
    });
  },
});

export default billingSlice.reducer;
export const { resetBillingState } = billingSlice.actions;
