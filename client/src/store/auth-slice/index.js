import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

//Slice = 1 "miếng" state + reducer + action liên quan đến tính năng.
// slice: Auth ==> Quan ly trang thai dang nhap

const initialState = {
    isAuthenticated: false, // chưa đăng nhập
    isLoading: true,       // trạng thái loading khi gọi API login/logout
    user: null              // thông tin người dùng sau khi login
}



export const registerUser = createAsyncThunk(
    "/auth/register",

    async (formData) => {
        const response = await axios.post(
            "http://localhost:5000/api/auth/register",
            formData,
            {
                withCredentials: true,
            }
        );

        return response.data;
    }
);

export const loginUser = createAsyncThunk(
    "/auth/login",

    async (formData) => {
        const response = await axios.post(
            "http://localhost:5000/api/auth/login",
            formData,
            {
                withCredentials: true,
            }
        );

        return response.data;
    }
);

export const checkAuth = createAsyncThunk(
    "/auth/check-auth",

    async () => {
        const response = await axios.get(
            "http://localhost:5000/api/auth/check-auth",
            {
                withCredentials: true,
                headers: {
                    "Cache-Control":
                        "no-store, no-cache, must-revalidate, proxy-revalidate",
                }
            },

        );

        return response.data;
    }
);

export const logoutUser = createAsyncThunk(
    "/auth/logout",

    async () => {
        const response = await axios.post(
            "http://localhost:5000/api/auth/logout",
            {},
            {
                withCredentials: true,
            }
        );

        return response.data;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            //khi gọi action này, nó sẽ: Cập nhật thông tin user từ payload + Gán isAuthenticated = true nếu có user.
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.success ? action.payload.user : null;
                state.isAuthenticated = action.payload.success ? true : false;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(checkAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.success ? action.payload.user : null;
                state.isAuthenticated = action.payload.success ? true : false;
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(logoutUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            });
    }
})

export const { setUser } = authSlice.actions
export default authSlice.reducer