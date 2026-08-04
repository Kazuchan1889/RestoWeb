import React from 'react';

export default function QueueList({ queue, onAutoSeat }) {
    if (queue.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-black/10 p-10 text-center shadow-xs">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                </div>
                <p className="text-sm font-bold text-black">No Waiting Customers</p>
                <p className="text-xs text-gray-400 mt-1">Register a new arrival using the form above</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="queue-list">
            {queue.map((entry, index) => (
                <div
                    key={entry.id}
                    id={`queue-item-${entry.id}`}
                    draggable
                    onDragStart={(e) => {
                        e.dataTransfer.setData('dragType', 'queue-party');
                        e.dataTransfer.setData('queueId', entry.id.toString());
                        e.dataTransfer.setData(`partysize-${entry.party_size}`, 'true');
                        e.dataTransfer.effectAllowed = 'move';
                        e.currentTarget.classList.add('dragging');
                    }}
                    onDragEnd={(e) => {
                        e.currentTarget.classList.remove('dragging');
                    }}
                    className="
                        group relative bg-white rounded-2xl border-2 border-black/10 p-5
                        cursor-grab active:cursor-grabbing
                        hover:border-black hover:shadow-xl hover:-translate-y-0.5
                        transition-all duration-300
                        animate-slide-up
                    "
                    style={{ animationDelay: `${index * 60}ms` }}
                >
                    {/* Position badge & Party size */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-black text-white font-black text-sm flex items-center justify-center shadow-sm">
                                #{entry.position}
                            </div>
                            <div>
                                <h4 className="text-sm font-extrabold text-black leading-tight group-hover:underline">
                                    {entry.customer_name}
                                </h4>
                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                                    Arrived {new Date(entry.arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-gray-100 text-black px-3 py-1 rounded-xl text-xs font-bold border border-gray-200">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{entry.party_size}</span>
                        </div>
                    </div>

                    {/* Drag indicator & Quick Seat */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 8zm0 6a2 2 0 10.001 4.001A2 2 0 007 14zm6-12a2 2 0 10.001 4.001A2 2 0 0013 2zm0 6a2 2 0 10.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10.001 4.001A2 2 0 0013 14z" />
                            </svg>
                            Drag to table
                        </span>

                        {onAutoSeat && (
                            <button
                                onClick={() => onAutoSeat(entry.id)}
                                className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 hover:bg-black hover:text-white text-black px-2.5 py-1 rounded-lg transition-all"
                            >
                                Quick Seat
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
