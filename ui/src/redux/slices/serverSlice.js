import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper function to create async thunks
const createApiAsyncThunk = ({ name, method, url }) => {
  return createAsyncThunk(`server/${name}`, async ({ requestData, data }) => {
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

export const serverAsyncActions = {
  createServer: createApiAsyncThunk({
    name: "create-server",
    method: "POST",
    url: "/servers/create",
  }),
  getAllServers: createApiAsyncThunk({
    name: "get-all-servers-admin",
    method: "GET",
    url: "/servers",
  }),
  getUserServers: createApiAsyncThunk({
    name: "get-all-servers-user",
    method: "GET",
    url: "/servers/user",
  }),
  updateServer: createApiAsyncThunk({
    name: "update-server",
    method: "PUT",
    url: "/servers/",
  }),
  deleteServer: createApiAsyncThunk({
    name: "delete-server",
    method: "DELETE",
    url: "/servers/",
  }),
  getServerDetails: createApiAsyncThunk({
    name: "get-server-details",
    method: "GET",
    url: "/servers/",
  }),
};

const initialState = {
    Servers: [],
    isLoading: false,
    error: null,
    ServerDetails:null,
    pagination: null,
  };

  const serverSlice = createSlice({
    name: "server",
    initialState,
    reducers: {
      resetServerState: (state) => {
        return initialState;
      },
    },
    extraReducers: (builder) => {
      Object.entries(serverAsyncActions).forEach(([actionName, action]) => {
        builder.addCase(action.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        });
  
        builder.addCase(action.fulfilled, (state, { payload }) => {
          state.isLoading = false;
          state.error = false;
          if (payload && payload.servers) {
            if (actionName === "getAllServers") {
              state.Servers = payload.servers;
              state.pagination = payload.pagination;
            }
            if (actionName === "getUserServers") {
              state.Servers = payload.servers;
              state.pagination = payload.pagination;
            }
          } else if (actionName === "getServerDetails" ) {
            state.ServerDetails = payload.server
            
          } 
        });
  
        builder.addCase(action.rejected, (state, { error }) => {
          state.isLoading = false;
          state.error = error.message;
        });
      });
    },
  });
  
  export default serverSlice.reducer;
  export const { resetServerState } = serverSlice.actions;
    