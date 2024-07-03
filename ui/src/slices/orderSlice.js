import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = "http://localhost:8000/api/v1";

const getTokenFromCookies = () => {
  return document.cookie.replace(
    /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
    "$1"
  );
};

const createApiAsyncThunk = ({ name, method, url }) => {
  return createAsyncThunk(`orders/${name}`, async (data) => {
    try {
      const token = getTokenFromCookies();
      console.log(token,'uyu');
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const requestOptions = {
        method,
        withCredentials: true,
        url: `${BASE_URL}${url}`,
        headers,
        data: data ? data : undefined, 
      };
      const response = await axios(requestOptions);

      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      console.log(error);
      toast.error(`Failed to ${method} ${url}`);
      throw error;
    }
  });
};

export const orderAsyncActions = {
  createNewOrder: createApiAsyncThunk({
    name: "createNewOrder",
    method: "POST",
    url: "/order/new",
  }),

  fetchSingleOrder: createApiAsyncThunk({
    name: "fetchSingleOrder",
    method: "GET",
    url: "/Orders", // Update the URL as per your endpoint 
  }),

  fetchMyOrders: createApiAsyncThunk({
    name: "fetchMyOrders",
    method: "GET",
    url: "/Orders/myOrders", // Update the URL as per your endpoint
  }),

  fetchAllOrders: createApiAsyncThunk({
    name: "fetchAllOrders",
    method: "GET",
    url: "/Orders/allOrders", // Update the URL as per your endpoint
  }),

  updateOrderStatus: createApiAsyncThunk({
    name: "updateOrderStatus",
    method: "PUT",
    url: "/Orders", // Update the URL as per your endpoint
  }),

  deleteOrder: createApiAsyncThunk({
    name: "deleteOrder",
    method: "DELETE",
    url: "/Orders", // Update the URL as per your endpoint
  }),
};

const initialState = {
  order: null,
  orders: [], // Initialize orders array with persisted data if available
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    resetOrderState: (state) => {
      return initialState;
    },
  } ,
  extraReducers: (builder) => {
    Object.entries(orderAsyncActions).forEach(([actionName, action]) => {
      builder.addCase(action.pending, (state) => {
        state.isLoading = true;
      });

      builder.addCase(action.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        if (
          actionName === "fetchMyOrders" ||
          actionName === "fetchAllOrders" ||
          actionName === "getUserProfile"
        ) {
          state.orders = payload;
        } else if (actionName === "fetchSingleOrder"  || "createNewOrder" ) {
          state.order = payload
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