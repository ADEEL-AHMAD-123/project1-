// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { toast } from 'react-toastify';
// import axios from 'axios';

// // Helper function to get the authentication token from cookies
// const getTokenFromCookies = () => {
//   return document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1');
// };

// // Helper function to get the user from localStorage
// const getUserFromLocalStorage = () => {
//   const user = localStorage.getItem('user');
//   return user ? JSON.parse(user) : null;
// };

// // Async thunk for user login
// export const loginUser = createAsyncThunk('user/login', async (userData, { rejectWithValue }) => {
//   try {
//     const response = await axios.post('http://localhost:8000/api/v1/login', userData);
//     console.log('Login success:', response.data);

//     const token = response.data.token;

//     document.cookie = `token=${token}; path=/; max-age=3600;`;

//     toast.success('Login successful');

//     // Store user in localStorage
//     localStorage.setItem('user', JSON.stringify(response.data.user));

//     // Return the user data as the payload for success
//     return response.data.user;
//   } catch (error) {
//     toast.error(error.response.data.message);
//     return rejectWithValue(error.response?.data?.message || 'An error occurred during login');
//   }
// });

// // Async thunk for user registration
// export const registerUser = createAsyncThunk('user/register', async (userData, { rejectWithValue }) => {
//   try {
//     const response = await axios.post('http://localhost:8000/api/v1/register', userData);
//     console.log('Registration success:', response.data);
//     toast.success('Registration successful');

//     // Store user in localStorage
//     localStorage.setItem('user', JSON.stringify(response.data.user));

//     // Return the user data as the payload for success
//     return response.data.user;
//   } catch (error) {
//     toast.error(error.response.data.message);
//     return rejectWithValue(error.response?.data?.message || 'An error occurred during registration');
//   }
// });

// // Async thunk for getting user profile
// export const getUserProfile = createAsyncThunk('user/getProfile', async (_, { rejectWithValue }) => {
//   try {
//     const token = getTokenFromCookies();
//     if (!token) {
//       throw new Error('Authentication token not found in cookies');
//     }

//     const axiosInstance = axios.create({
//       baseURL: 'http://localhost:8000/api/v1',
//       withCredentials: true,
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const response = await axiosInstance.get('/me');
//     console.log('Profile fetched:', response.data);

//     // Store user in localStorage
//     localStorage.setItem('user', JSON.stringify(response.data));

//     return response.data;
//   } catch (error) {
//     return rejectWithValue(error.response?.data?.message || 'An error occurred while fetching profile');
//   }
// });

// // Async thunk for user logout
// export const logoutUser = createAsyncThunk('user/logout', async (_, { rejectWithValue }) => {
//   try {
//     const token = getTokenFromCookies();
//     if (!token) {
//       throw new Error('Authentication token not found in cookies');
//     }

//     const axiosInstance = axios.create({
//       baseURL: 'http://localhost:8000/api/v1',
//       withCredentials: true,
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     await axiosInstance.post('/logout');
//     // Clear the authentication token from cookies
//     document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

//     // Clear user from localStorage
//     localStorage.removeItem('user');

//     return null;
//   } catch (error) {
//     return rejectWithValue(error.response?.data?.message || 'An error occurred during logout');
//   }
// });

// // Async thunk for password reset
// export const forgotPassword = createAsyncThunk('user/forgotPassword', async (email, { rejectWithValue }) => {
//   try {
//     const response = await axios.post('http://localhost:8000/api/v1/password/forgot', { email });
//     console.log('Forgot Password success:', response.data);
//     toast.success('Password reset link sent successfully');
//   } catch (error) {
//     return rejectWithValue(error.response?.data?.message || 'An error occurred during password reset');
//   }
// });

// // Async thunk for reset password
// export const resetPassword = createAsyncThunk('user/resetPassword', async ({ token, newPassword, confirmPassword }, { rejectWithValue }) => {
//   try {
//     const response = await axios.put(`http://localhost:8000/api/v1/password/reset/${token}`, { password: newPassword, confirmPassword });
//     console.log('Reset Password success:', response.data);
//     toast.success('Password reset successfully');

//     // Optionally, you may want to handle login after password reset
//     // dispatch(loginUser({ email, password: newPassword }));

//     return response.data.user;
//   } catch (error) {
//     console.log(error);

//     return rejectWithValue(error.response?.data?.message || 'An error occurred during password reset');
//   }
// });

// const initialState = {
//   user: getUserFromLocalStorage(), // Initialize user from localStorage
//   isLoading: false,
//   error: null,
//   profile: null,
// };

// const userSlice = createSlice({
//   name: 'user',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(loginUser.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.user = action.payload;
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })
//       .addCase(registerUser.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(registerUser.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.user = action.payload;
//       })
//       .addCase(registerUser.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })
//       .addCase(getUserProfile.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(getUserProfile.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.profile = action.payload;
//       })
//       .addCase(getUserProfile.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })
//       .addCase(logoutUser.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(logoutUser.fulfilled, (state) => {
//         state.isLoading = false;
//         state.user = null;
//       })
//       .addCase(logoutUser.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })
//       .addCase(forgotPassword.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(forgotPassword.fulfilled, (state) => {
//         state.isLoading = false;
//       })
//       .addCase(forgotPassword.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })
//       .addCase(resetPassword.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(resetPassword.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.user = action.payload;
//       })
//       .addCase(resetPassword.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export default userSlice.reducer;
