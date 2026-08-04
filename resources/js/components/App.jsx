import React, { useState, useEffect, useCallback } from 'react';
import { fetchStatus, fetchHistory, arriveParty, serveTable, assignParty, transferTable } from '../api';
import RestaurantGrid from './RestaurantGrid';
import QueueList from './QueueList';
import HistoryTable from './HistoryTable';
import ArrivalForm from './ArrivalForm';
import Toast from './Toast';

const POLL_INTERVAL = 3000;

export default function App() {
    const [tables, setTables] = useState([]);
    const [queue, setQueue] = useState([]);
    const [history, setHistory] = useState([]);
    const [historyMeta, setHistoryMeta] = useState({});
    const [activeTab, setActiveTab] = useState('dashboard');
    const [toasts, setToasts] = useState([]);
    const [loading, setLoading] = useState(true);

    // History filters
    const [historyFilters, setHistoryFilters] = useState({
        search: '',
        party_size: '',
        table: '',
        sort_by: 'started_at',
        sort_dir: 'desc',
        page: 1,
    });

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const loadStatus = useCallback(async () => {
        try {
            const res = await fetchStatus();
            setTables(res.data.tables);
            setQueue(res.data.queue);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch status:', err);
        }
    }, []);

    const loadHistory = useCallback(async () => {
        try {
            const res = await fetchHistory(historyFilters);
            setHistory(res.data.data || []);
            setHistoryMeta({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total,
            });
        } catch (err) {
            console.error('Failed to fetch history:', err);
        }
    }, [historyFilters]);

    useEffect(() => {
        loadStatus();
        const interval = setInterval(loadStatus, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [loadStatus]);

    useEffect(() => {
        if (activeTab === 'history') {
            loadHistory();
        }
    }, [activeTab, loadHistory]);

    const handleArrive = async (data) => {
        try {
            const res = await arriveParty(data);
            if (res.data.status === 'seated') {
                addToast(`${data.customer_name} seated at Table ${res.data.table.name}!`, 'success');
            } else {
                addToast(`${data.customer_name} added to queue (position ${res.data.position})`, 'info');
            }
            await loadStatus();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to process arrival';
            addToast(msg, 'error');
        }
    };

    const handleForceComplete = async (tableId) => {
        try {
            await serveTable({ table_id: tableId });
            addToast('Table cleared successfully!', 'success');
            await loadStatus();
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to complete dining';
            addToast(msg, 'error');
        }
    };

    const handleDrop = async (queueId, tableId) => {
        try {
            await assignParty({ queue_id: queueId, table_id: tableId });
            addToast('Party assigned to table!', 'success');
            await loadStatus();
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to assign party';
            addToast(msg, 'error');
        }
    };

    const handleTransfer = async (sessionId, toTableId) => {
        try {
            const res = await transferTable({ session_id: sessionId, to_table_id: toTableId });
            addToast(res.data.message || 'Transferred customer to new table!', 'success');
            await loadStatus();
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to transfer customer';
            addToast(msg, 'error');
        }
    };

    const handleAutoSeat = async (queueId) => {
        try {
            const waitingParty = queue.find(q => q.id === queueId);
            if (!waitingParty) return;

            const availableTables = tables.filter(t => t.status === 'available' && t.capacity >= waitingParty.party_size);
            if (availableTables.length === 0) {
                addToast(`No available table for party of ${waitingParty.party_size}`, 'error');
                return;
            }

            availableTables.sort((a, b) => a.capacity - b.capacity);
            const targetTable = availableTables[0];

            await assignParty({ queue_id: queueId, table_id: targetTable.id });
            addToast(`Seated ${waitingParty.customer_name} at Table ${targetTable.name}!`, 'success');
            await loadStatus();
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to seat party';
            addToast(msg, 'error');
        }
    };

    const handleDirectArrival = async (arrivalData, targetTableId) => {
        try {
            const res = await arriveParty({
                customer_name: arrivalData.customer_name,
                party_size: arrivalData.party_size,
                table_id: targetTableId,
            });

            if (res.data.status === 'seated') {
                addToast(`Seated ${arrivalData.customer_name} at Table ${res.data.table.name}!`, 'success');
            } else {
                addToast(`${arrivalData.customer_name} added to queue (position ${res.data.position})`, 'info');
            }
            await loadStatus();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to seat customer';
            addToast(msg, 'error');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
                <div className="text-center animate-fade-in">
                    <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm tracking-widest uppercase text-gray-500">Memuat System</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Header */}
            <header className="bg-black text-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/Ratatulii.png" alt="Ratatouille Logo" className="w-8 h-8 rounded-lg object-cover bg-white p-0.5" />
                        <h1 className="text-lg font-bold tracking-tight">Ratatouille</h1>
                        <span className="text-xs text-gray-400 ml-1 hidden sm:inline">Manajemen Antrean Restoran</span>
                    </div>
                    <nav className="flex gap-1">
                        {['dashboard', 'history'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 capitalize ${
                                    activeTab === tab
                                        ? 'bg-white text-black'
                                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {tab === 'dashboard' ? 'Dashboard' : 'Riwayat'}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'dashboard' ? (
                    <div className="space-y-8 animate-fade-in">
                        {/* Stats Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <StatCard
                                label="Meja Kosong"
                                value={tables.filter(t => t.status === 'available').length}
                                color="bg-emerald-500"
                            />
                            <StatCard
                                label="Sedang Makan"
                                value={tables.filter(t => t.status === 'dining').length}
                                color="bg-red-500"
                            />
                            <StatCard
                                label="Dalam Antrean"
                                value={queue.length}
                                color="bg-amber-500"
                            />
                            <StatCard
                                label="Total Kapasitas"
                                value={tables.reduce((sum, t) => sum + t.capacity, 0)}
                                color="bg-black"
                            />
                        </div>

                        {/* Restaurant Grid + Form */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <SectionHeader title="Denah Meja Restoran" subtitle="Geser antrean atau kartu ke meja kosong untuk menempatkan pelanggan" />
                                <RestaurantGrid
                                    tables={tables}
                                    onForceComplete={handleForceComplete}
                                    onDrop={handleDrop}
                                    onTransfer={handleTransfer}
                                    onDirectArrival={handleDirectArrival}
                                />
                            </div>
                            <div>
                                <SectionHeader title="Kedatangan Baru" subtitle="Daftarkan pelanggan yang baru datang" />
                                <ArrivalForm onSubmit={handleArrive} />
                            </div>
                        </div>

                        {/* Queue Section */}
                        <div>
                            <SectionHeader
                                title="Antrean Menunggu"
                                subtitle={`${queue.length} ${queue.length === 1 ? 'pelanggan' : 'pelanggan'} menunggu · Diurutkan berdasarkan jumlah rombongan terbesar`}
                            />
                            <QueueList queue={queue} onAutoSeat={handleAutoSeat} />
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <SectionHeader title="Riwayat Makan" subtitle="Daftar riwayat sesi makan pelanggan yang telah selesai" />
                        <HistoryTable
                            history={history}
                            meta={historyMeta}
                            filters={historyFilters}
                            onFilterChange={(key, val) =>
                                setHistoryFilters(prev => ({ ...prev, [key]: val, page: key === 'page' ? val : 1 }))
                            }
                        />
                    </div>
                )}
            </main>

            {/* Toasts */}
            <div className="fixed bottom-6 right-6 z-50 space-y-2">
                {toasts.map(toast => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} />
                ))}
            </div>
        </div>
    );
}

function SectionHeader({ title, subtitle }) {
    return (
        <div className="mb-4">
            <h2 className="text-xl font-bold text-black">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-3xl font-black text-black mt-2">{value}</p>
        </div>
    );
}
