import React, { useState, useCallback } from 'react';
import LiveTimer from './LiveTimer';

const TABLE_SHAPES = {
    A: { type: 'round', label: '2-Seater Bistro' },
    B: { type: 'square', label: '4-Seater Booth' },
    C: { type: 'rectangle', label: '6-Seater Family' },
    D: { type: 'oval', label: '8-Seater Grand' },
};

export default function RestaurantGrid({ tables, onForceComplete, onDrop, onTransfer, onDirectArrival }) {
    const [dragOverTable, setDragOverTable] = useState(null);
    const [dragValidation, setDragValidation] = useState(null); // 'valid' | 'invalid' | 'occupied'

    const handleDragOver = useCallback((e, table) => {
        e.preventDefault();
        setDragOverTable(table.id);

        const partySizeStr = e.dataTransfer.types.find(t => t.startsWith('partysize-'));
        const partySize = partySizeStr ? parseInt(partySizeStr.replace('partysize-', '')) : null;

        if (table.status !== 'available') {
            setDragValidation('occupied');
            e.dataTransfer.dropEffect = 'none';
        } else if (partySize && partySize > table.capacity) {
            setDragValidation('invalid');
            e.dataTransfer.dropEffect = 'none';
        } else {
            setDragValidation('valid');
            e.dataTransfer.dropEffect = 'move';
        }
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOverTable(null);
        setDragValidation(null);
    }, []);

    const handleDrop = useCallback((e, tableId) => {
        e.preventDefault();
        setDragOverTable(null);
        setDragValidation(null);

        const dragType = e.dataTransfer.getData('dragType');
        const queueId = e.dataTransfer.getData('queueId');
        const sessionId = e.dataTransfer.getData('sessionId');

        if (dragType === 'new-arrival') {
            const customerName = e.dataTransfer.getData('customerName');
            const partySize = parseInt(e.dataTransfer.getData('partySize'));
            if (customerName && partySize && onDirectArrival) {
                onDirectArrival({ customer_name: customerName, party_size: partySize }, tableId);
            }
        } else if (dragType === 'seated-customer' && sessionId) {
            onTransfer(parseInt(sessionId), tableId);
        } else if (queueId) {
            onDrop(parseInt(queueId), tableId);
        }
    }, [onDrop, onTransfer, onDirectArrival]);

    return (
        <div className="space-y-4" id="restaurant-grid">
            {/* Guide hint */}
            <div className="bg-black/5 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-gray-600 border border-black/5">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
                    <span className="font-semibold text-black">Interactive Floor Plan:</span>
                    <span>Drag new arrivals or waiting queue onto available tables to seat immediately.</span>
                </div>
                <div className="hidden md:flex items-center gap-4 font-mono text-[11px]">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Dining</span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {tables.map((table, index) => {
                    const isDragOver = dragOverTable === table.id;
                    const shapeInfo = TABLE_SHAPES[table.name] || TABLE_SHAPES.A;
                    const isDining = table.status === 'dining' && table.session;

                    // Compute dining progress % if active
                    let progressPercent = 0;
                    if (isDining) {
                        const start = new Date(table.session.started_at).getTime();
                        const end = new Date(table.session.estimated_end_at).getTime();
                        const now = Date.now();
                        const total = end - start;
                        const elapsed = now - start;
                        progressPercent = Math.min(100, Math.max(0, Math.floor((elapsed / total) * 100)));
                    }

                    return (
                        <div
                            key={table.id}
                            id={`table-${table.name}`}
                            onDragOver={(e) => handleDragOver(e, table)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, table.id)}
                            className={`
                                relative rounded-2xl border-2 p-6 transition-all duration-300
                                ${table.status === 'available'
                                    ? 'bg-white border-black/10 hover:border-black hover:shadow-xl'
                                    : 'bg-black/[0.02] border-red-200 shadow-sm'
                                }
                                ${isDragOver && dragValidation === 'valid'
                                    ? 'bg-emerald-50/80 border-emerald-500 ring-4 ring-emerald-500/20 scale-[1.02] shadow-2xl'
                                    : ''
                                }
                                ${isDragOver && dragValidation === 'invalid'
                                    ? 'bg-red-50/80 border-red-500 ring-4 ring-red-500/20 scale-[0.99]'
                                    : ''
                                }
                                ${isDragOver && dragValidation === 'occupied'
                                    ? 'bg-gray-100 border-gray-400 ring-4 ring-gray-400/20'
                                    : ''
                                }
                                animate-slide-up
                            `}
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            {/* Dragging over overlay indicator */}
                            {isDragOver && (
                                <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-white/90 backdrop-blur-xs z-20 pointer-events-none transition-all">
                                    {dragValidation === 'valid' && (
                                        <div className="text-center animate-bounce">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-1">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Release to Seat Customer</p>
                                        </div>
                                    )}
                                    {dragValidation === 'invalid' && (
                                        <div className="text-center">
                                            <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto mb-1">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-red-700">Capacity Exceeded!</p>
                                            <p className="text-[10px] text-red-500">Party size exceeds {table.capacity} seats</p>
                                        </div>
                                    )}
                                    {dragValidation === 'occupied' && (
                                        <div className="text-center">
                                            <div className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center mx-auto mb-1">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-700">Table Occupied</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Header: Name, Capacity & Status Badge */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-black text-white font-black text-xl flex items-center justify-center shadow-md">
                                        {table.name}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-black leading-tight">Table {table.name}</h4>
                                        <p className="text-[11px] text-gray-400 font-medium">{shapeInfo.label}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {table.status === 'available' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Available
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                                            Occupied
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Interactive Architectural Seat Layout Visualizer */}
                            <div className="my-5 p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center relative min-h-[100px]">
                                <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-[220px]">
                                    {Array.from({ length: table.capacity }).map((_, i) => {
                                        const isOccupiedSeat = isDining && i < table.session.party_size;
                                        return (
                                            <div
                                                key={i}
                                                className={`
                                                    w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300
                                                    ${isOccupiedSeat
                                                        ? 'bg-black text-white shadow-sm scale-105 ring-2 ring-black/20'
                                                        : 'bg-white border-2 border-gray-200 text-gray-300'
                                                    }
                                                `}
                                                title={isOccupiedSeat ? `Seat ${i+1}: Occupied` : `Seat ${i+1}: Empty`}
                                            >
                                                {isOccupiedSeat ? (
                                                    <span>{table.session.customer_name.charAt(0).toUpperCase()}</span>
                                                ) : (
                                                    <span>{i + 1}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-2">
                                    {isDining ? `${table.session.party_size} of ${table.capacity} seats filled` : `${table.capacity} seats total`}
                                </span>
                            </div>

                            {/* Dining session details or available drop zone hint */}
                            {isDining ? (
                                <div
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('dragType', 'seated-customer');
                                        e.dataTransfer.setData('sessionId', table.session.id.toString());
                                        e.dataTransfer.setData(`partysize-${table.session.party_size}`, 'true');
                                        e.dataTransfer.effectAllowed = 'move';
                                    }}
                                    className="pt-3 border-t border-gray-100 cursor-grab active:cursor-grabbing hover:bg-gray-50/80 p-2 rounded-xl transition-all"
                                    title="Click drag handle to move this party to another table"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-black leading-tight flex items-center gap-1">
                                                    {table.session.customer_name}
                                                    <span className="text-[10px] text-gray-400 font-normal">⋮ Drag to move</span>
                                                </p>
                                                <p className="text-[10px] text-gray-500">Party of {table.session.party_size}</p>
                                            </div>
                                        </div>

                                        <LiveTimer estimatedEndAt={table.session.estimated_end_at} />
                                    </div>

                                    {/* Dining progress bar */}
                                    <div className="mt-3">
                                        <div className="flex justify-between text-[10px] text-gray-400 font-medium mb-1">
                                            <span>Dining progress</span>
                                            <span>{progressPercent}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-black rounded-full transition-all duration-500"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={() => onForceComplete(table.id)}
                                            id={`force-complete-${table.name}`}
                                            className="w-full py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Force Complete & Clear Table
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-3 border-t border-dashed border-gray-200 text-center">
                                    <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
                                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                        Ready for Seating
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
