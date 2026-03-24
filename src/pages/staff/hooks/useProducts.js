import { useState, useEffect } from 'react';
import apiService from '../../../api/apiService';

export const useProducts = (isLoggedIn) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isLoggedIn) {
            fetchProductsData();
        }
    }, [isLoggedIn]);

    const fetchProductsData = async () => {
        try {
            const [cateRes, prodRes, promoRes] = await Promise.all([
                apiService.GET_ALL('categories'),
                apiService.GET_ALL('products'),
                apiService.GET_ALL('promotions')
            ]);

            const allCategories = [{ id: 'all', name: 'Tất cả' }, ...cateRes.data];
            setCategories(allCategories);
            setProducts(prodRes.data);

            const activePromotions = promoRes.data.filter((p) => {
                if (!p.isActive) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const endDate = new Date(p.endDate);
                endDate.setHours(23, 59, 59, 999);
                return endDate >= today;
            });
            setPromotions(activePromotions);
        } catch (err) {
            console.error('❌ Lỗi tải dữ liệu sản phẩm:', err);
        }
    };

    const filteredProducts = products
        .filter((p) => selectedCategory === 'all' || p.category?.id === selectedCategory)
        .filter((p) => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return p.name.toLowerCase().includes(term) ||
                p.description?.toLowerCase().includes(term);
        });

    return {
        products,
        categories,
        promotions,
        selectedCategory,
        setSelectedCategory,
        searchTerm,
        setSearchTerm,
        filteredProducts,
        refreshProducts: fetchProductsData
    };
};