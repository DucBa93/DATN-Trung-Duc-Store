import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


// GET USER INFO
export const fetchUserInfo = createAsyncThunk(
    "user/fetchUserInfo",
    async () => {
        const res = await axios.get(`http://localhost:5000/api/shop/user/:userId`, {
            withCredentials: true,
        });
        return res.data.user;
    }
);


// UPDATE USER INFO
export const updateUserInfo = createAsyncThunk(
    "user/updateUserInfo",
    async (formData) => {
        const res = await axios.put(`http://localhost:5000/api/shop/user/update`, formData, {
            withCredentials: true,
        });
        return res.data.user;
    }
);

const userSlice = createSlice({
    name: "user",
    initialState: {
        user: null,
        loading: false,
        error: null,
    },
    reducers: {
        logoutUser: (state) => {
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // GET USER
            .addCase(fetchUserInfo.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchUserInfo.rejected, (state) => {
                state.loading = false;
                state.error = "Failed to load user info";
            })

            // UPDATE USER
            .addCase(updateUserInfo.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUserInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload; // update ngay trên UI
                localStorage.setItem("user", JSON.stringify(state.user));
            })
            .addCase(updateUserInfo.rejected, (state) => {
                state.loading = false;
                state.error = "Failed to update user info";
            })
            

    },
});

export const { logoutUser } = userSlice.actions;
export default userSlice.reducer;
