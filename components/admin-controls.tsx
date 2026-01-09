"use client";

import { useState } from "react";
import { generateAndSaveSchedule, createEmptySchedule } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Calendar as CalendarIcon, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AdminControls() {
    const [loading, setLoading] = useState(false);
    const [scratchLoading, setScratchLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Form State
    const [dateStr, setDateStr] = useState("2026-01"); // Default for picker
    const [month, setMonth] = useState("January 2026");
    const [daysInMonth, setDaysInMonth] = useState(31);
    const [ricuDoubleDays, setRicuDoubleDays] = useState(10); // Default min

    const handleDateChange = (val: string) => {
        setDateStr(val);
        if (!val) return;

        const date = new Date(val + "-01");
        const y = date.getFullYear();
        const m = date.getMonth(); // 0-indexed

        // Format Month String e.g. "February 2026"
        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        setMonth(monthName);

        // Calc days in month (m + 1 is next month, day 0 is last day of current month)
        const days = new Date(y, m + 1, 0).getDate();
        setDaysInMonth(days);
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await generateAndSaveSchedule(month, Number(daysInMonth), Number(ricuDoubleDays));

            if (result.success) {
                toast.success("Schedule generated successfully!", {
                    description: `New schedule for ${month} has been created.`,
                });
                router.refresh();
            } else {
                toast.error(result.error || "Failed to generate schedule");
                if (result.violations) {
                    setError(`Violations: ${result.violations.join(", ")}`);
                }
            }
        } catch (err) {
            toast.error("An unexpected error occurred.");
            setError("Communication failure with the server.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateScratch = async () => {
        setScratchLoading(true);
        setError(null);
        try {
            const result = await createEmptySchedule(month, Number(daysInMonth), Number(ricuDoubleDays));
            if (result.success) {
                toast.success("Empty schedule created!", {
                    description: `You can now start assigning doctors for ${month}.`,
                });
                router.refresh();
            } else {
                toast.error(result.error || "Failed to create schedule");
            }
        } catch (e) {
            toast.error("An unexpected error occurred.");
        } finally {
            setScratchLoading(false);
        }
    };

    return (
        <div className="p-6 border border-white/10 rounded-lg bg-black/20 mb-8 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Admin Controls</h2>
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-muted-foreground">Restricted</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Select Month</label>
                    <input
                        type="month"
                        value={dateStr}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-white/30 [color-scheme:dark]"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Days (Auto)</label>
                    <div className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-muted-foreground flex items-center justify-between">
                        <span>{daysInMonth} Days</span>
                        <span className="text-xs opacity-50">{month}</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">RICU Double Days</label>
                    <input
                        type="number"
                        min={0}
                        value={ricuDoubleDays}
                        onChange={(e) => setRicuDoubleDays(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                    />
                </div>
            </div>
            <div className="pt-2 flex flex-col md:flex-row gap-4">
                <Button
                    onClick={handleGenerate}
                    disabled={loading || scratchLoading}
                    className="bg-white text-black hover:bg-white/90 w-full md:w-auto"
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Auto-Generate Schedule
                </Button>
                <Button
                    onClick={handleCreateScratch}
                    disabled={loading || scratchLoading}
                    variant="outline"
                    className="border-white/20 hover:bg-white/5 w-full md:w-auto"
                >
                    {scratchLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Create from Scratch
                </Button>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded">
                    {error}
                </div>
            )}
        </div>
    );
}
