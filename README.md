# SMC SCHED - Medical Scheduling System

SMC SCHED is a robust medical scheduling application designed to streamline hospital shift planning and management. It provides a secure, role-based environment for administrators to generate and publish schedules, and for staff to view their shifts securely.

## Features

-   **Role-Based Access Control (RBAC)**: Distinct access levels for Superadmins, Admins, and standard Users to ensure data security and operational hierarchy.
-   **Automated Scheduling**: Tools to assist in managing and visualizing monthly staff rosters.
-   **Interactive Dashboard**: A user-friendly, responsive dashboard for viewing personal shifts and hospital-wide schedules.
-   **Secure Authentication**: Integrated with [Clerk](https://clerk.com/) for seamless and secure sign-up and sign-in processes.
-   **Modern UI**: Built with a clean, clinical aesthetic using [Tailwind CSS](https://tailwindcss.com/) and [Shadcn/UI](https://ui.shadcn.com/) components.
-   **Database Integration**: persistent data storage using [Neon](https://neon.tech/) (Serverless Postgres) and [Drizzle ORM](https://orm.drizzle.team/).

## Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS v4, Shadcn/UI
-   **Database**: Neon (PostgreSQL)
-   **ORM**: Drizzle ORM
-   **Authentication**: Clerk
-   **Icons**: Lucide React

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm, yarn, pnpm, or bun

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd smcsched
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Variables:**

    Create a `.env` file in the root directory. You will need keys for Clerk and your Database URL.

    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...
    DATABASE_URL=postgresql://...
    ```

4.  **Database Setup:**

    Push the schema to your Neon database using Drizzle Kit:

    ```bash
    npx drizzle-kit push
    ```

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts the production server.
-   `npm run lint`: Runs ESLint to identify code issues.

## Project Structure

-   `/app`: Contains the Next.js App Router pages, API routes, and layouts.
-   `/components`: Reusable UI components, including Shadcn/UI primitives and custom feature components.
-   `/lib`: Utility functions, database configuration (`db`), and schema definitions.
-   `/public`: Static assets like images and fonts.

## License

This project is proprietary and intended for internal use.
