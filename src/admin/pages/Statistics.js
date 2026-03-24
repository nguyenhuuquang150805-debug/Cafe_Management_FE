import React, { useEffect, useState, useCallback } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from "recharts";
import "../../assets/scss/admin.scss";
import apiService from "../../api/apiService";

function Statistics() {
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState([]);
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalBills: 0,
        paidBills: 0,
        pendingBills: 0,
        avgOrderValue: 0,
        bestProduct: "Đang tải..."
    });
    const [paymentMethodData, setPaymentMethodData] = useState([]);
    const [orderStatusData, setOrderStatusData] = useState([]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const calculateStatistics = useCallback((bills, orders, orderItems) => {
        // === 1. Tổng quan ===
        const totalRevenue = bills.reduce((sum, bill) =>
            sum + (parseFloat(bill.totalAmount) || 0), 0
        );

        const paidBills = bills.filter(b => b.paymentStatus === "PAID").length;
        const pendingBills = bills.filter(b => b.paymentStatus === "PENDING").length;
        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

        // === 2. Sản phẩm bán chạy ===
        const productSales = {};
        orderItems.forEach(item => {
            const productName = item.product?.name || "Không rõ";
            productSales[productName] = (productSales[productName] || 0) + (item.quantity || 0);
        });
        const bestProduct = Object.entries(productSales)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || "Chưa có dữ liệu";

        // === 3. Doanh thu theo tháng ===
        const monthlyRevenue = {};
        bills.forEach(bill => {
            if (!bill.createdAt) return;
            const date = new Date(bill.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;

            if (!monthlyRevenue[monthKey]) {
                monthlyRevenue[monthKey] = {
                    name: monthName,
                    revenue: 0,
                    bills: 0
                };
            }
            monthlyRevenue[monthKey].revenue += parseFloat(bill.totalAmount) || 0;
            monthlyRevenue[monthKey].bills += 1;
        });

        const sortedRevenue = Object.entries(monthlyRevenue)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([_, data]) => data);

        // === 4. Phương thức thanh toán ===
        const paymentMethods = {};
        bills.forEach(bill => {
            const method = bill.paymentMethod || "Chưa xác định";
            paymentMethods[method] = (paymentMethods[method] || 0) + 1;
        });
        const paymentData = Object.entries(paymentMethods).map(([name, value]) => ({
            name: name === "CASH" ? "Tiền mặt" :
                name === "CARD" ? "Thẻ" :
                    name === "BANKING" ? "Chuyển khoản" : name,
            value
        }));

        // === 5. Trạng thái đơn hàng ===
        const orderStatuses = {};
        orders.forEach(order => {
            const status = order.status || "Chưa xác định";
            orderStatuses[status] = (orderStatuses[status] || 0) + 1;
        });
        const statusData = Object.entries(orderStatuses).map(([name, value]) => ({
            name: name === "PENDING" ? "Chờ xử lý" :
                name === "PREPARING" ? "Đang chuẩn bị" :
                    name === "COMPLETED" ? "Hoàn thành" :
                        name === "CANCELLED" ? "Đã hủy" : name,
            value
        }));

        // Cập nhật state
        setSummary({
            totalRevenue,
            totalOrders: orders.length,
            totalBills: bills.length,
            paidBills,
            pendingBills,
            avgOrderValue,
            bestProduct
        });
        setRevenueData(sortedRevenue);
        setPaymentMethodData(paymentData);
        setOrderStatusData(statusData);
    }, []);

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);

            // Gọi API song song
            const [billsRes, ordersRes, orderItemsRes] = await Promise.all([
                apiService.GET_ALL("bills"),
                apiService.GET_ALL("orders"),
                apiService.GET_ALL("order-items")
            ]);

            const bills = billsRes.data || [];
            const orders = ordersRes.data || [];
            const orderItems = orderItemsRes.data || [];

            calculateStatistics(bills, orders, orderItems);
        } catch (err) {
            console.error("❌ Lỗi tải dữ liệu thống kê:", err);
        } finally {
            setLoading(false);
        }
    }, [calculateStatistics]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    if (loading) {
        return (
            <div className="statistics-page">
                <h2>📊 Thống kê kinh doanh</h2>
                <div className="loading">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="statistics-page">
            <h2>📊 Thống kê kinh doanh</h2>

            {/* Tổng quan */}
            <div className="stats-summary">
                <div className="card revenue">
                    <div className="card-icon">💰</div>
                    <div className="card-content">
                        <h4>Tổng doanh thu</h4>
                        <p className="value">{summary.totalRevenue.toLocaleString()}₫</p>
                        <span className="subtitle">Từ {summary.totalBills} hóa đơn</span>
                    </div>
                </div>

                <div className="card orders">
                    <div className="card-icon">📦</div>
                    <div className="card-content">
                        <h4>Tổng đơn hàng</h4>
                        <p className="value">{summary.totalOrders}</p>
                        <span className="subtitle">Trung bình {summary.avgOrderValue.toLocaleString()}₫/đơn</span>
                    </div>
                </div>

                <div className="card bills">
                    <div className="card-icon">🧾</div>
                    <div className="card-content">
                        <h4>Hóa đơn</h4>
                        <p className="value">{summary.totalBills}</p>
                        <span className="subtitle">
                            Đã thanh toán: {summary.paidBills} | Chờ: {summary.pendingBills}
                        </span>
                    </div>
                </div>

                <div className="card product">
                    <div className="card-icon">⭐</div>
                    <div className="card-content">
                        <h4>Sản phẩm bán chạy</h4>
                        <p className="value product-name">{summary.bestProduct}</p>
                    </div>
                </div>
            </div>

            {/* Biểu đồ doanh thu theo tháng */}
            <div className="chart-container">
                <h3>📈 Doanh thu theo tháng</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                            formatter={(value) =>
                                value.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                            }
                        />
                        <Bar dataKey="revenue" fill="#4CAF50" name="Doanh thu" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Biểu đồ đường - Số hóa đơn theo tháng */}
            <div className="chart-container">
                <h3>📊 Số lượng hóa đơn theo tháng</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="bills"
                            stroke="#2196F3"
                            strokeWidth={2}
                            name="Số hóa đơn"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Biểu đồ tròn */}
            <div className="charts-row">
                <div className="chart-container half">
                    <h3>💳 Phương thức thanh toán</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={paymentMethodData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {paymentMethodData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container half">
                    <h3>📋 Trạng thái đơn hàng</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={orderStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {orderStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default Statistics;