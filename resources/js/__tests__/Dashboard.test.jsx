import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RestaurantGrid from '../components/RestaurantGrid';
import QueueList from '../components/QueueList';
import LiveTimer from '../components/LiveTimer';
import HistoryTable from '../components/HistoryTable';
import ArrivalForm from '../components/ArrivalForm';

// ─── Test 1: Restaurant Grid Rendering ──────────────────────

describe('RestaurantGrid', () => {
    const mockTables = [
        { id: 1, name: 'A', capacity: 2, status: 'available' },
        { id: 2, name: 'B', capacity: 4, status: 'dining', session: {
            id: 1, customer_name: 'John', party_size: 3,
            started_at: new Date().toISOString(),
            duration_minutes: 45,
            estimated_end_at: new Date(Date.now() + 600000).toISOString(),
        }},
        { id: 3, name: 'C', capacity: 6, status: 'available' },
        { id: 4, name: 'D', capacity: 8, status: 'available' },
    ];

    it('renders all 4 tables with correct names and capacities', () => {
        render(<RestaurantGrid tables={mockTables} onForceComplete={vi.fn()} onDrop={vi.fn()} onTransfer={vi.fn()} onDirectArrival={vi.fn()} />);

        expect(screen.getByText('Table A')).toBeInTheDocument();
        expect(screen.getByText('Table B')).toBeInTheDocument();
        expect(screen.getByText('Table C')).toBeInTheDocument();
        expect(screen.getByText('Table D')).toBeInTheDocument();
        expect(screen.getByText('2 seats total')).toBeInTheDocument();
        expect(screen.getByText('6 seats total')).toBeInTheDocument();
        expect(screen.getByText('8 seats total')).toBeInTheDocument();
    });
});

// ─── Test 2: Table Color State Transitions ──────────────────

describe('Table Status Colors', () => {
    it('shows correct status labels for each table state', () => {
        const tables = [
            { id: 1, name: 'A', capacity: 2, status: 'available' },
            { id: 2, name: 'B', capacity: 4, status: 'dining', session: {
                id: 1, customer_name: 'Test', party_size: 2,
                started_at: new Date().toISOString(),
                duration_minutes: 30,
                estimated_end_at: new Date(Date.now() + 600000).toISOString(),
            }},
            { id: 3, name: 'C', capacity: 6, status: 'cleaning' },
            { id: 4, name: 'D', capacity: 8, status: 'available' },
        ];

        render(<RestaurantGrid tables={tables} onForceComplete={vi.fn()} onDrop={vi.fn()} onTransfer={vi.fn()} />);

        const statusLabels = screen.getAllByText(/Available|Occupied|Dining|Cleaning/i);
        expect(statusLabels.length).toBeGreaterThanOrEqual(3);
    });

    it('shows force complete button only for dining tables', () => {
        const tables = [
            { id: 1, name: 'A', capacity: 2, status: 'available' },
            { id: 2, name: 'B', capacity: 4, status: 'dining', session: {
                id: 1, customer_name: 'Test', party_size: 2,
                started_at: new Date().toISOString(),
                duration_minutes: 30,
                estimated_end_at: new Date(Date.now() + 600000).toISOString(),
            }},
        ];

        render(<RestaurantGrid tables={tables} onForceComplete={vi.fn()} onDrop={vi.fn()} onTransfer={vi.fn()} />);

        const completeButtons = screen.getAllByText(/Force Complete & Clear Table/i);
        expect(completeButtons).toHaveLength(1);
    });
});

// ─── Test 3: Drag & Drop Capacity Validation ────────────────

describe('Drag and Drop', () => {
    it('renders queue items as draggable elements', () => {
        const queue = [
            { id: 1, customer_name: 'Alice', party_size: 4, arrived_at: new Date().toISOString(), position: 1 },
            { id: 2, customer_name: 'Bob', party_size: 2, arrived_at: new Date().toISOString(), position: 2 },
        ];

        render(<QueueList queue={queue} />);

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();

        const item = document.getElementById('queue-item-1');
        expect(item).not.toBeNull();
        expect(item.getAttribute('draggable')).toBe('true');
    });

    it('sets queue id on drag start', () => {
        const queue = [
            { id: 42, customer_name: 'Charlie', party_size: 3, arrived_at: new Date().toISOString(), position: 1 },
        ];

        render(<QueueList queue={queue} />);

        const item = document.getElementById('queue-item-42');
        const dataTransfer = { setData: vi.fn(), effectAllowed: '' };
        fireEvent.dragStart(item, { dataTransfer });

        expect(dataTransfer.setData).toHaveBeenCalledWith('queueId', '42');
    });
});

// ─── Test 4: Live Countdown Timer ───────────────────────────

describe('LiveTimer', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('displays countdown in mm:ss format', () => {
        const futureTime = new Date(Date.now() + 300000).toISOString();
        render(<LiveTimer estimatedEndAt={futureTime} />);

        const timer = screen.getByText(/\d{2}:\d{2}/);
        expect(timer).toBeInTheDocument();
    });

    it('shows Done when countdown reaches zero', () => {
        const pastTime = new Date(Date.now() - 1000).toISOString();
        render(<LiveTimer estimatedEndAt={pastTime} />);

        expect(screen.getByText('Done')).toBeInTheDocument();
    });
});

// ─── Test 5: History Table Multi-Column Sort ────────────────

describe('HistoryTable', () => {
    const defaultFilters = { search: '', party_size: '', table: '', sort_by: 'started_at', sort_dir: 'desc', page: 1 };
    const defaultMeta = { current_page: 1, last_page: 1, total: 0 };

    it('renders sortable column headers', () => {
        render(
            <HistoryTable
                history={[]}
                meta={defaultMeta}
                filters={defaultFilters}
                onFilterChange={vi.fn()}
            />
        );

        expect(screen.getByText('Date & Time')).toBeInTheDocument();
        expect(screen.getAllByText('Party Size').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Duration')).toBeInTheDocument();
    });

    it('calls onFilterChange when sort column is clicked', () => {
        const onFilterChange = vi.fn();

        render(
            <HistoryTable
                history={[]}
                meta={defaultMeta}
                filters={defaultFilters}
                onFilterChange={onFilterChange}
            />
        );

        // Click the sortable column header (inside <th>), not the filter label
        const partySizeHeaders = screen.getAllByText('Party Size');
        // The last one is in the <th> header
        const sortableHeader = partySizeHeaders[partySizeHeaders.length - 1];
        fireEvent.click(sortableHeader);
        expect(onFilterChange).toHaveBeenCalledWith('sort_by', 'party_size');
    });
});

// ─── Test 6: Search & Filter ────────────────────────────────

describe('FilterBar in HistoryTable', () => {
    const defaultFilters = { search: '', party_size: '', table: '', sort_by: 'started_at', sort_dir: 'desc', page: 1 };
    const defaultMeta = { current_page: 1, last_page: 1, total: 0 };

    it('renders search input and filter dropdowns', () => {
        render(
            <HistoryTable
                history={[]}
                meta={defaultMeta}
                filters={defaultFilters}
                onFilterChange={vi.fn()}
            />
        );

        expect(document.getElementById('history-search')).not.toBeNull();
        expect(document.getElementById('history-party-filter')).not.toBeNull();
        expect(document.getElementById('history-table-filter')).not.toBeNull();
    });

    it('triggers filter change on search input', () => {
        const onFilterChange = vi.fn();

        render(
            <HistoryTable
                history={[]}
                meta={defaultMeta}
                filters={defaultFilters}
                onFilterChange={onFilterChange}
            />
        );

        const searchInput = document.getElementById('history-search');
        fireEvent.change(searchInput, { target: { value: 'Alice' } });
        expect(onFilterChange).toHaveBeenCalledWith('search', 'Alice');
    });

    it('triggers filter change on party size select', () => {
        const onFilterChange = vi.fn();

        render(
            <HistoryTable
                history={[]}
                meta={defaultMeta}
                filters={defaultFilters}
                onFilterChange={onFilterChange}
            />
        );

        const select = document.getElementById('history-party-filter');
        fireEvent.change(select, { target: { value: '4' } });
        expect(onFilterChange).toHaveBeenCalledWith('party_size', '4');
    });
});

// ─── Test 7: Queue Empty State ──────────────────────────────

describe('QueueList Empty State', () => {
    it('shows empty message when queue is empty', () => {
        render(<QueueList queue={[]} />);
        expect(screen.getByText('No Waiting Customers')).toBeInTheDocument();
    });
});

// ─── Test 8: ArrivalForm ────────────────────────────────────

describe('ArrivalForm', () => {
    it('disables submit button when name is empty', () => {
        render(<ArrivalForm onSubmit={vi.fn()} />);
        const button = document.getElementById('arrive-button');
        expect(button).toBeDisabled();
    });

    it('enables submit button when name is filled', () => {
        render(<ArrivalForm onSubmit={vi.fn()} />);
        const input = document.getElementById('customer-name-input');
        fireEvent.change(input, { target: { value: 'Alice' } });
        const button = document.getElementById('arrive-button');
        expect(button).not.toBeDisabled();
    });
});
