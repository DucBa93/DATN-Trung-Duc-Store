import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (userId, thunkAPI) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/${userId}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    list: [],
    loading: false,
  },
  reducers: {
    markAllRead: (state) => {
      state.list = state.list.map((n) => ({ ...n, isRead: true }));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { markAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;
