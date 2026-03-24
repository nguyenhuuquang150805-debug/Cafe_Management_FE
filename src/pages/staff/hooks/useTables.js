import { useState, useEffect } from 'react';
import apiService from '../../../api/apiService';

export const useTables = (isLoggedIn, refreshTrigger) => {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [isTakeaway, setIsTakeaway] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            fetchTables();
        }
    }, [isLoggedIn, refreshTrigger]);

    const fetchTables = async () => {
        try {
            const tableRes = await apiService.GET_ALL('tables');
            setTables(tableRes.data);
        } catch (err) {
            console.error('❌ Lỗi tải bàn:', err);
        }
    };

    const updateTableStatus = async (tableId, status) => {
        try {
            const tableRes = await apiService.GET_ID('tables', tableId);
            const updatedTable = { ...tableRes.data, status };
            await apiService.PUT_EDIT(`tables/${tableId}`, updatedTable);

            setTables(prev => prev.map(t =>
                t.id === tableId ? { ...t, status } : t
            ));

            return true;
        } catch (err) {
            console.error('❌ Lỗi cập nhật bàn:', err);
            return false;
        }
    };

    const handleTableSelect = (table) => {
        if (table.status === 'FREE') {
            setSelectedTable(table);
            setShowTableModal(false);
        } else {
            alert(`⚠️ Bàn ${table.number} đang ${table.status === 'OCCUPIED' ? 'có khách' : 'đã đặt'}!`);
        }
    };

    const resetTableSelection = () => {
        setSelectedTable(null);
        setIsTakeaway(false);
    };

    return {
        tables,
        setTables,
        selectedTable,
        setSelectedTable,
        isTakeaway,
        setIsTakeaway,
        showTableModal,
        setShowTableModal,
        updateTableStatus,
        handleTableSelect,
        resetTableSelection,
        refreshTables: fetchTables
    };
};