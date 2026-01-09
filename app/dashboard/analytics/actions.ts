"use server";

import { db } from "@/lib/db";
import { schedules } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { DOCTORS } from "@/lib/constants";
import { DaySchedule } from "@/lib/scheduler";

export interface MonthlyStats {
    month: string;
    stats: Record<string, number>;
}

export async function getAnalyticsData() {
    try {
        const allSchedules = await db.query.schedules.findMany({
            orderBy: [desc(schedules.createdAt)],
        });

        const analytics: MonthlyStats[] = allSchedules.map((sch) => {
            const data: DaySchedule[] = JSON.parse(sch.data);
            const stats: Record<string, number> = {};

            // Initialize with 0
            DOCTORS.forEach(doc => stats[doc] = 0);

            data.forEach((day) => {
                if (day.assignments["New GGH"]) {
                    stats[day.assignments["New GGH"]] = (stats[day.assignments["New GGH"]] || 0) + 1;
                }
                if (day.assignments["Old GGH"]) {
                    stats[day.assignments["Old GGH"]] = (stats[day.assignments["Old GGH"]] || 0) + 1;
                }
                if (day.assignments["RICU"]) {
                    day.assignments["RICU"].forEach((doc) => {
                        stats[doc] = (stats[doc] || 0) + 1;
                    });
                }
            });

            return {
                month: sch.month,
                stats
            };
        });

        return { success: true, data: analytics };
    } catch (error) {
        console.error("Failed to fetch analytics", error);
        return { success: false, error: "Failed to load analytics data" };
    }
}
