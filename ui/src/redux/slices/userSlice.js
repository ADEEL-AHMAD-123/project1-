import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = "http://localhost:8000/api/v1";

// Async Thunks
const createApiAsyncThunk = ({ name, method, url }) => {
  return createAsyncThunk(`user/${name}`, async ({ requestData, data }) => {
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
      console.log(error);
      throw error.response.data.message; 
    }
  });
};

export const userAsyncActions = {
  loginUser: createApiAsyncThunk({
    name: "login",
    method: "POST",
    url: "/auth/login",
  }),
  registerUser: createApiAsyncThunk({
    name: "register",
    method: "POST",
    url: "/auth/register",
  }),
  getUserProfile: createApiAsyncThunk({
    name: "getProfile",
    method: "GET",
    url: "/user/profile",
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
  updateProfile: createApiAsyncThunk({
    name: "updateProfile",
    method: "PUT",
    url: "/user/profile",
  }),
};

// Initial State
const initialState = {
  User: null,
  Role: null,
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
        if (payload && payload.user) {
          if (
            actionName === "loginUser" ||
            actionName === "getUserProfile" ||
            actionName === "updateProfile"
          ) {
            state.User = payload.user;
            state.Role = payload.user.role;
            state.logoutSuccess = false;
          }
        } else if (actionName === "logoutUser") {
          state.logoutSuccess = true;
          state.User = null; // Reset user on logout
          state.Role = null; // Reset role on logout
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
