# System Design Patterns

This document describes the key architectural and design patterns used in the Scheduled Content Flow application.

## High-Level Architecture: Client -> BFF -> Services

The application follows a modern web architecture that separates the frontend client from backend services.

-   **Client**: The React (Vite) single-page application (SPA) that runs in the user's browser. It is responsible for the UI and user interaction.
-   **Backend-for-Frontend (BFF)**: The Supabase Functions act as a BFF layer. The client communicates with these functions rather than directly with all underlying services. This pattern provides several advantages:
    -   **Abstraction**: The frontend doesn't need to know the details of the various microservices.
    -   **Security**: API keys and sensitive logic are kept on the backend, not exposed in the client.
    -   **Orchestration**: A single call from the client (e.g., "create video") can trigger a complex workflow of multiple service calls on the backend.
-   **Services**: These are the underlying services that the BFF communicates with.
    -   **Supabase**: Provides core BaaS features (Auth, DB, Storage).
    -   **`ffmpeg-service`**: An external microservice dedicated to video processing.
    -   **Payment Gateway**: A service like Stripe for handling payments.
    -   **LLM/AI Services**: The `content-generator` function likely calls external AI services for text and idea generation.

## Frontend Architecture

-   **Component-Based UI**: The UI is built using a hierarchy of reusable React components, leveraging `shadcn/ui` and Radix UI. Components are organized by feature in the `src/components` directory.
-   **Page-Based Routing**: The application is divided into "pages" (e.g., `Landing`, `Auth`, `Index`), with `react-router-dom` managing which page is displayed based on the URL.
-   **Protected Routes**: The application uses a `ProtectedRoute` component to wrap routes that require authentication, ensuring that only logged-in users can access the core application features.

## State Management Strategy

-   **Server State (TanStack Query)**: All data fetched from the backend is managed by TanStack Query. This handles caching, background refetching, and optimistic updates, providing a responsive user experience.
-   **Form State (React Hook Form)**: Forms are controlled components managed by `react-hook-form`, which handles validation (with Zod), submission, and error states efficiently.
-   **Global UI State (Context API)**: React's Context API is used for sharing global UI state that doesn't need to be persisted on the server, such as the current theme or tooltip visibility.

## Data Flow for Video Creation

1.  **User Interaction**: The user interacts with various UI components in the React app to define the video (selects topics, style, voice, etc.).
2.  **Client to BFF**: The client gathers this information and makes a single API call to the `create-video-short` Supabase Function.
3.  **BFF Orchestration**: The `create-video-short` function receives the request and orchestrates the creation process. This may involve:
    -   Calling the `text-to-speech` function to generate audio.
    -   Calling the `generate-scene-videos` function.
    -   Saving intermediate data to the Supabase database.
4.  **BFF to `ffmpeg-service`**: Once all parameters are ready, the BFF sends the final, formatted request to the `/create-video` endpoint of the `ffmpeg-service`.
5.  **Response to Client**: The BFF function responds to the client, likely with an initial status (e.g., "generation started") and an ID to track progress. The client then uses TanStack Query to poll for status updates.
