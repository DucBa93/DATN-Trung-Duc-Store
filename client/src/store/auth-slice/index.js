import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const userFromStorage = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

const initialState = {
    isAuthenticated: !!userFromStorage,
    isLoading: false,
    user: userFromStorage,
};

export const registerUser = createAsyncThunk("/auth/register", async (formData) => {
    const response = await axios.post("https://datn-trung-duc-store.onrender.com/api/auth/register", formData, { withCredentials: true });
    return response.data;
});

export const loginUser = createAsyncThunk("/auth/login", async (formData) => {
    const response = await axios.post("https://datn-trung-duc-store.onrender.com/api/auth/login", formData, { withCredentials: true });
    return response.data;
});

export const checkAuth = createAsyncThunk("/auth/check-auth", async () => {
    const response = await axios.get("https://datn-trung-duc-store.onrender.com/api/auth/check-auth", {
        withCredentials: true,
        headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        }
    });
    return response.data;
});

export const logoutUser = createAsyncThunk("/auth/logout", async () => {
    const response = await axios.post("https://datn-trung-duc-store.onrender.com/api/auth/logout", {}, { withCredentials: true });
    return response.data;
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        updateUserDataRedux: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            } else {
                state.user = action.payload;
            }
            localStorage.setItem("user", JSON.stringify(state.user));
        },
        resetAuthState: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            localStorage.removeItem("user");
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(registerUser.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;

                if (action.payload.success) {
                    state.user = action.payload.user;
                    state.isAuthenticated = true;
                    localStorage.setItem("user", JSON.stringify(action.payload.user));
                } else {
                    state.user = null;
                    state.isAuthenticated = false;
                }
            })
            .addCase(loginUser.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(checkAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.success) {
                    // ✅ Giữ nguyên avatar cũ nếu API không trả về
                    state.user = { ...state.user, ...action.payload.user };
                    state.isAuthenticated = true;
                    localStorage.setItem("user", JSON.stringify(state.user));
                } else {
                    state.user = null;
                    state.isAuthenticated = false;
                }
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            })
        .addCase(logoutUser.fulfilled, (state) => {
            state.isLoading = false;
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem("user");
        });
}
});

export const { setUser, updateUserDataRedux, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
