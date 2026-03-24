
export const BASE_URL = "https://cafe-management-be-5flk.onrender.com";
export const API_URL = `${BASE_URL}/api`;
export const UPLOAD_URL = `${BASE_URL}/uploads`;
export const SOCKET_URL = BASE_URL;

// Helper: lấy URL ảnh đầy đủ từ tên file
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '/fallback.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${UPLOAD_URL}/${imagePath}`;
};

export default {
    BASE_URL,
    API_URL,
    UPLOAD_URL,
    SOCKET_URL,
    getImageUrl,
};