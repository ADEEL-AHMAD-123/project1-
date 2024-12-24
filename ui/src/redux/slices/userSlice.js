import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper function for creating async thunks
const createApiAsyncThunk = ({ name, method, url }) => {
  return createAsyncThunk(
    `user/${name}`,
    async ({ requestData, data }, { rejectWithValue }) => {
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
        console.log('Response:', response);

        // Display success toast
        if (response.data.message) {
          toast.success(response.data.message);
        }

        return response.data;
      } catch (error) {
        let errorMessage = "An unexpected error occurred.";
        let statusCode = 500;

        if (error.response) {
          // Server responded with a specific error
          statusCode = error.response.status;
          errorMessage = error.response.data.message || "An error occurred.";
        } else if (error.request) {
          // No response received
          errorMessage = "No response from server.";
        }

        return rejectWithValue({
          statusCode,
          message: errorMessage,
        });
      }
    }
  );
};

// Define all async actions
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
  verifyEmail: createApiAsyncThunk({
    name: "verifyEmail",
    method: "GET",
    url: "/auth/verify-email/",
  }),
  resendVerificationEmail: createApiAsyncThunk({
    name: "resendVerificationEmail",
    method: "POST",
    url: "/auth/resend-verification",
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
  isEmailVerified: false,
  hasBillingAccount: false,
  Team: [],
  Users: [],
  Role: null,
  isLoading: false,
  error: null,
  logoutSuccess: false,
  statusCode: null, 
  statusMessage: null, 
  unverifiedEmail: null, 
};

// Slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUserState: (state) => {
      return initialState;
    },
    clearError: (state) => {
      state.error = null;
  },
    storeUnverifiedEmail: (state, action) => {
      // Action to store unverified email
      state.unverifiedEmail = action.payload;
    },
    clearUnverifiedEmail: (state) => {
      state.unverifiedEmail = null;
    },
  },
  extraReducers: (builder) => {
    Object.entries(userAsyncActions).forEach(([actionName, action]) => {
      builder.addCase(action.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.statusCode = null;
        state.statusMessage = null;
      });

      builder.addCase(action.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.statusCode = payload.statusCode || 200;
        state.statusMessage = payload.message || "Success";

        if (payload && payload.user) {
          if (
            actionName === "loginUser" ||
            actionName === "getUserProfile" ||
            actionName === "update-SSH-Keys" ||
            actionName === "updateProfile"
          ) {
            state.User = payload.user;
            state.Role = payload.user.role;
            state.isEmailVerified = payload.user.isEmailVerified;
            state.hasBillingAccount = !!payload.user.hasBillingAccount;
            state.logoutSuccess = false;
          }
        } else if (actionName === "logoutUser") {
          state.logoutSuccess = true;
          state.User = null;
          state.hasBillingAccount = false;
          state.Role = null;
        } else if (actionName === "registerUser") {
          state.verified = false;
        } else if (actionName === "getTeam") {
          state.Team = payload.teamMembers;
        } else if (actionName === "getAllUsers") {
          state.Users = payload.users;
        } else if (actionName === "verifyEmail") {
          state.verified = payload.verified;
        }
      });

      builder.addCase(action.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload; // Store the full error payload 
        state.statusCode = payload?.statusCode || 500;
        state.statusMessage = payload?.message || "An error occurred.";
      });
    });
  },
});

export default userSlice.reducer;
export const { resetUserState, storeUnverifiedEmail, clearError,clearUnverifiedEmail } = userSlice.actions;
