import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getLatestSchedule, getAllUsers, getAvailableSchedules, getScheduleById } from "./actions";
import { DashboardClient } from "@/components/dashboard-client";

interface DashboardProps {
    searchParams: Promise<{ scheduleId?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardProps) {
    const user = await currentUser();
    const params = await searchParams;

    if (!user) {
        redirect("/sign-in");
    }

    // Sync user to database
    let dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) {
        await db.insert(users).values({
            clerkId: user.id,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName} ${user.lastName}`.trim(),
            role: "user", // Default Role
        });
        // Re-fetch to get the object
        dbUser = await db.query.users.findFirst({
            where: eq(users.clerkId, user.id),
        });
    }

    const availableSchedules = await getAvailableSchedules();
    let currentSchedule = null;

    if (params.scheduleId) {
        currentSchedule = await getScheduleById(Number(params.scheduleId));
    } else {
        // Default to latest
        if (availableSchedules.length > 0) {
            currentSchedule = await getScheduleById(availableSchedules[0].id);
        }
    }

    const isAdmin = dbUser?.role === "admin" || dbUser?.role === "superadmin";
    const isSuperAdmin = dbUser?.role === "superadmin";

    let allUsers: any[] = [];
    if (isSuperAdmin) {
        const usersRes = await getAllUsers();
        if (usersRes?.success) {
            allUsers = usersRes.data || [];
        }
    }

    const userData = {
        firstName: user.firstName,
        role: dbUser?.role || "user",
        id: dbUser?.id || -1,
    };

    return (
        <DashboardClient
            userData={userData}
            currentSchedule={currentSchedule}
            availableSchedules={availableSchedules}
            allUsers={allUsers}
            isAdmin={isAdmin}
            isSuperAdmin={isSuperAdmin}
        />
    )
}
