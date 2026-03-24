import { useState, useEffect } from 'react';
import apiService from '../../../api/apiService';

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const username = payload.sub || payload.username;

            console.log('🔍 Đang tìm user:', username);

            try {
                const usersResponse = await apiService.GET_ALL('users');
                const user = usersResponse.data.find(u => u.username === username);

                if (user) {
                    console.log('✅ Tìm thấy user:', user);
                    // 🔥 LẤY ĐẦY ĐỦ THÔNG TIN USER, BAO GỒM imageUrl
                    setCurrentUser({
                        id: user.id,
                        username: user.username,
                        fullName: user.fullName,
                        role: user.role,
                        email: user.email,
                        imageUrl: user.imageUrl, // 🔥 THÊM imageUrl
                        phone: user.phone,
                        status: user.status
                    });
                    console.log('📸 Image URL:', user.imageUrl);
                } else {
                    console.warn('⚠️ Không tìm thấy user trong database');
                    setCurrentUser({
                        id: null,
                        username: username,
                        fullName: payload.fullName || payload.name || username || 'Unknown User',
                        role: payload.role || 'USER',
                        imageUrl: null // 🔥 THÊM imageUrl null
                    });
                }
                setIsLoggedIn(true);
            } catch (apiError) {
                console.error('❌ Không thể lấy danh sách users:', apiError);
                setCurrentUser({
                    id: null,
                    username: username,
                    fullName: payload.fullName || payload.name || username || 'Unknown User',
                    role: payload.role || 'USER',
                    imageUrl: null // 🔥 THÊM imageUrl null
                });
                setIsLoggedIn(true);
            }
        } catch (e) {
            console.error('❌ Token không hợp lệ:', e);
            handleLogout();
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            setCurrentUser(null);
            setIsLoggedIn(false);
            window.location.href = '/login';
        }
    };

    return {
        currentUser,
        isLoggedIn,
        isLoading,
        handleLogout
    };
};