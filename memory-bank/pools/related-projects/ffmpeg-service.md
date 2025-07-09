# Related Project: `ffmpeg-service`

## Role

The `ffmpeg-service` is the dedicated backend microservice that powers all video creation and processing features within the `scheduled-content-flow-98` application.

## Interaction

This front-end application acts as a client to the `ffmpeg-service` API. When a user wants to create a video, this application gathers all the necessary information (image URLs, audio data, resolution, etc.) and sends a `POST` request to the `/create-video` endpoint of the `ffmpeg-service`.

## Importance of Context

To understand the full end-to-end workflow of video creation, it is essential to have context from both this project and the `ffmpeg-service`. When working on a feature that involves video processing, the memory bank of the `ffmpeg-service` should be consulted to understand the API's capabilities, limitations, and expected data formats.

The `ffmpeg-service` repository is located at `../ffmpeg-service-1`.
