import axios from "axios";

const instance = axios.create({
  baseURL: "https://datn-trung-duc-store.onrender.com", // backend của bạn
  withCredentials: true,
});
// Thêm token vào request (nếu có)
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi chung
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
