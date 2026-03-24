import axios from "axios";

// ✅ SỬ DỤNG RENDER PRODUCTION URL
const BASE_URL = "https://cafe-management-be-5flk.onrender.com";
const API_URL = `${BASE_URL}/api`;
const UPLOAD_URL = `${BASE_URL}/uploads`;

function getToken() {
    return localStorage.getItem("token");
}

function getCurrentUser() {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
}

async function callApi(endpoint, method = "GET", data = null) {
    const token = getToken();

    const headers = {
        Authorization: token ? `Bearer ${token}` : "",
    };

    if (!(data instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    try {
        const response = await axios({
            method,
            url: `${API_URL}/${endpoint}`,
            data,
            headers,
        });
        return response;
    } catch (error) {
        console.error("🔴 API Error:", {
            endpoint,
            method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        });

        if (error.response?.status === 401) {
            console.warn("⚠️ Unauthorized - Token may be expired");
        } else if (error.response?.status === 403) {
            console.warn("⛔ Forbidden - Insufficient permissions");
        }

        throw error;
    }
}

export const apiService = {
    GET_ALL: (endpoint) => callApi(endpoint, "GET"),
    GET_ID: (endpoint, id) => callApi(`${endpoint}/${id}`, "GET"),
    POST_ADD: (endpoint, data) => callApi(endpoint, "POST", data),
    PUT_EDIT: (endpoint, data) => callApi(endpoint, "PUT", data),
    DELETE_ID: (endpoint, id) => callApi(`${endpoint}/${id}`, "DELETE"),

    LOGIN: (username, password) =>
        callApi("auth/login", "POST", { username, password }),

    REGISTER: (registerData) =>
        callApi("auth/register", "POST", registerData),

    GET_IMG: (imgName) => `${UPLOAD_URL}/${imgName}`,

    CURRENT_USER: getCurrentUser,

    POST: (endpoint, data) => callApi(endpoint, "POST", data),
    GET: (endpoint) => callApi(endpoint, "GET"),

    CREATE_ORDER: (orderData) => callApi("orders", "POST", orderData),
    GET_ORDER: (orderId) => callApi(`orders/${orderId}`, "GET"),
    UPDATE_ORDER_STATUS: (orderId, status) =>
        callApi(`orders/${orderId}/status`, "PUT", { status }),

    // 💳 Payments
    CREATE_PAYMENT: (paymentData) => callApi("payment/create", "POST", paymentData),
    VERIFY_PAYMENT: (transactionId) =>
        callApi(`payments/verify/${transactionId}`, "GET"),
};

export default apiService;