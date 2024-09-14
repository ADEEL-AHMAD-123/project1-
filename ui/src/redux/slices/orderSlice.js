// src/redux/slices/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper function to create async thunks
const createApiAsyncThunk = ({ name, method, url }) => {
  return createAsyncThunk(`order/${name}`, async ({ requestData, data }) => {
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

export const orderAsyncActions = {
  createOrder: createApiAsyncThunk({
    name: "createOrder",
    method: "POST",
    url: "/orders",
  }),
  fetchOrderSummary: createApiAsyncThunk({
    name: "fetchOrderSummary",
    method: "GET",
    url: "/orders/",
  }),
  confirmOrder: createApiAsyncThunk({
    name: "confirmOrder",
    method: "PUT",
    url: "/orders/",
  }),
};

const initialState = {
  order: null,
  isLoading: false,
  error: null,
};

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
      builder.addCase(action.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });
      builder.addCase(action.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        if (payload && actionName === "fetchOrderSummary") {
          state.order = payload.order;
        }
      });
      builder.addCase(action.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      });
    });
  },
});

export default orderSlice.reducer;
export const { resetOrderState } = orderSlice.actions;
