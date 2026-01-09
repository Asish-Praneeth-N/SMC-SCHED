"use client";

import { DaySchedule } from "@/lib/scheduler";
import { useEffect, useRef } from "react";

interface PublicScheduleViewProps {
    schedule: DaySchedule[];
    month: string;
}

export function PublicScheduleView({ schedule, month }: PublicScheduleViewProps) {
    const todayRef = useRef<HTMLTableRowElement>(null);
    const now = new Date();
    const currentDate = now.getDate();
    const currentMonthStr = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    const isCurrentScheduleMonth = month === currentMonthStr;

    useEffect(() => {
        if (todayRef.current && isCurrentScheduleMonth) {
            todayRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [isCurrentScheduleMonth]);

    if (!schedule || schedule.length === 0) {
        return <div className="text-center p-4 text-muted-foreground">No schedule data available.</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Schedule: {month}</h1>
            </div>

            <div className="rounded-md border border-white/10 overflow-hidden w-full relative group">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <table className="w-full text-sm text-left border-collapse min-w-[500px] md:min-w-[600px]">
                        <thead className="bg-white/5 text-xs uppercase font-medium text-muted-foreground">
                            <tr>
                                <th className="px-1 py-3 border-b border-white/10 w-[30px] sticky left-0 bg-[#0a0a0a] z-20 text-center shadow-[1px_0_0_0_rgba(255,255,255,0.1)]">Day</th>
                                <th className="px-2 md:px-4 py-3 border-b border-white/10 min-w-[140px]">New GGH</th>
                                <th className="px-2 md:px-4 py-3 border-b border-white/10 min-w-[140px]">Old GGH</th>
                                <th className="px-2 md:px-4 py-3 border-b border-white/10 min-w-[140px]">RICU</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {schedule.map((day) => {
                                const isToday = isCurrentScheduleMonth && day.day === currentDate;
                                return (
                                    <tr
                                        key={day.day}
                                        ref={isToday ? todayRef : null}
                                        className={`
                                            transition-colors group/row
                                            ${isToday ? "bg-yellow-500/10 hover:bg-yellow-500/20" : "hover:bg-white/5"}
                                        `}
                                    >
                                        <td className={`
                                            px-1 py-3 font-mono text-[10px] md:text-sm sticky left-0 border-r border-white/5 text-center shadow-[1px_0_0_0_rgba(255,255,255,0.1)] z-10
                                            ${isToday ? "bg-[#0a0a0a] text-yellow-500 font-bold" : "bg-[#0a0a0a] text-muted-foreground group-hover/row:bg-[#0a0a0a]"}
                                        `}>
                                            {day.day}
                                        </td>
                                        <td className="px-2 md:px-4 py-3">
                                            <span className="text-xs md:text-sm">{day.assignments["New GGH"] || "-"}</span>
                                        </td>
                                        <td className="px-2 md:px-4 py-3">
                                            <span className="text-xs md:text-sm">{day.assignments["Old GGH"] || "-"}</span>
                                        </td>
                                        <td className="px-2 md:px-4 py-3">
                                            <span className="text-xs md:text-sm">{day.assignments["RICU"]?.join(", ") || "-"}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="md:hidden text-[10px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-2">
                <span>← Scroll to view more →</span>
            </div>
        </div>
    );
}
