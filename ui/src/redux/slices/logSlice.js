import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper function to create async thunks
const createApiAsyncThunk = ({ name, method, url }) => {
  return createAsyncThunk(`log/${name}`, async ({ requestData, data }) => {
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
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      throw error.response.data.message;
    }
  });
};

export const logAsyncActions = {
  getAllLogs: createApiAsyncThunk({
    name: "get-all-logs",
    method: "GET",
    url: "/log",
  }),
  getLogDetails: createApiAsyncThunk({
    name: "get-log-details",
    method: "GET",
    url: "/logs/",
  }),
  deleteLog: createApiAsyncThunk({
    name: "delete-log",
    method: "DELETE",
    url: "/logs/",
  }),
};
const initialState = {
    logs: [],
    isLoading: false,
    error: null,
    logDetails: null,
    totalLogs: 0,
    totalPages: 0,
    currentPage: 1,
  };
  
  const logSlice = createSlice({
    name: "log",
    initialState,
    reducers: {
      resetLogState: (state) => {
        return initialState;
      },
    },
    extraReducers: (builder) => {
      Object.entries(logAsyncActions).forEach(([actionName, action]) => {
        builder.addCase(action.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        });
  
        builder.addCase(action.fulfilled, (state, { payload }) => {
          state.isLoading = false;
          state.error = null;
          if (payload && payload.logs) {
            if (actionName === "getAllLogs") {
              state.logs = payload.logs;
              state.totalLogs = payload.totalLogs;
              state.totalPages = payload.totalPages;
              state.currentPage = payload.currentPage;
            }
          } else if (actionName === "getLogDetails") {
            state.logDetails = payload.log;
          }
        });
  
        builder.addCase(action.rejected, (state, { error }) => {
          state.isLoading = false;
          state.error = error.message;
        });
      });
    },
  });
  
  export default logSlice.reducer;
  export const { resetLogState } = logSlice.actions;
  