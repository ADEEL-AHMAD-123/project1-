import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper function to create async thunks
const createApiAsyncThunk = ({ name, method, url }) => {
  return createAsyncThunk(`billing/${name}`, async ({ requestData, data }) => {
    try {
      const requestUrl = requestData
        ? `${BASE_URL}${url}${requestData}`
        : `${BASE_URL}${url}`;

      const requestOptions = {
        method,
        withCredentials: true,
        url: requestUrl,
        data,
        headers: {
          'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
        },
      };

      const response = await axios(requestOptions);
      toast.success(response.data.message);
      console.log(response,'hh');
      return response.data.result;
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
      throw error.response.data.message;
    }
  });
};

export const billingAsyncActions = {
  createResource: createApiAsyncThunk({
    name: "create-resource",
    method: "POST",
    url: "/billing/create",
  }),
  getCallSummary: createApiAsyncThunk({
    name: "get-billing-summary",
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
  callSummary: [],
  balance: null,
  isLoading: false,
  error: null,
  pagination:null,
  account:{
    "id":1
  }
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
          if (actionName === "getCallSummary") {
            state.callSummary = payload.data;
            state.pagination=payload.pagination
          } else if (actionName === "getBalance") {
            state.balance = payload.balance;
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
