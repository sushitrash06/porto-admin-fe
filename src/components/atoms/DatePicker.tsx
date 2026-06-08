/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    id?: string;
}

const PopoverStateSync: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
    useEffect(() => {
        if (!open) {
            onClose();
        }
    }, [open, onClose]);
    return null;
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker: React.FC<DatePickerProps> = ({
    value = '',
    onChange,
    disabled = false,
    placeholder = 'Select date',
    id
}) => {
    const initialDate = value ? new Date(value) : new Date();
    const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear() || new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth() ?? new Date().getMonth());
    const [mode, setMode] = useState<'days' | 'months' | 'years'>('days');
    const [yearPageStart, setYearPageStart] = useState<number>(Math.floor(viewYear / 12) * 12);

    useEffect(() => {
        if (value) {
            const parsed = new Date(value);
            if (!isNaN(parsed.getTime())) {
                setViewYear(parsed.getFullYear());
                setViewMonth(parsed.getMonth());
            }
        }
    }, [value]);

    useEffect(() => {
        setYearPageStart(Math.floor(viewYear / 12) * 12);
    }, [viewYear]);

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const gridCells: { day: number; isCurrentMonth: boolean; dateString: string }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const d = daysInPrevMonth - i;
        const prevMonthIndex = viewMonth === 0 ? 11 : viewMonth - 1;
        const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
        const dateStr = `${prevYear}-${String(prevMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        gridCells.push({ day: d, isCurrentMonth: false, dateString: dateStr });
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        gridCells.push({ day: d, isCurrentMonth: true, dateString: dateStr });
    }

    const totalCells = 42;
    const nextMonthFiller = totalCells - gridCells.length;
    for (let d = 1; d <= nextMonthFiller; d++) {
        const nextMonthIndex = viewMonth === 11 ? 0 : viewMonth + 1;
        const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
        const dateStr = `${nextYear}-${String(nextMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        gridCells.push({ day: d, isCurrentMonth: false, dateString: dateStr });
    }

    const formatDateForDisplay = (val: string) => {
        if (!val) return '';
        const d = new Date(val);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleSelectDay = (dateString: string, closePopover: () => void) => {
        onChange(dateString);
        closePopover();
    };

    return (
        <Popover className="relative w-full">
            {({ open, close }) => (
                <>
                    <PopoverStateSync open={open} onClose={() => setMode('days')} />
                    <PopoverButton
                        id={id}
                        disabled={disabled}
                        className={`w-full flex items-center justify-between rounded-md border bg-slate-50 pl-3 pr-10 py-2 font-sans text-xs transition-colors duration-150 select-none text-left cursor-pointer outline-hidden
                            ${open ? 'border-slate-400 bg-white ring-1 ring-slate-400/20' : 'border-slate-200 hover:border-slate-350'}
                            ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'text-slate-900'}
                        `}
                    >
                        <span className={value ? 'text-slate-900 font-medium' : 'text-slate-400 font-light'}>
                            {value ? formatDateForDisplay(value) : placeholder}
                        </span>
                        <Calendar className={`absolute right-3 h-4 w-4 transition-colors duration-150 ${open ? 'text-slate-700' : 'text-slate-400'}`} />
                    </PopoverButton>

                    <PopoverPanel
                        transition
                        anchor="bottom start"
                        className="z-50 mt-1 w-72 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md p-4 shadow-xl select-none transition duration-200 ease-out origin-top-left data-closed:-translate-y-1 data-closed:scale-[0.98] data-closed:opacity-0"
                    >
                        {mode === 'days' && (
                            <>
                                {/* Calendar Header */}
                                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                                    <button
                                        type="button"
                                        onClick={handlePrevMonth}
                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-black transition"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <div className="flex items-center space-x-1 font-sans text-xs font-bold">
                                        <button
                                            type="button"
                                            onClick={() => setMode('months')}
                                            className="hover:bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded transition cursor-pointer"
                                        >
                                            {MONTHS[viewMonth]}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMode('years')}
                                            className="hover:bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded transition cursor-pointer"
                                        >
                                            {viewYear}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleNextMonth}
                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-black transition"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Days of week header */}
                                <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                                    {DAYS_OF_WEEK.map((day) => (
                                        <span key={day} className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {day}
                                        </span>
                                    ))}
                                </div>

                                {/* Days grid */}
                                <div className="grid grid-cols-7 gap-1 text-center">
                                    {gridCells.map((cell, idx) => {
                                        const isSelected = cell.dateString === value;
                                        const isToday = cell.dateString === new Date().toISOString().split('T')[0];

                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleSelectDay(cell.dateString, close)}
                                                className={`
                                                    h-8 w-8 rounded-lg font-sans text-xs font-semibold transition-all duration-100 flex items-center justify-center cursor-pointer outline-hidden
                                                    ${cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-350'}
                                                    ${isSelected 
                                                        ? 'bg-black text-white font-bold scale-105 shadow-xs' 
                                                        : isToday 
                                                            ? 'bg-slate-100 border border-slate-250 text-black font-extrabold' 
                                                            : 'hover:bg-slate-100 hover:text-black'
                                                    }
                                                `}
                                            >
                                                {cell.day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {mode === 'months' && (
                            <>
                                {/* Months Header */}
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 font-sans text-xs font-bold text-slate-800 px-1">
                                    <span>Select Month</span>
                                    <button
                                        type="button"
                                        onClick={() => setMode('days')}
                                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-black transition cursor-pointer"
                                    >
                                        Back
                                    </button>
                               </div>

                                {/* Months Grid */}
                                <div className="grid grid-cols-3 gap-2">
                                    {SHORT_MONTHS.map((m, idx) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => {
                                                setViewMonth(idx);
                                                setMode('days');
                                            }}
                                            className={`
                                                py-2 rounded-lg font-sans text-xs font-semibold transition cursor-pointer outline-hidden
                                                ${idx === viewMonth 
                                                    ? 'bg-black text-white font-bold' 
                                                    : 'text-slate-700 hover:bg-slate-100 hover:text-black'
                                                }
                                            `}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {mode === 'years' && (
                            <>
                                {/* Years Header */}
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setYearPageStart((y) => y - 12)}
                                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-black transition cursor-pointer"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="font-sans text-xs font-bold text-slate-800">
                                        {yearPageStart} - {yearPageStart + 11}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setYearPageStart((y) => y + 12)}
                                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-black transition cursor-pointer"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Years Grid */}
                                <div className="grid grid-cols-3 gap-2">
                                    {Array.from({ length: 12 }, (_, i) => yearPageStart + i).map((y) => (
                                        <button
                                            key={y}
                                            type="button"
                                            onClick={() => {
                                                setViewYear(y);
                                                setMode('days');
                                            }}
                                            className={`
                                                py-2 rounded-lg font-sans text-xs font-semibold transition cursor-pointer outline-hidden
                                                ${y === viewYear 
                                                    ? 'bg-black text-white font-bold' 
                                                    : 'text-slate-700 hover:bg-slate-100 hover:text-black'
                                                }
                                            `}
                                        >
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </PopoverPanel>
                </>
            )}
        </Popover>
    );
};
