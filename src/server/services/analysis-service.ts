import { probeMedia } from "@/server/media/ffmpeg";
import { buildCandidateMoments, detectSpeechRegions } from "@/server/pipeline/analyze";
import { isClipSelectionConfigured, selectViralMoments } from "@/server/pipeline/select-clips";
import { isTranscriptionConfigured, transcribeUpload } from "@/server/pipeline/transcribe";
import {
  clipRepository,
  notificationRepository,
  projectRepository,
  uploadRepository,
} from "@/server/repositories/media-repository";
import { storage } from "@/server/storage/local-storage";
import type { AspectRatio } from "@/types/media";
import type { Project, VideoUpload } from "@/types/media";

/**
 * Turns a stored upload into a project full of clips.
 *
 * Two paths, same output shape:
 *   • Keys present → Whisper transcript + Claude viral-moment selection.
 *   • No keys      → ffmpeg speech-region analysis (see `pipeline/analyze`).
 *
 * The heavy work runs in the background so the HTTP request that triggered it
 * returns immediately; the project's `status` (`analyzing` → `ready`/`failed`)
 * is the source of truth the UI polls.
 */

const DEFAULT_ASPECT: AspectRatio = "9:16";

function titleFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return base.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 80) || "Untitled project";
}

function maxMomentsFor(duration: number): number {
  return Math.min(12, Math.max(3, Math.floor(duration / 90)));
}

export const analysisService = {
  /**
   * Creates the project row immediately (status `analyzing`) and kicks off the
   * pipeline in the background. Returns the project so the caller can respond
   * right away.
   */
  async startAnalysisForUpload(upload: VideoUpload): Promise<Project> {
    const project = await projectRepository.create({
      ownerId: upload.ownerId,
      uploadId: upload.id,
      title: titleFromFileName(upload.fileName),
      status: "analyzing",
      clipCount: 0,
      duration: upload.duration,
      language: "English",
    });

    // Fire-and-forget: the pipeline updates the project status when it finishes.
    void this.runPipeline(project, upload).catch(async (error) => {
      console.error(`[analysis] pipeline failed for ${project.id}`, error);
      await projectRepository.update(project.id, { status: "failed" }).catch(() => {});
      await notificationRepository
        .create({
          ownerId: upload.ownerId,
          title: "Analysis failed",
          body: `We couldn't finish analysing “${project.title}”. Try re-uploading the video.`,
          kind: "analysis",
        })
        .catch(() => {});
    });

    return project;
  },

  /** The pipeline itself. Safe to await directly in tests. */
  async runPipeline(project: Project, upload: VideoUpload): Promise<void> {
    const storageKey = await uploadRepository.getStorageKey(upload.id);
    if (!storageKey) {
      await projectRepository.update(project.id, { status: "failed" });
      return;
    }

    const info = await probeMedia(storage.absolutePath(storageKey));
    const duration = info.duration || upload.duration;
    const maxMoments = maxMomentsFor(duration);

    const useAi = isTranscriptionConfigured() && isClipSelectionConfigured();
    const speakerCount = info.hasAudio ? 1 : 0;

    let aiClips = 0;
    if (useAi) {
      const { text, segments } = await transcribeUpload(storageKey);
      await projectRepository.setTranscript(project.id, text);

      const moments = await selectViralMoments(segments, duration, maxMoments);
      for (const moment of moments) {
        await clipRepository.create({
          projectId: project.id,
          title: moment.title,
          startAt: moment.startAt,
          duration: moment.duration,
          score: moment.score,
          aspectRatio: DEFAULT_ASPECT,
          hasCaptions: true,
          speakerCount,
          reason: moment.reason,
        });
        aiClips += 1;
      }
    }

    // Fall back to audio-based analysis when there's no AI, or when the model
    // returned nothing usable — so a project always ends up with clips.
    if (aiClips === 0) {
      const regions = await detectSpeechRegions(storage.absolutePath(storageKey), duration);
      const moments = buildCandidateMoments(regions, duration, maxMoments);
      for (const [index, moment] of moments.entries()) {
        await clipRepository.create({
          projectId: project.id,
          title: `Highlight ${index + 1}`,
          startAt: moment.startAt,
          duration: moment.duration,
          score: moment.score,
          aspectRatio: DEFAULT_ASPECT,
          hasCaptions: false,
          speakerCount,
        });
      }
    }

    const clipsCreated = (await clipRepository.listByProject(project.id)).length;
    await projectRepository.update(project.id, {
      status: "ready",
      clipCount: clipsCreated,
      duration,
    });

    await notificationRepository.create({
      ownerId: project.ownerId,
      title: `${clipsCreated} clip${clipsCreated === 1 ? "" : "s"} ready`,
      body: `“${project.title}” finished analysis with ${clipsCreated} clip${clipsCreated === 1 ? "" : "s"}.`,
      kind: "analysis",
    });
  },
};
