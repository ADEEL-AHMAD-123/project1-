import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";



const BASE_URL = "http://localhost:8000/api/v1";

// Async Thunks
const createApiAsyncThunk = ({ name, method, url }) => {
  return createAsyncThunk(`product/${name}`, async ({ requestData, data }) => {
    try {
      const requestUrl = requestData
        ? `${BASE_URL}${url}${requestData}`
        : `${BASE_URL}${url}`;

      const requestOptions = {
        method,
        withCredentials: true,
        url: requestUrl,
        data,
      };
      console.log(requestUrl);

      const response = await axios(requestOptions);
      console.log(response);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  });
};

export const userAsyncActions = {
  loginUser: createApiAsyncThunk({
    name: "login",
    method: "POST",
    url: "/login",
  }),
  registerUser: createApiAsyncThunk({
    name: "register",
    method: "POST",
    url: "/register",
  }),
  getUserProfile: createApiAsyncThunk({
    name: "getProfile",
    method: "GET",
    url: "/profile",
  }),
  logoutUser: createApiAsyncThunk({
    name: "logout",
    method: "GET",
    url: "/logout",
  }),
  forgotPassword: createApiAsyncThunk({
    name: "forgotPassword",
    method: "POST",
    url: "/forgot-password",
  }),
  resetPassword: createApiAsyncThunk({
    name: "resetPassword",
    method: "POST",
    url: "/reset-password",
  }),
};

// Initial State
const initialState = {
  user: null,
  isLoading: false,
  error: null,
  logoutSuccess: false,
  
};

// Slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUserState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    Object.entries(userAsyncActions).forEach(([actionName, action]) => {
      builder.addCase(action.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });

      builder.addCase(action.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = false;
        if (
          actionName === "loginUser" ||
          actionName === "getUserProfile"
        ) {
          state.user = payload;
          state.logoutSuccess=false
        } else if (actionName === "logoutUser") {
          state.logoutSuccess = true;
        }
      });

      builder.addCase(action.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      });
    });
  },
});

export default userSlice.reducer;
export const { resetUserState } = userSlice.actions;