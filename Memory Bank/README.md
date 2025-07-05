
# Memory Bank - Video Short Creation System

## Overview
This system creates AI-generated video shorts by combining scene images, narration audio, and timing data using an external FFmpeg service.

## Key Components

### Edge Functions
- **create-video-short**: Main orchestrator for video creation
  - `index.ts`: Main entry point with request handling
  - `types.ts`: TypeScript interfaces and types
  - `voice-service.ts`: ElevenLabs TTS integration
  - `video-processor.ts`: FFmpeg service communication
  - `storage-service.ts`: Supabase storage operations
  - `database-service.ts`: Database queries for content items
  - `validation-service.ts`: Input validation and environment checks

### Frontend Components
- **ScriptPreview**: Main component for viewing and managing content scripts
- **useVideoGeneration**: Hook for generating scene videos/images
- **useVideoShortCreation**: Hook for creating final video shorts

### Database Tables
- `content_items`: Main content with scripts and metadata
- `content_scenes`: Individual scenes with timing and descriptions
- `content_scene_videos`: Generated images/videos for each scene

### External Services
- **ElevenLabs**: Text-to-speech for narration
- **FFmpeg Service**: Video composition and rendering
- **Supabase Storage**: File storage for generated videos

## Data Flow
1. User creates content item with script
2. AI generates scene breakdown with timing
3. Images/videos generated for each scene
4. User triggers video short creation
5. System generates narration audio
6. FFmpeg service combines images, audio, and timing
7. Final video stored in Supabase storage

## Key Issues Fixed
- Scene timing alignment with transitions
- Parallax effect speed control
- Audio synchronization
- Error handling and validation
