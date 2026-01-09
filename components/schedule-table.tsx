"use client";

import { useState, useRef, useEffect } from "react";
import { DaySchedule, getEligibleDoctors } from "@/lib/scheduler";
import { Button } from "@/components/ui/button";
import { deleteSchedule, updateSchedule, regenerateSchedule, getOrGenerateShareToken } from "@/app/dashboard/actions";
import { Loader2, Trash2, Edit2, Save, X, RefreshCw, Share2, Download, CheckCircle2, Plus, Minus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface ScheduleTableProps {
    schedule: DaySchedule[];
    scheduleId?: number;
    isAdmin: boolean;
    month?: string;
}

export function ScheduleTable({ schedule, scheduleId, isAdmin, month }: ScheduleTableProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editedSchedule, setEditedSchedule] = useState<DaySchedule[]>(schedule);
    const [loading, setLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const todayRef = useRef<HTMLTableRowElement>(null);
    const now = new Date();
    const currentDate = now.getDate();
    const currentMonthStr = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    const isCurrentScheduleMonth = month === currentMonthStr;

    // Restrictions Logic
    let isRegenerationDisabled = false;
    let isEditingDisabled = false;
    const regenerationTooltip = "Schedule regeneration is only allowed for future months.";
    const editingTooltip = "Editing is disabled for past months.";

    if (month) {
        const now = new Date();
        const scheduleDateStart = new Date(month);
        scheduleDateStart.setDate(1);
        scheduleDateStart.setHours(0, 0, 0, 0);

        const nextMonthStart = new Date(month);
        nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);
        nextMonthStart.setDate(1);
        nextMonthStart.setHours(0, 0, 0, 0);

        // Disable regeneration if month has begun
        if (now >= scheduleDateStart) {
            isRegenerationDisabled = true;
        }

        // Disable editing if month has ended (start of next month reached)
        if (now >= nextMonthStart) {
            isEditingDisabled = true;
        }
    }

    useEffect(() => {
        setEditedSchedule(schedule);
    }, [schedule]);

    useEffect(() => {
        if (todayRef.current && !isEditing && isCurrentScheduleMonth) {
            // Optional: scroll to current day on load
            // todayRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [schedule, isEditing, isCurrentScheduleMonth]);


    const handleDelete = async () => {
        if (!scheduleId) return;

        setIsDeleteModalOpen(false);
        setLoading(true);

        try {
            await deleteSchedule(scheduleId);
            toast.success("Schedule Deleted", {
                description: "The schedule has been permanently removed from the system.",
                icon: <Trash2 className="h-5 w-5 text-red-500" />,
                className: "bg-[#0a0a0a] border border-white/10 text-white p-4",
            });
            router.refresh();
        } catch (e) {
            console.error("Failed to delete", e);
            toast.error("Failed to delete schedule");
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (!scheduleId) return;
        if (isRegenerationDisabled) {
            toast.error(regenerationTooltip);
            return;
        }
        if (!confirm("Are you sure you want to REGENERATE this schedule? This will overwrite all current assignments immediately.")) return;

        setLoading(true);
        try {
            const res = await regenerateSchedule(scheduleId);
            if (res.success) {
                toast.success("Schedule regenerated successfully");
            } else {
                toast.error(res.error || "Failed to regenerate");
            }
        } catch (e) {
            console.error("Failed to regenerate", e);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!scheduleId) return;
        setLoading(true);
        try {
            await updateSchedule(scheduleId, editedSchedule);
            setIsEditing(false);
            toast.success("Changes saved");
        } catch (e) {
            console.error("Failed to save", e);
            toast.error("Failed to save schedule");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!scheduleId) return;
        setLoading(true);
        try {
            const res = await getOrGenerateShareToken(scheduleId);
            if (res.success && res.token) {
                const url = `${window.location.origin}/share/${res.token}`;
                await navigator.clipboard.writeText(url);
                toast.success("Share link copied to clipboard!");
            } else {
                toast.error(res.error || "Failed to generate share link");
            }
        } catch (e) {
            console.error("Failed to share", e);
            toast.error("Failed to share schedule");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!schedule || schedule.length === 0) return;

        const csvRows = [
            ["Day", "New GGH", "Old GGH", "RICU"]
        ];

        schedule.forEach(day => {
            const ricu = day.assignments["RICU"]?.join(" & ") || "";
            csvRows.push([
                day.day.toString(),
                day.assignments["New GGH"] || "",
                day.assignments["Old GGH"] || "",
                ricu
            ]);
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `schedule_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Schedule exported to CSV");
    };

    const updateCell = (dayIndex: number, field: "New GGH" | "Old GGH" | "RICU", value: string, subIndex?: number) => {
        const newSchedule = [...editedSchedule];
        if (field === "RICU") {
            if (typeof subIndex === "number") {
                const currentRicu = newSchedule[dayIndex].assignments.RICU || [];
                const newRicu = [...currentRicu];
                newRicu[subIndex] = value;
                newSchedule[dayIndex].assignments.RICU = newRicu;
            }
        } else {
            newSchedule[dayIndex].assignments[field] = value;
        }
        setEditedSchedule(newSchedule);
    };

    const handleAddRicuSlot = (dayIndex: number) => {
        const newSchedule = [...editedSchedule];
        const currentRicu = newSchedule[dayIndex].assignments.RICU || [];
        if (currentRicu.length >= 2) return; // Guard 2-doctor limit
        newSchedule[dayIndex].assignments.RICU = [...currentRicu, ""];
        setEditedSchedule(newSchedule);
    };

    const handleRemoveRicuSlot = (dayIndex: number, subIndex: number) => {
        const newSchedule = [...editedSchedule];
        const currentRicu = newSchedule[dayIndex].assignments.RICU || [];
        if (currentRicu.length <= 1) return; // Guard 1-doctor minimum
        const newRicu = currentRicu.filter((_, idx) => idx !== subIndex);
        newSchedule[dayIndex].assignments.RICU = newRicu;
        setEditedSchedule(newSchedule);
    };

    const SmartSelect = ({ day, currentVal, field, subIndex }: { day: number, currentVal: string, field: string, subIndex?: number }) => {
        let currentSlotDocs: string[] = [];
        const daySch = editedSchedule.find(s => s.day === day);

        if (daySch) {
            currentSlotDocs = [currentVal].filter(Boolean);
        }

        const eligible = getEligibleDoctors(editedSchedule, day, currentSlotDocs);
        const options = Array.from(new Set([currentVal, ...eligible])).filter(Boolean).sort();
        const isInvalid = currentVal && !eligible.includes(currentVal);

        return (
            <div className="relative w-full group/select">
                <select
                    className={`
                        w-full bg-black/50 border rounded px-2 py-2 text-sm appearance-none
                        focus:ring-1 focus:ring-white/50 focus:outline-none pr-8
                        ${isInvalid ? "border-red-500/50 text-red-400" : "border-white/20"}
                    `}
                    value={currentVal}
                    onChange={(e) => updateCell(day - 1, field as any, e.target.value, subIndex)}
                >
                    <option value="">Select Doctor</option>
                    {options.map(doc => (
                        <option key={doc} value={doc}>
                            {doc} {(!eligible.includes(doc) && doc !== currentVal) ? "(Busy/Rest)" : ""}
                        </option>
                    ))}
                </select>
                {field === "RICU" && typeof subIndex === "number" && editedSchedule[day - 1].assignments.RICU!.length > 1 && (
                    <button
                        onClick={() => handleRemoveRicuSlot(day - 1, subIndex)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-400 opacity-0 group-hover/select:opacity-100 transition-opacity"
                    >
                        <Minus className="h-3 w-3" />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {scheduleId && (
                <div className="flex flex-col md:flex-row flex-wrap justify-end gap-2 sticky top-[80px] z-20 bg-background/95 backdrop-blur py-2 border-b border-white/5 md:bg-transparent md:static md:p-0 md:border-0 items-stretch md:items-center">
                    {isAdmin ? (
                        <>
                            {isEditing ? (
                                <>
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={loading} className="w-full md:w-auto">
                                        <X className="h-4 w-4 mr-2" /> Cancel
                                    </Button>
                                    <Button variant="default" size="sm" onClick={handleSave} disabled={loading} className="bg-white text-black hover:bg-white/90 w-full md:w-auto">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <Button variant="outline" size="sm" onClick={handleExport} className="border-white/10 hover:bg-white/5 flex-1">
                                            <Download className="h-4 w-4 mr-2" /> Export
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleShare} disabled={loading} className="border-white/10 hover:bg-white/5 flex-1">
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4 mr-2" />} Share
                                        </Button>
                                    </div>

                                    <div className="flex gap-2 w-full md:w-auto">
                                        <Button variant="destructive" size="sm" onClick={() => setIsDeleteModalOpen(true)} disabled={loading} className="flex-1">
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />} Delete
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleRegenerate}
                                            disabled={loading || isRegenerationDisabled}
                                            className={`bg-white/5 text-white hover:bg-white/10 border border-white/10 flex-1 ${isRegenerationDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                            title={isRegenerationDisabled ? regenerationTooltip : "Regenerate assignments (randomized)"}
                                        >
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />} Regenerate
                                        </Button>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => { setEditedSchedule(schedule); setIsEditing(true); }}
                                        disabled={isEditingDisabled}
                                        className={`border-white/10 hover:bg-white/5 w-full md:w-auto ${isEditingDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                        title={isEditingDisabled ? editingTooltip : "Edit manual assignments"}
                                    >
                                        <Edit2 className="h-4 w-4 mr-2" /> Edit Schedule
                                    </Button>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button variant="outline" size="sm" onClick={handleExport} className="border-white/10 hover:bg-white/5 flex-1">
                                <Download className="h-4 w-4 mr-2" /> Export
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleShare} disabled={loading} className="border-white/10 hover:bg-white/5 flex-1">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4 mr-2" />} Share
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <div className="rounded-md border border-white/10 overflow-hidden w-full relative group shadow-2xl origin-bottom">
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
                            {(isEditing ? editedSchedule : schedule).map((day, index) => {
                                const isToday = !isEditing && isCurrentScheduleMonth && day.day === currentDate;
                                return (
                                    <tr
                                        key={day.day}
                                        ref={isToday ? todayRef : null}
                                        className={`transition-colors group/row ${isToday ? "bg-yellow-500/10 hover:bg-yellow-500/20" : "hover:bg-white/5"}`}
                                    >
                                        <td className={`px-1 py-3 font-mono text-[10px] md:text-sm sticky left-0 border-r border-white/5 text-center shadow-[1px_0_0_0_rgba(255,255,255,0.1)] z-10 ${isToday ? "bg-[#0a0a0a] text-yellow-500 font-bold" : "bg-[#0a0a0a] text-muted-foreground group-hover/row:bg-[#0a0a0a]"}`}>
                                            {day.day}
                                        </td>
                                        <td className="px-2 md:px-4 py-3">
                                            {isEditing ? (
                                                <SmartSelect day={day.day} currentVal={day.assignments["New GGH"] || ""} field="New GGH" />
                                            ) : (
                                                <span className="text-xs md:text-sm">{day.assignments["New GGH"] || "-"}</span>
                                            )}
                                        </td>
                                        <td className="px-2 md:px-4 py-3">
                                            {isEditing ? (
                                                <SmartSelect day={day.day} currentVal={day.assignments["Old GGH"] || ""} field="Old GGH" />
                                            ) : (
                                                <span className="text-xs md:text-sm">{day.assignments["Old GGH"] || "-"}</span>
                                            )}
                                        </td>
                                        <td className="px-2 md:px-4 py-3">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-2">
                                                    {(day.assignments["RICU"] && day.assignments["RICU"].length > 0 ? day.assignments["RICU"] : ["", ""]).map((doc, idx) => (
                                                        <SmartSelect key={idx} day={day.day} currentVal={doc} field="RICU" subIndex={idx} />
                                                    ))}
                                                    {day.assignments["RICU"]!.length < 2 && (
                                                        <button
                                                            onClick={() => handleAddRicuSlot(index)}
                                                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-white transition-colors mt-1"
                                                        >
                                                            <Plus className="h-3 w-3" /> Add Doctor
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs md:text-sm">{day.assignments["RICU"]?.join(", ") || "-"}</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative z-10"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 bg-red-500/10 rounded-xl">
                                    <AlertTriangle className="h-6 w-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Delete Schedule?</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Are you sure you want to permanently delete the <span className="text-white font-medium">{month}</span> schedule? This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end italic">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="hover:bg-white/5 text-muted-foreground"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    className="bg-red-500 hover:bg-red-600 text-white border-none shadow-lg shadow-red-500/20 px-6"
                                >
                                    Delete Permanently
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="md:hidden text-[10px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-2">
                <span>← Scroll to view more →</span>
            </div>
        </div>
    );
}
