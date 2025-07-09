# Context Pool: Video Generation Deep Dive

This document provides a detailed, end-to-end analysis of the video generation logic, from the initial client request to the final API call to the `ffmpeg-service`.

## High-Level Process Flow

The video generation is a two-phase process orchestrated by Supabase Functions:

1.  **Phase 1: Scene Generation (`generate-scene-videos` function)**: For each scene in a script, this function generates a corresponding visual (e.g., a short video clip or a static image). This must be completed before the final video can be assembled.
2.  **Phase 2: Video Assembly (`create-video-short` function)**: This function takes the generated scenes, combines them with a full-script audio narration, and calls the `ffmpeg-service` to render the final video.

## Detailed `create-video-short` Function Logic

This function acts as the primary orchestrator for the final video assembly.

**File Structure:**
- `index.ts`: Main entry point and orchestrator.
- `video-processor.ts`: Handles the main processing steps.
- `audio-generator.ts`: Generates the voice narration.
- `video-creator.ts`: Assembles and sends the request to the `ffmpeg-service`.
- `storage-uploader.ts`: Uploads the final video to Supabase Storage.

### Step-by-Step Breakdown:

1.  **Initiation (`index.ts`)**:
    -   The function is triggered by a client request containing a `contentItemId`.
    -   It fetches the `content_item` and all its related `content_scenes` and `content_scene_videos` from the database. This single data structure contains all the necessary information.
    -   It passes this data to the `processVideoCreation` module.

2.  **Processing (`video-processor.ts`)**:
    -   It validates that the scenes have pre-generated videos from Phase 1.
    -   It calls `generateVoiceNarration` from `audio-generator.ts`, which takes the full text script (`contentItem.script`) and a voice ID to generate a single audio file for the entire video.
    -   It then calls `createVideoWithExternalFFmpeg` from `video-creator.ts`, passing the scenes, the generated audio data, and the video title.

3.  **API Payload Assembly (`video-creator.ts`)**:
    -   This is the final step before the external API call. This module transforms the application's data structure into the specific JSON payload expected by the `ffmpeg-service`.
    -   It iterates through the `scenes` array and extracts two key pieces of information for each scene:
        1.  `imageUrl`: The URL of the pre-generated visual (`scene.content_scene_videos[0].video_url`).
        2.  `duration`: The calculated duration of the scene (`scene.end_time_seconds - scene.start_time_seconds`).
    -   It encodes the full audio narration data into a `base64` string.
    -   It constructs the final JSON payload.

### `ffmpeg-service` API Request Payload

The `POST` request sent to the `/create-video` endpoint of the `ffmpeg-service` has the following structure:

```json
{
  "imageUrls": [
    "https://url.to/scene1/video.mp4",
    "https://url.to/scene2/video.mp4",
    "https://url.to/scene3/video.mp4"
  ],
  "durations": [
    5.2,
    4.8,
    6.1
  ],
  "audioBase64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhIAAAAA...",
  "transition": "fade",
  "fps": "30",
  "resolution": "1080x1920",
  "title": "My Awesome Video Title"
}
```

-   `imageUrls`: An array of strings containing the public URLs to the visual for each scene, in order.
-   `durations`: An array of numbers representing the duration (in seconds) for each corresponding image/video in the `imageUrls` array.
-   `audioBase64`: A base64-encoded string of the complete audio narration for the entire video.
-   `transition`, `fps`, `resolution`: Hardcoded parameters that define the video's technical specifications.
-   `title`: The title of the video.

This detailed understanding of the payload is crucial for debugging the video generation process and for any future work involving the `ffmpeg-service`.
