import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper function to create async thunks
const createApiAsyncThunk = ({ name, method, url }) => {
  return createAsyncThunk(`vendor/${name}`, async ({ requestData, data }) => {
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
      console.log(response.data);
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
      throw error.response.data.message;
    }
  });
};

export const vendorAsyncActions = {
  createVendor: createApiAsyncThunk({
    name: "create-vendor",
    method: "POST",
    url: "/vendors/create",
  }),
  getVendors: createApiAsyncThunk({
    name: "get-all-vendors",
    method: "GET",
    url: "/vendors",
  }),
  updateVendor: createApiAsyncThunk({
    name: "update-vendor",
    method: "PUT",
    url: "/vendors/",
  }),
  deleteVendor: createApiAsyncThunk({
    name: "delete-vendor",
    method: "DELETE",
    url: "/vendors/",
  }),
  getVendorDetails: createApiAsyncThunk({
    name: "get-vendor-details",
    method: "GET",
    url: "/vendors/",
  }),
};

const initialState = {
  Vendors: [],
  isLoading: false,
  error: null,
  VendorDetails: null,
};

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    resetVendorState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    Object.entries(vendorAsyncActions).forEach(([actionName, action]) => {
      builder.addCase(action.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });

      builder.addCase(action.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = false;
        if (payload && payload.vendors) {
          if (actionName === "getVendors" || actionName === "updateVendor") {
            state.Vendors = payload.vendors;
          }
        } else if (actionName === "getVendorDetails") {
          state.VendorDetails = payload.vendor;
        }
      });

      builder.addCase(action.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      });
    });
  },
});

export default vendorSlice.reducer;
export const { resetVendorState } = vendorSlice.actions;
