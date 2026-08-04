import React from 'react';

export default function HistoryTable({ history, meta, filters, onFilterChange }) {
    const sortableColumns = [
        { key: 'started_at', label: 'Date & Time' },
        { key: 'party_size', label: 'Party Size' },
        { key: 'duration_minutes', label: 'Duration' },
    ];

    const handleSort = (key) => {
        if (filters.sort_by === key) {
            onFilterChange('sort_dir', filters.sort_dir === 'asc' ? 'desc' : 'asc');
        } else {
            onFilterChange('sort_by', key);
            onFilterChange('sort_dir', 'desc');
        }
    };

    const SortIcon = ({ columnKey }) => {
        if (filters.sort_by !== columnKey) {
            return (
                <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        return (
            <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={filters.sort_dir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                />
            </svg>
        );
    };

    return (
        <div className="space-y-4" id="history-section">
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                            Search Customer
                        </label>
                        <input
                            type="text"
                            id="history-search"
                            placeholder="Search by name..."
                            value={filters.search}
                            onChange={(e) => onFilterChange('search', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                            Party Size
                        </label>
                        <select
                            id="history-party-filter"
                            value={filters.party_size}
                            onChange={(e) => onFilterChange('party_size', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition-all"
                        >
                            <option value="">All Sizes</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                <option key={s} value={s}>{s} {s === 1 ? 'person' : 'people'}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                            Table
                        </label>
                        <select
                            id="history-table-filter"
                            value={filters.table}
                            onChange={(e) => onFilterChange('table', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition-all"
                        >
                            <option value="">All Tables</option>
                            {['A', 'B', 'C', 'D'].map(t => (
                                <option key={t} value={t}>Table {t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" id="history-table">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                    Customer
                                </th>
                                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                    Table
                                </th>
                                {sortableColumns.map(col => (
                                    <th
                                        key={col.key}
                                        className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 cursor-pointer hover:text-black transition-colors select-none"
                                        onClick={() => handleSort(col.key)}
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.label}
                                            <SortIcon columnKey={col.key} />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                                        No dining history found
                                    </td>
                                </tr>
                            ) : (
                                history.map((session, index) => (
                                    <tr
                                        key={session.id}
                                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-5 py-3 font-medium text-black">
                                            {session.queue?.customer_name || '—'}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="inline-flex items-center justify-center w-7 h-7 bg-black text-white text-xs font-bold rounded-lg">
                                                {session.restaurant_table?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">
                                            {session.started_at
                                                ? new Date(session.started_at).toLocaleString([], {
                                                    month: 'short', day: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })
                                                : '—'
                                            }
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="bg-gray-100 text-black px-2 py-0.5 rounded text-xs font-semibold">
                                                {session.party_size}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">
                                            {session.duration_minutes} min
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Page {meta.current_page} of {meta.last_page} · {meta.total} records
                        </p>
                        <div className="flex gap-1">
                            {Array.from({ length: meta.last_page }, (_, i) => i + 1).slice(
                                Math.max(0, meta.current_page - 3),
                                meta.current_page + 2
                            ).map(page => (
                                <button
                                    key={page}
                                    onClick={() => onFilterChange('page', page)}
                                    className={`w-8 h-8 text-xs rounded-lg font-medium transition-all ${
                                        page === meta.current_page
                                            ? 'bg-black text-white'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
