import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiService from '../../../api/apiService';
import {
    generateInvoiceContent,
    downloadInvoice,
    generateInvoiceFilename
} from '../utils/invoiceGenerator';
import { useReactToPrint } from 'react-to-print';
import BillPrint from './BillPrint';

const BillsHistoryModal = ({ onClose, currentUser }) => {
    const [bills, setBills] = useState([]);
    const [filteredBills, setFilteredBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, COMPLETED, PENDING
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);
    const [printBillData, setPrintBillData] = useState(null);

    const printRef = useRef();

    const filterBills = useCallback(() => {
        let filtered = [...bills];

        if (filter !== 'ALL') {
            filtered = filtered.filter(b => b.paymentStatus === filter);
        }

        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(b =>
                b.id.toString().includes(search) ||
                b.orderId.toString().includes(search) ||
                b.order?.table?.number?.toString().includes(search)
            );
        }

        setFilteredBills(filtered);
    }, [bills, filter, searchTerm]);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Bill_${printBillData?.billId || 'invoice'}`,
        onAfterPrint: () => {
            console.log('✅ Đã in bill');
            setPrintBillData(null);
        }
    });

    const fetchBills = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiService.GET_ALL('bills');
            const billsData = response.data || [];

            const billsWithDetails = await Promise.all(
                billsData.map(async (bill) => {
                    try {
                        const orderRes = await apiService.GET_ID('orders', bill.orderId);
                        return {
                            ...bill,
                            order: orderRes.data
                        };
                    } catch (error) {
                        console.error(`⚠️ Không tải được order ${bill.orderId}:`, error);
                        return bill;
                    }
                })
            );

            billsWithDetails.sort((a, b) =>
                new Date(b.issuedAt) - new Date(a.issuedAt)
            );

            setBills(billsWithDetails);
        } catch (error) {
            console.error('❌ Lỗi tải bills:', error);
            alert('❌ Không thể tải danh sách hóa đơn!');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    useEffect(() => {
        if (printBillData) {
            setTimeout(() => {
                handlePrint();
            }, 100);
        }
    }, [printBillData, handlePrint]);

    useEffect(() => {
        filterBills();
    }, [filterBills]);

    const handlePrintBill = async (bill) => {
        try {
            const order = bill.order;
            if (!order) {
                alert('⚠️ Không tìm thấy thông tin đơn hàng!');
                return;
            }

            const billData = {
                orderId: order.id,
                billId: bill.id,
                table: order.table,
                isTakeaway: !order.table,
                total: bill.totalAmount,
                isPaid: bill.paymentStatus === 'COMPLETED',
                items: order.items || [],
                employeeName: order.employee?.fullName || currentUser?.fullName || 'N/A',
                paymentMethod: bill.paymentMethod,
                customerPaid: 0,
                subtotal: bill.totalAmount,
                discountAmount: 0,
                promotion: order.promotion || null,
                createdAt: bill.issuedAt
            };

            setPrintBillData(billData);
        } catch (error) {
            console.error('❌ Lỗi in bill:', error);
            alert('❌ Không thể in hóa đơn!');
        }
    };

    const handleDownloadBill = async (bill) => {
        try {
            const order = bill.order;
            if (!order) {
                alert('⚠️ Không tìm thấy thông tin đơn hàng!');
                return;
            }

            const invoiceContent = generateInvoiceContent({
                orderId: order.id,
                billId: bill.id,
                items: order.items,
                table: order.table,
                isTakeaway: !order.table,
                employeeName: order.employee?.fullName || currentUser?.fullName || 'N/A',
                total: bill.totalAmount,
                paymentMethod: bill.paymentMethod,
                isPaid: bill.paymentStatus === 'COMPLETED',
                notes: bill.notes
            });

            const filename = generateInvoiceFilename(
                order.id,
                order.table,
                !order.table
            );

            downloadInvoice(invoiceContent, filename);

            alert('✅ Đã tải xuống hóa đơn!');
        } catch (error) {
            console.error('❌ Lỗi tải hóa đơn:', error);
            alert('❌ Không thể tải hóa đơn!');
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            COMPLETED: { label: '✓ Đã thanh toán', class: 'completed' },
            PENDING: { label: '⏳ Chưa thanh toán', class: 'pending' }
        };
        const config = statusConfig[status] || { label: status, class: 'unknown' };
        return <span className={`bill-status-badge ${config.class}`}>{config.label}</span>;
    };

    const getPaymentMethodIcon = (method) => {
        const icons = {
            CASH: '💵',
            CARD: '💳',
            MOBILE: '📱',
            PAYOS: '🏦'
        };
        return icons[method] || '💰';
    };

    if (loading) {
        return (
            <div className="modal-overlay">
                <div className="modal-content bills-history-modal">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải danh sách hóa đơn...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content bills-history-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h4>🧾 Lịch sử hóa đơn</h4>
                        <button className="close-btn" onClick={onClose}>✕</button>
                    </div>

                    <div className="bills-filters">
                        <div className="filter-tabs">
                            <button
                                className={`filter-tab ${filter === 'ALL' ? 'active' : ''}`}
                                onClick={() => setFilter('ALL')}
                            >
                                📋 Tất cả ({bills.length})
                            </button>
                            <button
                                className={`filter-tab ${filter === 'COMPLETED' ? 'active' : ''}`}
                                onClick={() => setFilter('COMPLETED')}
                            >
                                ✅ Đã thanh toán ({bills.filter(b => b.paymentStatus === 'COMPLETED').length})
                            </button>
                            <button
                                className={`filter-tab ${filter === 'PENDING' ? 'active' : ''}`}
                                onClick={() => setFilter('PENDING')}
                            >
                                ⏳ Chưa thanh toán ({bills.filter(b => b.paymentStatus === 'PENDING').length})
                            </button>
                        </div>

                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="🔍 Tìm theo mã bill, mã order, số bàn..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    className="clear-search"
                                    onClick={() => setSearchTerm('')}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bills-list">
                        {filteredBills.length === 0 ? (
                            <div className="empty-bills">
                                <div className="empty-icon">📭</div>
                                <p>Không tìm thấy hóa đơn nào</p>
                                <small>
                                    {searchTerm
                                        ? 'Thử tìm kiếm với từ khóa khác'
                                        : 'Chưa có hóa đơn nào trong hệ thống'}
                                </small>
                            </div>
                        ) : (
                            filteredBills.map(bill => {
                                const order = bill.order || {};
                                const billDate = new Date(bill.issuedAt);

                                return (
                                    <div
                                        key={bill.id}
                                        className={`bill-card ${bill.paymentStatus.toLowerCase()}`}
                                        onClick={() => setSelectedBill(selectedBill?.id === bill.id ? null : bill)}
                                    >
                                        <div className="bill-header">
                                            <div className="bill-title">
                                                <h5>🧾 Bill #{bill.id}</h5>
                                                {getStatusBadge(bill.paymentStatus)}
                                            </div>
                                            <div className="bill-amount">
                                                {bill.totalAmount.toLocaleString()}₫
                                            </div>
                                        </div>

                                        <div className="bill-info">
                                            <div className="info-row">
                                                <span className="label">📝 Order:</span>
                                                <span className="value">#{bill.orderId}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">📍 Vị trí:</span>
                                                <span className="value">
                                                    {order.table
                                                        ? `🪑 Bàn ${order.table.number}`
                                                        : '🚶 Mang đi'}
                                                </span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">💳 Phương thức:</span>
                                                <span className="value">
                                                    {getPaymentMethodIcon(bill.paymentMethod)} {bill.paymentMethod}
                                                </span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">📅 Ngày:</span>
                                                <span className="value">
                                                    {billDate.toLocaleDateString('vi-VN')} - {billDate.toLocaleTimeString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>

                                        {selectedBill?.id === bill.id && (
                                            <div className="bill-actions" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className="btn-print"
                                                    onClick={() => handlePrintBill(bill)}
                                                >
                                                    🖨️ In bill
                                                </button>
                                                <button
                                                    className="btn-download"
                                                    onClick={() => handleDownloadBill(bill)}
                                                >
                                                    💾 Tải xuống
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="modal-footer">
                        <button className="btn-close" onClick={onClose}>
                            ✓ Đóng
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden print component */}
            <div style={{ display: 'none' }}>
                <BillPrint ref={printRef} billData={printBillData} />
            </div>
        </>
    );
};

export default BillsHistoryModal;