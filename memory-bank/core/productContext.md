# Product Context: Features and Workflows

This document outlines the core user-facing features and workflows of the Scheduled Content Flow application, as inferred from the codebase structure.

## Core Concepts

-   **Channels**: A "Channel" appears to be a central concept. It likely represents a user's workspace or a specific social media destination (e.g., a YouTube channel). Users can create, configure, and manage these channels. Key settings seem to include basic info, platform selection, and potentially branding (like color customization).

-   **Content Items**: These are the individual pieces of media, primarily videos, that users create. The creation process involves several steps.

## Key User Workflows

1.  **Authentication and Account Management**:
    -   Users can sign up and log in via the `/auth` page.
    -   Authenticated sessions are managed via Supabase Auth.
    -   The main application at `/app` is protected and requires a valid session.
    -   Users can manage their account settings and billing information.

2.  **Channel Creation and Management**:
    -   Users can create new channels through a dialog (`ChannelCreationDialog.tsx`).
    -   The creation process involves setting basic information, selecting a platform, and possibly connecting social accounts.
    -   Existing channels are likely displayed in a grid or list for easy management.

3.  **Video Creation Workflow**:
    -   **Topic/Idea Generation**: Users can select topics (`TopicSelection.tsx`) which likely feed into a content generation service (`content-generator` function).
    -   **Scripting**: A script is generated and can be previewed (`ScriptPreview.tsx`).
    -   **Visuals & Style**: Users select a video style (`VideoStyleSelector.tsx`).
    -   **Audio**: Users can select a voice and preview it (`VoiceSelectorWithPreview.tsx`), which uses the `text-to-speech` backend function.
    -   **Generation**: The final video is assembled and generated via a multi-step backend process involving Supabase Functions (`generate-scene-videos`, `create-video-short`) which in turn call the `ffmpeg-service`.

4.  **Content Scheduling and Monitoring**:
    -   A `ContentCalendar.tsx` component indicates a calendar-based view for scheduling content.
    -   Users can select a schedule for their content to be published.
    -   The status of content in the generation queue can be monitored (`ContentQueueStatus.tsx`, `ContentStatusProgress.tsx`).

5.  **Monetization**:
    -   The application has a billing system (`BillingManagement.tsx`).
    -   A Supabase function `create-checkout` suggests integration with a payment provider like Stripe.
    -   The `verify-payment-and-create-channel` function links successful payments to feature unlocks (like channel creation).
