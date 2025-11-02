import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  pagination: {
    page: 1,
    totalPages: 1,
    limit: 8,
  },
  error: null,
  allProducts: []
};

// 🟢 Fetch all filtered + sorted + paginated products
export const fetchAllFilteredProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async ({ filterParams = {}, sortParams = "", page = 1, limit = 8 }) => {
    try {
      // Tạo query string rõ ràng hơn
      const query = new URLSearchParams({
        ...filterParams,
        sortBy: sortParams,
        page,
        limit,
      }).toString();

      const result = await axios.get(
        `http://localhost:5000/api/shop/products/get?${query}`
      );

      return result.data;
    } catch (error) {
      console.error("❌ Fetch products error:", error);
      throw error.response?.data || error.message;
    }
  }
);

// 🟢 Fetch single product details
export const fetchProductDetails = createAsyncThunk(
  "products/fetchProductDetails",
  async (id) => {
    try {
      const result = await axios.get(
        `http://localhost:5000/api/shop/products/get/${id}`
      );
      return result.data;
    } catch (error) {
      console.error("❌ Fetch product details error:", error);
      throw error.response?.data || error.message;
    }
  }
);



export const fetchAllProducts = createAsyncThunk(
  "shopProducts/fetchAllProducts",
  async () => {
    const res = await axios.get("http://localhost:5000/api/shop/products/all");
    return res.data.data;
  }
);





const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
    setAllProducts(state, action) {
      state.allProducts = action.payload;
    }

  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch list
      .addCase(fetchAllFilteredProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data || [];

        // ✅ Chỉ cập nhật if API có pagination
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
        state.error = action.error.message;
      })

      // ✅ Fetch product details
      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data || null;
        // ❌ KHÔNG được cập nhật pagination tại đây nữa!
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null;
        state.error = action.error.message;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.allProducts = action.payload;
      })

  }

});

export const { setProductDetails, setAllProducts } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;
