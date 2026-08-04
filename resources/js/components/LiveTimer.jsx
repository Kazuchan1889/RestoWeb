import React, { useState, useEffect, useRef } from 'react';

export default function LiveTimer({ estimatedEndAt }) {
    const [remaining, setRemaining] = useState(0);
    const endTimeRef = useRef(new Date(estimatedEndAt).getTime());

    useEffect(() => {
        endTimeRef.current = new Date(estimatedEndAt).getTime();

        const tick = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
            setRemaining(diff);
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [estimatedEndAt]);

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const isUrgent = remaining <= 60 && remaining > 0;
    const isComplete = remaining === 0;

    return (
        <div
            className={`
                font-mono text-lg font-bold tabular-nums px-3 py-1.5 rounded-lg
                transition-all duration-300
                ${isComplete
                    ? 'bg-blue-100 text-blue-700'
                    : isUrgent
                        ? 'bg-red-100 text-red-700 animate-countdown'
                        : 'bg-gray-100 text-black'
                }
            `}
            id="live-timer"
        >
            {isComplete ? (
                <span className="text-sm font-semibold">Done</span>
            ) : (
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            )}
        </div>
    );
}
