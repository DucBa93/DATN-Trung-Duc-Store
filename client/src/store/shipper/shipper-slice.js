import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Lấy thông tin tất cả shipper
export const fetchAllShippers = createAsyncThunk(
  "shipper/fetchAllShippers",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/shipper`);
      return res.data; // trả ra array
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

// Lấy thông tin shipper theo userId
export const fetchShipperInfo = createAsyncThunk(
  "shipper/fetchShipperInfo",
  async (userId, thunkAPI) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/shipper/${userId}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

// Cập nhật thông tin shipper
export const updateShipperInfo = createAsyncThunk(
  "shipper/updateShipperInfo",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/admin/shipper/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

const shipperSlice = createSlice({
  name: "shipper",
  initialState: {
    list: [],        // <-- thêm list
    info: null,
    loading: false,
    error: null,
    successMessage: "",
  },
  reducers: {
    clearShipperState: (state) => {
      state.error = null;
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder

      // fetchAllShippers
      .addCase(fetchAllShippers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllShippers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllShippers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchShipperInfo
      .addCase(fetchShipperInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipperInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.info = action.payload;
      })
      .addCase(fetchShipperInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateShipperInfo
      .addCase(updateShipperInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShipperInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.info = action.payload;
        state.successMessage = "Updated successfully";
      })
      .addCase(updateShipperInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearShipperState } = shipperSlice.actions;
export default shipperSlice.reducer;
