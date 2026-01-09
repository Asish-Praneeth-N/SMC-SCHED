import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    clerkId: text("clerk_id").unique().notNull(),
    email: text("email").notNull(),
    name: text("name"),
    role: text("role").default("user").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schedules = pgTable("schedules", {
    id: serial("id").primaryKey(),
    month: text("month").notNull(),
    data: text("data").notNull(), // Storing JSON as text initially for simplicity/compatibility or use jsonb if preferred
    config: text("config").notNull(),
    isPublished: text("is_published").default("false").notNull(), // boolean stored as string or use boolean type
    shareToken: text("share_token").unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
