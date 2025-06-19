
import { DatabaseOperations } from './database-operations.ts';

export class ContentStatusManager {
  private dbOps: DatabaseOperations;

  constructor(dbOps: DatabaseOperations) {
    this.dbOps = dbOps;
  }

  async updateFinalStatus(contentItemId: string, sceneIds: string[]) {
    const sceneVideos = await this.dbOps.getSceneVideosStatus(sceneIds);

    const allCompleted = sceneVideos?.every(sv => sv.video_status === 'completed') || false;
    const anyFailed = sceneVideos?.some(sv => sv.video_status === 'failed') || false;

    const finalVideoStatus = allCompleted ? 'completed' : anyFailed ? 'failed' : 'in_progress';
    const nextStage = allCompleted ? 'music_creation' : 'image_creation';

    await this.dbOps.updateContentItemStatus(contentItemId, {
      video_status: finalVideoStatus,
      generation_stage: nextStage
    });

    return { allCompleted, anyFailed, finalVideoStatus };
  }
}
