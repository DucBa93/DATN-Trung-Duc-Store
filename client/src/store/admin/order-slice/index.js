import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  orderList: [],
  orderDetails: null,
  isLoading: false,
  error: null,
};

// 🟢 Lấy tất cả đơn hàng
export const getAllOrdersForAdmin = createAsyncThunk(
  "adminOrder/getAllOrdersForAdmin",
  async () => {
    const response = await axios.get(
      "http://localhost:5000/api/admin/orders/get"
    );
    return response.data;
  }
);

// 🟢 Lấy chi tiết đơn hàng
export const getOrderDetailsForAdmin = createAsyncThunk(
  "adminOrder/getOrderDetailsForAdmin",
  async (id) => {
    const response = await axios.get(
      `http://localhost:5000/api/admin/orders/details/${id}`
    );
    return response.data;
  }
);

// 🟢 Cập nhật trạng thái đơn hàng
export const updateOrderStatus = createAsyncThunk(
  "adminOrder/updateOrderStatus",
  async ({ id, orderStatus }) => {
    const response = await axios.put(
      `http://localhost:5000/api/admin/orders/update/${id}`,
      { orderStatus }
    );
    return response.data;
  }
);

// 🟢 Xóa đơn hàng
export const deleteOrderForAdmin = createAsyncThunk(
  "adminOrder/deleteOrderForAdmin",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/admin/orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Xoá thất bại" });
    }
  }
);


// 🧩 Slice
const adminOrderSlice = createSlice({
  name: "adminOrder",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Get all orders
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })

      // 🔹 Get order details
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })

      // 🔹 Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateOrderStatus.rejected, (state) => {
        state.isLoading = false;
      })

      // 🔹 Delete order
      .addCase(deleteOrderForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteOrderForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        // Xóa order đã bị xóa ra khỏi danh sách hiện tại
        state.orderList = state.orderList.filter(
          (order) => order._id !== action.meta.arg
        );
      })
      .addCase(deleteOrderForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Không thể xóa đơn hàng!";
      });
  },
});

export const { resetOrderDetails } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;
