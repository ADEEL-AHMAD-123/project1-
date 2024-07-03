// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const BASE_URL = 'http://localhost:8000/api/v1';

// const getTokenFromCookies = () => {
//   return document.cookie.replace(
//     /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
//     '$1'
//   );
// };


// const createApiAsyncThunk = ({ name, method, url }) => {
//   return createAsyncThunk(`reviews/${name}`, async (data) => {
//     try {
//       const token = getTokenFromCookies();
//       const headers = {};
//       if (token) {
//         headers.Authorization = `Bearer ${token}`;
//       }

//       const requestOptions = {
//         method,
//         withCredentials: true,
//         url: `${BASE_URL}${url}`,
//         headers,
//         data: data ? data : undefined,
//       };

//       const response = await axios(requestOptions);

//       toast.success(response.data.message);
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       toast.error(`Failed to ${method} ${url}`);
//       throw error;
//     }
//   });
// };


// export const reviewAsyncActions = {
//   fetchReviewsByProductId: createApiAsyncThunk({
//     name: 'fetchReviewsByProductId',
//     method: 'GET',
//     url: '/reviews',
//   }),
//   createProductReview: createApiAsyncThunk({
//     name: 'createProductReview',
//     method: 'PUT',
//     url: '/review',
//   }),
//   deleteProductReview: createApiAsyncThunk({
//     name: 'deleteProductReview',
//     method: 'DELETE',
//     url: '/reviews',
//   }),
// };

// const initialState = {
//   reviews: [],
//   isLoading: false,
//   error: null,
// };

// const reviewSlice = createSlice({
//   name: 'reviews',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     Object.values(reviewAsyncActions).forEach((action) => {
//       builder
//         .addCase(action.pending, (state) => {
//           state.isLoading = true;
//           state.error = null;
//         })
//         .addCase(action.fulfilled, (state, { payload }) => {
//           state.isLoading = false;
//           if (action.type === reviewAsyncActions.fetchReviewsByProductId.fulfilled.type) {
//             state.reviews = payload;
//           } else if (action.type === reviewAsyncActions.createProductReview.fulfilled.type) {
//             state.reviews.push(payload);
//           } else if (action.type === reviewAsyncActions.deleteProductReview.fulfilled.type) {
//             state.reviews = state.reviews.filter((review) => review._id !== payload);
//           }
//         })
//         .addCase(action.rejected, (state, { error }) => {
//           state.isLoading = false;
//           state.error = error.message;
//         });
//     });
//   },
// });

// export default reviewSlice.reducer;
