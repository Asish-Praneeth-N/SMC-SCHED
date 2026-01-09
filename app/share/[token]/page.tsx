import { getPublicScheduleByToken } from "@/app/dashboard/actions";
import { PublicScheduleView } from "@/components/public-schedule-view";
import { notFound } from "next/navigation";

interface SharePageProps {
    params: Promise<{
        token: string;
    }>;
}

export default async function SharePage({ params }: SharePageProps) {
    const { token } = await params;
    const schedule = await getPublicScheduleByToken(token);

    if (!schedule) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-black text-foreground p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-2 text-white">SMC Schedule Viewer</h2>
                    <p className="text-muted-foreground text-sm">You are viewing a shared schedule.</p>
                </div>
                <PublicScheduleView schedule={schedule.data} month={schedule.month} />
            </div>
        </div>
    );
}
