# Technical Context: Stack and Dependencies

This document details the technical stack, libraries, and architecture of the Scheduled Content Flow application.

## Core Frontend Technologies

-   **Framework**: React v18, built and served using Vite.
-   **Language**: TypeScript.
-   **UI Components**: A combination of **shadcn/ui** and **Radix UI** primitives provides the core component library. This is supplemented by `lucide-react` for icons.
-   **Styling**: Tailwind CSS is used for styling, with `tailwind-merge` and `tailwindcss-animate` for utility class management.
-   **Routing**: `react-router-dom` handles all client-side routing.
-   **Forms**: `react-hook-form` is used for form state management, with `zod` for schema definition and validation.

## State Management

-   **Server State**: `@tanstack/react-query` is used to manage server state. It handles fetching, caching, and synchronization of data from the Supabase backend and other external APIs.
-   **UI State**: Local component state (`useState`, `useReducer`) and context (`useContext`) are used for managing UI-specific state.

## Backend Services (Supabase)

The project uses Supabase as its primary Backend-as-a-Service (BaaS).

-   **Authentication**: Supabase Auth handles user sign-up, login, and session management. The session is persisted to `localStorage`.
-   **Database**: A PostgreSQL database stores all application data (users, channels, content, etc.).
-   **Storage**: Supabase Storage is used for file storage (e.g., user-uploaded assets).
-   **Serverless Functions**: A suite of TypeScript-based serverless functions run on Supabase Edge Functions. These act as a Backend-for-Frontend (BFF), orchestrating complex workflows and communicating with other services.

## Key Integrations

-   **`ffmpeg-service` API**: This is a critical external microservice. The `create-video-short` Supabase function communicates with this service's `/create-video` endpoint to perform the final video rendering. The frontend client does **not** call this service directly.
-   **Payment Provider**: A payment provider (likely Stripe) is integrated via the `create-checkout` Supabase function to handle monetization.
