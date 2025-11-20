import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🟢 Lấy toàn bộ coupon
export const fetchAllCoupons = createAsyncThunk(
  "coupons/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/coupons");
      return response.data.coupons;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi khi tải mã giảm giá");
    }
  }
);

// 🟢 Random gift coupon cho user
export const fetchGiftCoupons = createAsyncThunk(
  "coupons/fetchGiftCoupons",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/coupons/random-gift", { userId });
      return res.data.success ? res.data.coupons : [];
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi khi nhận coupon gift");
    }
  }
);


// 🟢 Tạo coupon mới
export const createCoupon = createAsyncThunk(
  "coupons/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/coupons/create", data);
      return res.data.coupon;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi khi tạo mã");
    }
  }
);

// 🟢 Cập nhật coupon (Admin)
export const updateCoupon = createAsyncThunk(
  "coupons/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/coupons/update/${id}`, data);
      return res.data.coupon;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi khi cập nhật mã");
    }
  }
);

// 🟢 Xóa coupon
export const deleteCoupon = createAsyncThunk(
  "coupons/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/coupons/delete/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi khi xóa mã");
    }
  }
);

// 🟢 Áp dụng coupon
export const applyCouponBackend = createAsyncThunk(
  "coupons/apply",
  async (code, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/coupons/apply", { code });
      return res.data.coupon;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Mã không hợp lệ hoặc đã hết lượt");
    }
  }
);

const couponSlice = createSlice({
  name: "coupons",
  initialState: {
    list: [],
    appliedCoupon: null,
    giftCoupons: [], // ✅ Thêm state quản lý coupon gift
    isLoading: false,
    error: null,
  },
  reducers: {
    applyCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
    },
    setGiftCoupons: (state, action) => {
    state.giftCoupons = action.payload; // lưu vào Redux để không random lại
    },
    resetCoupons: (state) => {
      state.list = [];
      state.appliedCoupon = null;
      state.giftCoupons = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Lấy toàn bộ coupon
      .addCase(fetchAllCoupons.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      // ✅ Tạo coupon mới
      .addCase(createCoupon.fulfilled, (state, action) => {
        const coupon = action.payload;
        if (coupon && coupon._id) state.list.unshift(coupon);
      })
      // ✅ Xóa coupon
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c._id !== action.payload);
      })
      // ✅ Cập nhật coupon
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.list = state.list.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
      })
      // ✅ Apply coupon
      .addCase(applyCouponBackend.fulfilled, (state, action) => {
        const updatedCoupon = action.payload;
        state.list = state.list.map((c) =>
          c._id === updatedCoupon._id ? updatedCoupon : c
        );
        state.appliedCoupon = updatedCoupon;
      })
      .addCase(applyCouponBackend.rejected, (state, action) => {
        state.error = action.payload;
      })
      // ✅ Lấy coupon gift
      .addCase(fetchGiftCoupons.fulfilled, (state, action) => {
        console.log("🎁 Gift coupons API trả về:", action.payload);
        state.giftCoupons = action.payload || [];
      })
      .addCase(fetchGiftCoupons.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { applyCoupon, removeCoupon, setGiftCoupons, resetCoupons  } = couponSlice.actions;
export default couponSlice.reducer;
