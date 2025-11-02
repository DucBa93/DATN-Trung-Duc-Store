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


export const registerUser = createAsyncThunk(
    "/auth/register",
    async (formData) => {
        const response = await axios.post(
            "http://localhost:5000/api/auth/register",
            formData,
            { withCredentials: true }
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
            { withCredentials: true }
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
            { withCredentials: true }
        );
        return response.data;
    }
);

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
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(registerUser.fulfilled, (state) => {
                console.log("Login payload:", action.payload);
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
                state.user = action.payload.success ? action.payload.user : null;
                state.isAuthenticated = !!action.payload.success;
                if (action.payload.success) {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
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
                state.user = action.payload.success ? action.payload.user : null;
                state.isAuthenticated = !!action.payload.success;
                if (action.payload.success) {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
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
            });
    }
});

export const { setUser, updateUserDataRedux } = authSlice.actions;
export default authSlice.reducer;
