import { DOCTORS } from "./constants";

type DutyType = "New GGH" | "Old GGH" | "RICU";

export interface DaySchedule {
    day: number;
    assignments: {
        "New GGH"?: string;
        "Old GGH"?: string;
        "RICU"?: string[];
    };
}

export interface ScheduleResult {
    schedule: DaySchedule[];
    doctorStats: { [key: string]: number };
    violations: string[];
    success: boolean;
}

export function generateSchedule(daysInMonth: number, ricuDoubleDays: number): ScheduleResult {
    const doctorStats: { [key: string]: number } = {};
    const lastDutyDay: { [key: string]: number } = {};

    DOCTORS.forEach(doc => {
        doctorStats[doc] = 0;
        lastDutyDay[doc] = -100; // Initialize far in the past
    });

    const schedule: DaySchedule[] = [];
    const violations: string[] = [];

    // Determine RICU double days randomly or evenly distributed
    const doubleDaysSet = new Set<number>();
    while (doubleDaysSet.size < ricuDoubleDays) {
        doubleDaysSet.add(Math.floor(Math.random() * daysInMonth) + 1);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dailyAssignments: DaySchedule["assignments"] = { RICU: [] };
        const doctorsAssignedToday = new Set<string>();

        // Duties to fill: New GGH, Old GGH, RICU (1 or 2 slots)
        // We treat RICU slots as separate assignments logic-wise but store together
        const slots: { type: DutyType, isRicuBySlot?: boolean }[] = [
            { type: "New GGH" },
            { type: "Old GGH" },
            { type: "RICU" }
        ];

        if (doubleDaysSet.has(day)) {
            slots.push({ type: "RICU" });
        }

        for (const slot of slots) {
            // Filter eligible doctors
            const eligibleDoctors = DOCTORS.filter(doc => {
                // Rule: Max 5 duties
                if (doctorStats[doc] >= 5) return false;
                // Rule: Min 4 days gap (Day X duty -> Day X+4 eligible)
                // If last duty was day L, current day C must be >= L + 4
                if ((day - lastDutyDay[doc]) < 4) return false;
                // Rule: No double duty same day
                if (doctorsAssignedToday.has(doc)) return false;
                return true;
            });

            // Priority: Lowest duty count, then random tie-breaker
            eligibleDoctors.sort((a, b) => {
                if (doctorStats[a] !== doctorStats[b]) {
                    return doctorStats[a] - doctorStats[b];
                }
                return Math.random() - 0.5;
            });

            if (eligibleDoctors.length === 0) {
                violations.push(`Day ${day}: No eligible doctor for ${slot.type}`);
                continue;
            }

            const selectedDoc = eligibleDoctors[0];

            if (slot.type === "RICU") {
                dailyAssignments.RICU?.push(selectedDoc);
            } else {
                dailyAssignments[slot.type] = selectedDoc;
            }

            doctorsAssignedToday.add(selectedDoc);
            doctorStats[selectedDoc]++;
            lastDutyDay[selectedDoc] = day;
        }

        schedule.push({ day, assignments: dailyAssignments });
    }

    // Validate Final Stats
    DOCTORS.forEach(doc => {
        if (doctorStats[doc] < 4) {
            violations.push(`Doctor ${doc} has less than 4 duties (${doctorStats[doc]})`);
        }
    });

    return {
        schedule,
        doctorStats,
        violations,
        success: violations.length === 0
    };
}

export function getEligibleDoctors(
    fullSchedule: DaySchedule[],
    targetDay: number,
    currentSlotDocs: string[] // Doctors currently assigned to THIS specific slot (to ignore them effectively, or rather, the caller handles current value)
): string[] {
    // We want to find doctors who satisfy the rest constraint relative to ALL OTHER days.
    // We also need to exclude doctors already assigned to OTHER slots on the SAME targetDay.

    const busyDoctorsOnTargetDay = new Set<string>();

    // 1. Identify doctors working on targetDay in other slots
    const targetDaySchedule = fullSchedule.find(s => s.day === targetDay);
    if (targetDaySchedule) {
        Object.values(targetDaySchedule.assignments).forEach(val => {
            if (Array.isArray(val)) {
                val.forEach(d => {
                    if (!currentSlotDocs.includes(d)) busyDoctorsOnTargetDay.add(d);
                });
            } else if (typeof val === "string") {
                if (!currentSlotDocs.includes(val)) busyDoctorsOnTargetDay.add(val);
            }
        });
    }

    // 2. Identify doctors violating the rest constraint (gap < 4) from OTHER days
    const restingDoctors = new Set<string>();

    scheduleLoop: for (const daySch of fullSchedule) {
        if (daySch.day === targetDay) continue; // Skip the day we are editing

        // If the gap is too small, any doctor working on daySch.day is ineligible
        if (Math.abs(daySch.day - targetDay) < 4) {
            const workingDocs = new Set<string>();
            Object.values(daySch.assignments).forEach(val => {
                if (Array.isArray(val)) val.forEach(d => workingDocs.add(d));
                else if (typeof val === "string") workingDocs.add(val);
            });

            workingDocs.forEach(d => restingDoctors.add(d));
        }
    }

    return DOCTORS.filter(doc => {
        if (busyDoctorsOnTargetDay.has(doc)) return false; // Already working today
        if (restingDoctors.has(doc)) return false; // Needs rest
        return true;
    });
}
