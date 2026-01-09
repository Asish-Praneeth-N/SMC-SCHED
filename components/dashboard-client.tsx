"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { BarChart3, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminControls } from "@/components/admin-controls";
import { ScheduleTable } from "@/components/schedule-table";
import { UserManagementTable } from "@/components/user-management-table";
import { ScheduleSelector } from "@/components/schedule-selector";

interface DashboardClientProps {
    userData: {
        firstName: string | null;
        role: string;
        id: number;
    };
    currentSchedule: any;
    availableSchedules: any[];
    allUsers: any[];
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

export function DashboardClient({
    userData,
    currentSchedule,
    availableSchedules,
    allUsers,
    isAdmin,
    isSuperAdmin
}: DashboardClientProps) {
    const [activeTab, setActiveTab] = useState<"schedule" | "users">("schedule");

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-white/10 p-6 flex flex-col md:flex-row justify-between items-center bg-black/40 backdrop-blur-md sticky top-0 z-50 gap-4 md:gap-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground text-sm">
                        {isSuperAdmin ? "Super Admin Access" : isAdmin ? "Administrator Access" : `Welcome, Dr. ${userData.firstName}`}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/analytics">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-white">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden md:inline">Analytics</span>
                        </Button>
                    </Link>
                    <div className={`px-3 py-1 rounded-full border text-xs font-mono 
                        ${isSuperAdmin ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "bg-white/5 border-white/10"}`}>
                        {userData.role.toUpperCase()}
                    </div>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
                {/* Tabs Navigation */}
                {isSuperAdmin && (
                    <div className="flex border-b border-white/10 mb-6">
                        <button
                            onClick={() => setActiveTab("schedule")}
                            className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === "schedule"
                                ? "text-white"
                                : "text-muted-foreground hover:text-white/80"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Schedule
                            </div>
                            {activeTab === "schedule" && (
                                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === "users"
                                ? "text-purple-400"
                                : "text-muted-foreground hover:text-purple-400/80"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                User Management
                            </div>
                            {activeTab === "users" && (
                                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                            )}
                        </button>
                    </div>
                )}

                {/* Schedule Tab Content */}
                {activeTab === "schedule" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Admin Section */}
                        {isAdmin && (
                            <section>
                                <AdminControls />
                            </section>
                        )}

                        {/* Schedule Display */}
                        <section className="space-y-4">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                                    <h2 className="text-xl font-semibold whitespace-nowrap">
                                        {currentSchedule ? `Schedule: ${currentSchedule.month}` : "Current Schedule"}
                                    </h2>
                                    <div className="w-full md:w-auto">
                                        <ScheduleSelector
                                            schedules={availableSchedules}
                                            currentScheduleId={currentSchedule?.id}
                                        />
                                    </div>
                                </div>
                                {currentSchedule && (
                                    <div className="text-xs text-muted-foreground">
                                        Generated: {new Date(currentSchedule.createdAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            <ScheduleTable
                                schedule={currentSchedule?.data || []}
                                scheduleId={currentSchedule?.id}
                                isAdmin={isAdmin}
                                month={currentSchedule?.month}
                            />
                        </section>
                    </div>
                )}

                {/* User Management Tab Content */}
                {activeTab === "users" && isSuperAdmin && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-purple-400">User Management</h2>
                        </div>
                        <UserManagementTable users={allUsers as any} currentUserId={userData.id} />
                    </div>
                )}
            </main>
        </div>
    );
}
