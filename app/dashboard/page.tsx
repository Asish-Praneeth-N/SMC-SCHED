import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Sync user to database
    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) {
        await db.insert(users).values({
            clerkId: user.id,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName} ${user.lastName}`.trim(),
            role: "user",
        });
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            <p className="mb-8 text-muted-foreground">Welcome to your dashboard, {user.firstName}.</p>
            <div className="p-4 border border-white/10 rounded-lg bg-black/20">
                <UserButton afterSignOutUrl="/" />
            </div>
        </div>
    )
}
