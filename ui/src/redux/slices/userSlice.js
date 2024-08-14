import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
      console.log(response);
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
    method: "POST",
    url: "/user/logout",
  }),
  forgotPassword: createApiAsyncThunk({
    name: "forgotPassword",
    method: "POST",
    url: "/forgot-password",
  }),
  updatePassword: createApiAsyncThunk({
    name: "updatePassword",
    method: "PUT",
    url: "/user/password",
  }),
  updateProfile: createApiAsyncThunk({
    name: "updateProfile",
    method: "PUT",
    url: "/user/profile",
  }),
  updateSSH: createApiAsyncThunk({
    name: "update-SSH-Keys",
    method: "PUT",
    url: "/user/ssh-keys",
  }),
  getTeam: createApiAsyncThunk({
    name: "get-team-members",
    method: "GET",
    url: "/user/team",
  }),
  getAllUsers: createApiAsyncThunk({
    name: "get-All-Users",
    method: "GET",
    url: "/user/users",
  }),
};

// Initial State
const initialState = {
  User: null,
  BillingAccount: null, // Add BillingAccount to initial state
  Team: [],
  Users: [],
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
        state.error = null;
        if (payload && payload.user) {
          if (
            actionName === "loginUser" ||
            actionName === "getUserProfile" ||
            actionName === "update-SSH-Keys" ||
            actionName === "updateProfile"
          ) {
            state.User = payload.user;
            state.Role = payload.user.role;
            state.BillingAccount = payload.billingAccount || null;
            state.logoutSuccess = false;

          }
        } else if (actionName === "logoutUser") {
          state.logoutSuccess = true;
          state.User = null; 
          state.BillingAccount = null; // Clear BillingAccount on logout
          state.Role = null; 
        } else if (actionName === "getTeam") {
          state.Team = payload.teamMembers;
        } else if (actionName === "getAllUsers") {
          state.Users = payload.users;
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
