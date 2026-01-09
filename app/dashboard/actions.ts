'use server';

import { db } from "@/lib/db";
import { schedules, users } from "@/lib/db/schema";
import { generateSchedule, ScheduleResult } from "@/lib/scheduler";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function generateAndSaveSchedule(month: string, daysInMonth: number, ricuDoubleDays: number) {
    const user = await currentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser || (dbUser.role !== "admin" && dbUser.role !== "superadmin")) {
        return { success: false, error: "Permission denied. Only Admins can generate schedules." };
    }

    // Check for Duplicate
    const existing = await db.query.schedules.findFirst({
        where: eq(schedules.month, month),
    });
    if (existing) {
        return { success: false, error: "Schedule for this month already exists. Use 'Regenerate' or 'Delete' instead." };
    }

    // Generate Schedule
    const result: ScheduleResult = generateSchedule(daysInMonth, ricuDoubleDays);

    if (!result.success) {
        return { success: false, error: "Failed to generate a valid schedule.", violations: result.violations };
    }

    // Save to DB
    await db.insert(schedules).values({
        month,
        data: JSON.stringify(result.schedule),
        config: JSON.stringify({ daysInMonth, ricuDoubleDays }),
        isPublished: "false",
    });

    revalidatePath("/dashboard");
    return { success: true, warning: result.violations.length > 0 ? result.violations : undefined };
}

export async function createEmptySchedule(month: string, daysInMonth: number, ricuDoubleDays: number) {
    const user = await currentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser || (dbUser.role !== "admin" && dbUser.role !== "superadmin")) {
        return { success: false, error: "Permission denied. Only Admins can generate schedules." };
    }

    // Check for Duplicate
    const existing = await db.query.schedules.findFirst({
        where: eq(schedules.month, month),
    });
    if (existing) {
        return { success: false, error: "Schedule for this month already exists." };
    }

    // Create Empty Schedule Structure
    const schedule = [];
    for (let day = 1; day <= daysInMonth; day++) {
        schedule.push({
            day,
            assignments: {
                "New GGH": "",
                "Old GGH": "",
                "RICU": [] as string[]
            }
        });
    }

    // Save to DB
    await db.insert(schedules).values({
        month,
        data: JSON.stringify(schedule),
        config: JSON.stringify({ daysInMonth, ricuDoubleDays }),
        isPublished: "false",
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function regenerateSchedule(id: number) {
    const user = await currentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser || (dbUser.role !== "admin" && dbUser.role !== "superadmin")) {
        return { success: false, error: "Permission denied." };
    }

    const currentSchedule = await db.query.schedules.findFirst({
        where: eq(schedules.id, id),
    });

    if (!currentSchedule) {
        return { success: false, error: "Schedule not found" };
    }

    const config = JSON.parse(currentSchedule.config);
    // Use fallback values if config is somehow missing properties
    const result: ScheduleResult = generateSchedule(
        config.daysInMonth || 30,
        config.ricuDoubleDays || 10
    );

    if (!result.success) {
        return { success: false, error: "Failed to regenerate a valid schedule.", violations: result.violations };
    }

    await db.update(schedules)
        .set({
            data: JSON.stringify(result.schedule),
        })
        .where(eq(schedules.id, id));

    revalidatePath("/dashboard");
    return { success: true, warning: result.violations.length > 0 ? result.violations : undefined };
}

export async function getLatestSchedule() {
    const latestSchedule = await db.query.schedules.findFirst({
        orderBy: [desc(schedules.createdAt)],
    });

    if (!latestSchedule) return null;

    return {
        ...latestSchedule,
        data: JSON.parse(latestSchedule.data),
        config: JSON.parse(latestSchedule.config),
    };
}

export async function getAvailableSchedules() {
    const allSchedules = await db.query.schedules.findMany({
        orderBy: [desc(schedules.createdAt)],
        columns: {
            id: true,
            month: true,
            createdAt: true,
        },
    });
    return allSchedules;
}

export async function getScheduleById(id: number) {
    const schedule = await db.query.schedules.findFirst({
        where: eq(schedules.id, id),
    });

    if (!schedule) return null;

    return {
        ...schedule,
        data: JSON.parse(schedule.data),
        config: JSON.parse(schedule.config),
    };
}

export async function getUserRole() {
    const user = await currentUser();
    if (!user) return "user"; // Default to minimal access

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    return dbUser?.role || "user";
}

export async function updateSchedule(id: number, newData: any) {
    const user = await currentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser || (dbUser.role !== "admin" && dbUser.role !== "superadmin")) {
        return { success: false, error: "Permission denied." };
    }

    await db.update(schedules)
        .set({ data: JSON.stringify(newData) })
        .where(eq(schedules.id, id));

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteSchedule(id: number) {
    const user = await currentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser || (dbUser.role !== "admin" && dbUser.role !== "superadmin")) {
        return { success: false, error: "Permission denied." };
    }

    await db.delete(schedules).where(eq(schedules.id, id));

    revalidatePath("/dashboard");
    return { success: true };
}

export async function getAllUsers() {
    const role = await getUserRole();
    if (role !== "superadmin") return { success: false, error: "Unauthorized" };

    const allUsers = await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
    });
    return { success: true, data: allUsers };
}

export async function updateUserRole(userId: number, newRole: "user" | "admin" | "superadmin") {
    const role = await getUserRole();
    if (role !== "superadmin") return { success: false, error: "Unauthorized" };

    if (!["user", "admin", "superadmin"].includes(newRole)) {
        return { success: false, error: "Invalid role" };
    }

    await db.update(users).set({ role: newRole }).where(eq(users.id, userId));
    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteUser(userId: number) {
    const role = await getUserRole();
    if (role !== "superadmin") return { success: false, error: "Unauthorized" };

    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/dashboard");
    return { success: true };
}

export async function getOrGenerateShareToken(scheduleId: number) {
    const user = await currentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser || (dbUser.role !== "admin" && dbUser.role !== "superadmin")) {
        return { success: false, error: "Permission denied." };
    }

    const schedule = await db.query.schedules.findFirst({
        where: eq(schedules.id, scheduleId),
    });

    if (!schedule) return { success: false, error: "Schedule not found" };

    if (schedule.shareToken) {
        return { success: true, token: schedule.shareToken };
    }

    const newToken = crypto.randomUUID();
    await db.update(schedules)
        .set({ shareToken: newToken })
        .where(eq(schedules.id, scheduleId));

    return { success: true, token: newToken };
}

export async function getPublicScheduleByToken(token: string) {
    const schedule = await db.query.schedules.findFirst({
        where: eq(schedules.shareToken, token),
    });

    if (!schedule) return null;

    return {
        ...schedule,
        data: JSON.parse(schedule.data),
        config: JSON.parse(schedule.config),
    };
}
