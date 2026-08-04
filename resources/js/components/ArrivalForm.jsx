import React, { useState } from 'react';

export default function ArrivalForm({ onSubmit }) {
    const [name, setName] = useState('');
    const [partySize, setPartySize] = useState(2);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || submitting) return;

        setSubmitting(true);
        await onSubmit({ customer_name: name.trim(), party_size: partySize });
        setName('');
        setPartySize(2);
        setSubmitting(false);
    };

    const adjustPartySize = (delta) => {
        setPartySize(prev => Math.min(8, Math.max(1, prev + delta)));
    };

    const isReadyToDrag = name.trim().length > 0;

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border-2 border-black/10 p-6 md:p-7 shadow-lg space-y-5 transition-all"
            id="arrival-form"
        >
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-base font-extrabold text-black">New Customer Arrival</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Touchscreen POS Terminal</p>
                    </div>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-widest bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                    POS Entry
                </span>
            </div>

            {/* Input 1: Customer Name */}
            <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-2">
                    Customer / Party Name *
                </label>
                <input
                    type="text"
                    id="customer-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Smith"
                    required
                    autoComplete="off"
                    className="
                        w-full px-4 py-3.5 text-base font-semibold bg-gray-50 border-2 border-gray-200
                        rounded-xl focus:outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-black/10
                        transition-all placeholder:text-gray-300 text-black
                    "
                />
            </div>

            {/* Dedicated Drag Handle Ticket Card (Appears when name is typed) */}
            {isReadyToDrag && (
                <div
                    draggable
                    onDragStart={(e) => {
                        e.dataTransfer.setData('dragType', 'new-arrival');
                        e.dataTransfer.setData('customerName', name.trim());
                        e.dataTransfer.setData('partySize', partySize.toString());
                        e.dataTransfer.setData(`partysize-${partySize}`, 'true');
                        e.dataTransfer.effectAllowed = 'move';
                        e.currentTarget.classList.add('dragging');
                    }}
                    onDragEnd={(e) => {
                        e.currentTarget.classList.remove('dragging');
                    }}
                    className="
                        bg-black text-white p-3.5 rounded-xl cursor-grab active:cursor-grabbing
                        hover:bg-gray-800 transition-all shadow-md flex items-center justify-between
                        border-2 border-black animate-slide-up select-none
                    "
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">
                            🎟️
                        </div>
                        <div>
                            <p className="text-xs font-extrabold leading-tight">Drag Ticket: "{name.trim()}"</p>
                            <p className="text-[10px] text-gray-300">{partySize} {partySize === 1 ? 'Guest' : 'Guests'} · Drag to target table</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white text-black px-2 py-1 rounded shadow-xs flex items-center gap-1">
                        <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 8zm0 6a2 2 0 10.001 4.001A2 2 0 007 14zm6-12a2 2 0 10.001 4.001A2 2 0 0013 2zm0 6a2 2 0 10.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10.001 4.001A2 2 0 0013 14z" />
                        </svg>
                        Drag Me
                    </span>
                </div>
            )}

            {/* Input 2: Party Size Selection */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                        Party Size (Guests) *
                    </label>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => adjustPartySize(-1)}
                            disabled={partySize <= 1}
                            className="w-8 h-8 rounded-lg bg-gray-100 text-black font-extrabold text-sm flex items-center justify-center hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Decrease guest count"
                        >
                            -
                        </button>
                        <span className="text-sm font-black w-6 text-center">{partySize}</span>
                        <button
                            type="button"
                            onClick={() => adjustPartySize(1)}
                            disabled={partySize >= 8}
                            className="w-8 h-8 rounded-lg bg-gray-100 text-black font-extrabold text-sm flex items-center justify-center hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Increase guest count"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Touch Grid */}
                <div className="grid grid-cols-4 gap-2.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
                        <button
                            key={size}
                            type="button"
                            id={`party-size-${size}`}
                            onClick={() => setPartySize(size)}
                            className={`
                                py-3 rounded-xl font-black text-lg transition-all duration-200 flex flex-col items-center justify-center gap-0.5 active:scale-95
                                ${partySize === size
                                    ? 'bg-black text-white ring-4 ring-black/20 shadow-lg scale-[1.02]'
                                    : 'bg-gray-50 text-gray-700 border-2 border-gray-100 hover:border-gray-300 hover:bg-gray-100'
                                }
                            `}
                        >
                            <span>{size}</span>
                            <span className={`text-[9px] uppercase tracking-wider font-semibold ${partySize === size ? 'text-gray-300' : 'text-gray-400'}`}>
                                {size === 1 ? 'Guest' : 'Guests'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                id="arrive-button"
                disabled={!name.trim() || submitting}
                className="
                    w-full py-4 text-base font-extrabold uppercase tracking-wider
                    bg-black text-white rounded-xl shadow-lg
                    hover:bg-gray-800 active:scale-[0.99]
                    disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed
                    transition-all duration-200
                    flex items-center justify-center gap-2.5
                "
            >
                {submitting ? (
                    <>
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing Arrival...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Register Arrival</span>
                    </>
                )}
            </button>
        </form>
    );
}
