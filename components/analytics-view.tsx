"use client";

import { useState } from "react";
import { MonthlyStats } from "@/app/dashboard/analytics/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DOCTORS } from "@/lib/constants";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalyticsViewProps {
    data: MonthlyStats[];
}

export function AnalyticsView({ data }: AnalyticsViewProps) {
    const [selectedMonth, setSelectedMonth] = useState<string>(data[0]?.month || "");

    // Prepare data for the pivot table
    // Rows: Doctors, Columns: Months
    const months = data.map(d => d.month).reverse(); // Oldest to newest? Or maintain sort?

    // Chart Data for the selected month
    const currentMonthData = data.find(d => d.month === selectedMonth);
    const chartData = currentMonthData
        ? Object.entries(currentMonthData.stats)
            .map(([name, count]) => ({ name, assignments: count }))
            .sort((a, b) => b.assignments - a.assignments)
        : [];

    return (
        <div className="space-y-8">
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Monthly Overview: {selectedMonth}</CardTitle>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-[180px] bg-black/50 border-white/10">
                                <SelectValue placeholder="Select Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {data.map((d) => (
                                    <SelectItem key={d.month} value={d.month}>
                                        {d.month}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} stroke="#888" />
                                <YAxis stroke="#888" allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                                    itemStyle={{ color: "#fff" }}
                                />
                                <Bar dataKey="assignments" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle>Comprehensive History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/10 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-white/10">
                                    <TableHead className="w-[150px] sticky left-0 bg-black/80 backdrop-blur z-10">Doctor</TableHead>
                                    {months.map(m => (
                                        <TableHead key={m} className="text-center min-w-[100px]">{m}</TableHead>
                                    ))}
                                    <TableHead className="text-right font-bold">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {DOCTORS.map((doc) => {
                                    const total = data.reduce((acc, curr) => acc + (curr.stats[doc] || 0), 0);
                                    return (
                                        <TableRow key={doc} className="hover:bg-white/5 border-white/10">
                                            <TableCell className="font-medium sticky left-0 bg-black/20 backdrop-blur z-10">{doc}</TableCell>
                                            {months.map(m => {
                                                const stat = data.find(d => d.month === m)?.stats[doc] || 0;
                                                return (
                                                    <TableCell key={m} className="text-center">
                                                        <span className={`px-2 py-1 rounded ${stat > 0 ? "bg-white/5" : "text-muted-foreground opacity-30"}`}>
                                                            {stat}
                                                        </span>
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className="text-right font-mono font-bold text-green-400">{total}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
