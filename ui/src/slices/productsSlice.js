import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = "http://localhost:8000/api/v1";

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
      console.log(error, url);

      toast.error(`Failed to ${method} ${url}`);
      throw error;
    }
  });
};

export const productAsyncActions = {
  fetchProducts: createApiAsyncThunk({
    name: "fetchAll",
    method: "GET",
    url: "/products",
  }),

  fetchSuggestions: createApiAsyncThunk({
    name: "fetchSuggestions",
    method: "GET",
    url: "/products",
  }),

  createProduct: createApiAsyncThunk({
    name: "create",
    method: "POST",
    url: "/admin/product/new",
  }),
  updateProduct: createApiAsyncThunk({
    name: "update",
    method: "PUT",
    url: ({ productId }) => `/Products/${productId}`,
  }),
  deleteProduct: createApiAsyncThunk({
    name: "delete",
    method: "DELETE",
    url: ({ productId }) => `/Products/${productId}`,
  }),
  getProductDetails: createApiAsyncThunk({
    name: "getDetails",
    method: "GET",
    url: `/Product`,
  }),
  createProductReview: createApiAsyncThunk({
    name: "createReview",
    method: "PUT",
    url: "/review",
  }),
  deleteReview: createApiAsyncThunk({
    name: "deleteReview",
    method: "DELETE",
    url: ({ productId, reviewId }) =>
      `/Products/${productId}/reviews/${reviewId}`,
  }),
  getAdminProducts: createApiAsyncThunk({
    name: "getAdminProducts",
    method: "GET",
    url: "/Admin/Products",
  }),
};

// Slice
const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    suggestions: [],
    isLoading: false,
    error: null,
    selectedProduct: null,
    adminProducts: [],
    productReviews: [],
    resultPerPage: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    Object.entries(productAsyncActions).forEach(([actionName, action]) => {
      builder.addCase(action.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });

      builder.addCase(action.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        if (actionName === "getProductDetails") {
          state.selectedProduct = payload;
        } else if (actionName === "getAdminProducts") {
          state.adminProducts = payload;
        } else if (actionName === "fetchSuggestions") {
          state.suggestions = payload.products;
        } else if (actionName === "fetchAll") {
          console.log("pload", payload);
          state.products = payload.products;
          state.resultPerPage = payload.resultPerPage;
        } else {
          state.products = payload.products;
          state.totalProducts = payload.totalProducts;
          state.resultPerPage = payload.resultPerPage;
        }
      });

      builder.addCase(action.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      });
    });
  },
});

export default productSlice.reducer;
