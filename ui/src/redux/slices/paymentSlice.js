// src/redux/slices/paymentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { orderAsyncActions } from './orderSlice'; // To dispatch order confirmation after payment

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper function to create async thunks
const createApiAsyncThunk = ({ name, method, url }) => {
  return createAsyncThunk(`payment/${name}`, async ({ requestData, data }, { dispatch }) => {
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

      // After successful payment, confirm the order
      if (name === "makePayment") {
        dispatch(orderAsyncActions.confirmOrder({ requestData: requestData }));
      }

      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
      throw error.response?.data?.message || 'An error occurred';
    }
  });
};

export const paymentAsyncActions = {
  makePayment: createApiAsyncThunk({
    name: "makePayment",
    method: "POST",
    url: "/payments/",
  }),
};

const initialState = {
  paymentStatus: null,
  isLoading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    Object.entries(paymentAsyncActions).forEach(([actionName, action]) => {
      builder.addCase(action.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });
      builder.addCase(action.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        if (actionName === "makePayment") {
          state.paymentStatus = 'success';
        }
      });
      builder.addCase(action.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
        state.paymentStatus = 'failed';
      });
    });
  },
});

export default paymentSlice.reducer;
export const { resetPaymentState } = paymentSlice.actions;
