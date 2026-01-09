"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteUser, updateUserRole } from "@/app/dashboard/actions";
import { Loader2, Trash2, Shield, User } from "lucide-react";
import { toast } from "sonner";

interface User {
    id: number;
    clerkId: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: Date;
}

interface UserManagementTableProps {
    users: User[];
    currentUserId: number;
}

export function UserManagementTable({ users, currentUserId }: UserManagementTableProps) {
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const filteredUsers = users.filter(u => u.id !== currentUserId);

    const handleRoleChange = async (usedId: number, newRole: "user" | "admin" | "superadmin") => {
        setLoadingId(usedId);
        try {
            const res = await updateUserRole(usedId, newRole);
            if (res.success) {
                toast.success("User role updated successfully");
            } else {
                toast.error(res.error || "Failed to update role");
            }
        } catch (e) {
            console.error("Failed to update role", e);
            toast.error("Failed to update user role");
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (userId: number) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        setLoadingId(userId);
        try {
            const res = await deleteUser(userId);
            if (res.success) {
                toast.success("User deleted successfully");
            } else {
                toast.error(res.error || "Failed to delete user");
            }
        } catch (e) {
            console.error("Failed to delete user", e);
            toast.error("An unexpected error occurred");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="rounded-md border border-white/10 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-xs uppercase font-medium text-muted-foreground">
                    <tr>
                        <th className="px-4 py-3 border-b border-white/10">User</th>
                        <th className="px-4 py-3 border-b border-white/10">Email</th>
                        <th className="px-4 py-3 border-b border-white/10">Role</th>
                        <th className="px-4 py-3 border-b border-white/10 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 font-medium">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    {user.name || "Unknown"}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                            <td className="px-4 py-3">
                                <select
                                    className="bg-black/50 border border-white/20 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-white/50"
                                    value={user.role}
                                    disabled={loadingId === user.id}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Super Admin</option>
                                </select>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(user.id)}
                                    disabled={loadingId === user.id}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/10"
                                >
                                    {loadingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
