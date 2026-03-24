import axios from "axios";

// ✅ SỬ DỤNG RENDER PRODUCTION URL
const axiosClient = axios.create({
    baseURL: "https://cafe-management-be-5flk.onrender.com/api",
});

// 🔐 Interceptor để tự động thêm JWT token vào mỗi request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 🔧 Interceptor để xử lý response errors
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("⚠️ Session expired. Please login again.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("username");

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;