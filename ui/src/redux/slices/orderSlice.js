import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper to create async thunks
const createApiAsyncThunk = ({ name, method, url }) => {
  return createAsyncThunk(`order/${name}`, async ({ requestData, data }, { rejectWithValue }) => {
    try {
      const requestUrl = requestData ? `${BASE_URL}${url}${requestData}` : `${BASE_URL}${url}`;
      
      const requestOptions = {
        method,
        withCredentials: true, // Include credentials if needed for authentication
        url: requestUrl,
        data,
        headers: {
          "Content-Type": data instanceof FormData ? "multipart/form-data" : "application/json",
        },
      };

      const response = await axios(requestOptions);
      toast.success(response.data.message);
      return response.data; // Return the response data (e.g., order details)
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      return rejectWithValue(error.response?.data?.message); // Reject the value for error handling
    }
  });
};

// Define the async thunks for orders
export const orderAsyncActions = {
  createOrder: createApiAsyncThunk({
    name: "create",
    method: "POST",
    url: "/orders/create",
  }),
  fetchOrderDetails: createApiAsyncThunk({
    name: "getOrderDetails",
    method: "GET",
    url: "/orders/",
  }),
  fetchAllOrders: createApiAsyncThunk({
    name: "getAllOrders",
    method: "GET",
    url: "/orders/all",
  }),
};

// Initial state
const initialState = {
  order: null,
  orders: [],
  clientSecret: null,
  isLoading: false,
  error: null,
};

// Order slice
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    resetOrderState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    Object.entries(orderAsyncActions).forEach(([actionName, action]) => {
      builder
        .addCase(action.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(action.fulfilled, (state, { payload }) => {
          state.isLoading = false;
          state.error = null;

          // Handle the different actions
          if (actionName === "createOrder") {
            state.order = payload.order;
            state.clientSecret = payload.clientSecret; // Use clientSecret for Stripe payments
          } else if (actionName === "fetchOrderDetails") {
            state.order = payload.order;
          } else if (actionName === "fetchAllOrders") {
            state.orders = payload.orders;
          }
        })
        .addCase(action.rejected, (state, { payload }) => {
          state.isLoading = false;
          state.error = payload;
        });
    });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
