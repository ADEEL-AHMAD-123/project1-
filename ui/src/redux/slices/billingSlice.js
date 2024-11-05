import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { userAsyncActions } from './userSlice'; // Import userAsyncActions
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const SSE_URL=process.env.REACT_APP_SSE_URL

console.log(BASE_URL,SSE_URL,'logs')
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
        dispatch(userAsyncActions.getUserProfile({ requestData: "" }));
      }

      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
      console.log(error);
      throw error.response?.data?.message || 'An error occurred';
    }
  });
};

// Define async actions
export const billingAsyncActions = {
  createBillingAccount: createApiAsyncThunk({
    name: "create-billing-account",
    method: "POST",
    url: "/billing/create-billing-account",
  }),
  createSIPAccount: createApiAsyncThunk({
    name: "create-SIP-account",
    method: "POST",
    url: "/billing/create-sip-account",
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
  getCredit: createApiAsyncThunk({
    name: "get-credit",
    method: "GET",
    url: "/billing/credit",
  }),
  updateCredit: createApiAsyncThunk({
    name: "update-credit",
    method: "POST",
    url: "/billing/credit",
  }),
  getBillingAccount: createApiAsyncThunk({
    name: "get-billing-account",
    method: "GET",
    url: "/billing/account", 
  }),
};

const initialState = {
  BillingAccount: null,
  InBoundUsage: [],
  OutBoundUsage: [],
  period: null,
  credit: null,
  isLoading: false,
  error: null,
  pagination: null,
  SIPDetails: null,
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    resetBillingState: (state) => {
      return initialState;
    },
    setBillingAccount: (state, action) => {
      state.BillingAccount = action.payload; 
      state.credit = action.payload.credit; 
    },
    updateCredit: (state, action) => {
      state.credit = action.payload;
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
            state.error = payload.error;
            state.period = payload.period;
          } else if (actionName === "getOutboundUsage") {
            state.OutBoundUsage = payload.data;
            state.pagination = payload.pagination;
            state.error = payload.error;
            state.period = payload.period;
          } else if (actionName === "getCredit") {
            state.BillingAccount = payload.billingAccount;
            state.credit = payload.credit;
            state.error = payload.error;
          } else if (actionName === "createBillingAccount") {
            state.BillingAccount = payload.data;
            state.credit = payload.data.credit;
            state.error = payload.error;
          } else if (actionName === "createSIPAccount") {
            state.SIPDetails = payload.data;
            state.error = payload.error;
          } else if (actionName === "getBillingAccount") {
            state.BillingAccount = payload.data;  
            state.credit = payload.data.credit;
            state.error = payload.error;
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

export const { updateCredit } = billingSlice.actions;
export default billingSlice.reducer;

// SSE Initialization
export const initializeSSE = () => (dispatch) => {
  const token = Cookies.get('token');

  if (!token) {
    console.error('No token found, unable to connect to SSE.');
    return;
  }

  const eventSource = new EventSource(`${SSE_URL}?token=${token}`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.credit) {
      dispatch(updateCredit(data.credit)); // Update credit in Redux
    }
  };

  eventSource.onerror = () => {
    console.log('SSE connection error.');
    eventSource.close();
  };
};
export const { resetBillingState, setBillingAccount } = billingSlice.actions;