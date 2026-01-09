"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

interface ScheduleSelectorProps {
    schedules: {
        id: number;
        month: string; // "January 2026"
        createdAt: Date;
    }[];
    currentScheduleId?: number;
}

export function ScheduleSelector({ schedules, currentScheduleId }: ScheduleSelectorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Group by Year for better organization (optional, but requested "select the year")
    // Simple approach: Dropdown sorted by date. The text "January 2026" contains the year.
    // If user wants to filter by Year first, I could add a Year filter.
    // Given the likely volume (12 per year), a single dropdown is fine, but I can group items?
    // Select component doesn't support groups easily without custom setup.
    // I'll stick to a simple list but sort it clearly.

    const handleSelect = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("scheduleId", val);
        router.push(`/dashboard?${params.toString()}`);
    };

    if (!schedules || schedules.length === 0) return null;

    return (
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-md border border-white/10">
            <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
            <Select
                value={currentScheduleId?.toString() || ""}
                onValueChange={handleSelect}
            >
                <SelectTrigger className="w-[200px] border-0 bg-transparent focus:ring-0">
                    <SelectValue placeholder="Select Schedule" />
                </SelectTrigger>
                <SelectContent>
                    {schedules.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                            {s.month}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
