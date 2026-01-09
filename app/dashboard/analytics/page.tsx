import { getAnalyticsData } from "./actions";
import { AnalyticsView } from "@/components/analytics-view";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AnalyticsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const { data: analyticsData } = await getAnalyticsData();

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <header className="border-b border-white/10 p-6 flex justify-between items-center bg-black/40 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-muted-foreground hover:text-white transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                        <p className="text-muted-foreground text-sm">
                            Posting history and statistics
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                {analyticsData && analyticsData.length > 0 ? (
                    <AnalyticsView data={analyticsData} />
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        No schedule data available for analytics yet.
                    </div>
                )}
            </main>
        </div>
    );
}
