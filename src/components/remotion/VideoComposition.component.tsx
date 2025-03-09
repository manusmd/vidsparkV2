"use client";

import React from "react";
import { AbsoluteFill, Audio, Sequence, useVideoConfig } from "remotion";
import {
  createTikTokStyleCaptions,
  type Caption,
  type TikTokPage,
} from "@remotion/captions";
import type { Scene, SceneWithTiming } from "@/app/types";
import { SceneComposition } from "@/components/remotion/SceneComposition.component";
import SubtitlePage from "@/components/remotion/SubtitlePage.component";

// Extend TikTokPage to include endMs.
interface MyTikTokPage extends TikTokPage {
  endMs: number;
}

interface Props {
  scenes: { [sceneIndex: number]: Scene };
  style?: string;
}

// How many milliseconds to group tokens
const COMBINE_TOKENS_MS = 500;

export const VideoComposition: React.FC<Props> = ({ scenes }) => {
  const { fps } = useVideoConfig();

  let currentFrame = 0;

  // Iterate over scenes using Object.entries since scenes is an object.
  const scenesWithTiming: Exclude<SceneWithTiming, null>[] = Object.entries(
    scenes,
  )
    .map(([sceneIndexStr, scene]): SceneWithTiming | null => {
      const sceneIndex = Number(sceneIndexStr);
      if (
        !scene.voiceUrl ||
        !scene.captionsWords ||
        scene.captionsWords.length === 0
      ) {
        console.error(`Missing voice URL or captions for scene ${sceneIndex}`);
        return null;
      }

      // Convert captionsWords to TikTok caption format.
      const tikTokCaptions: Caption[] = scene.captionsWords.map((caption) => ({
        text: caption.text + " ",
        startMs: caption.start * 1000,
        endMs: caption.end * 1000,
        timestampMs: (caption.start + (caption.end - caption.start) / 2) * 1000,
        confidence: null,
      }));

      // Create caption pages.
      const { pages } = createTikTokStyleCaptions({
        captions: tikTokCaptions,
        combineTokensWithinMilliseconds: COMBINE_TOKENS_MS,
      });

      const startFrame = currentFrame;
      // Use the endMs of the last caption to determine audio duration (no padding).
      const audioDuration =
        tikTokCaptions[tikTokCaptions.length - 1].endMs / 1000;
      const durationInFrames = Math.ceil(audioDuration * fps);
      currentFrame += durationInFrames;

      return {
        scene,
        startFrame,
        durationInFrames,
        pages,
      };
    })
    .filter((item): item is Exclude<SceneWithTiming, null> => item !== null);

  return (
    <AbsoluteFill>
      {scenesWithTiming.map(
        ({ scene, startFrame, durationInFrames, pages }, index) => {
          if (!scene.voiceUrl || !scene.imageUrl) {
            console.error(`Missing assets for scene ${index}:`, {
              voiceUrl: scene.voiceUrl,
              imageUrl: scene.imageUrl,
            });
            return null;
          }
          return (
            <Sequence
              key={index}
              from={startFrame}
              durationInFrames={durationInFrames}
            >
              <SceneComposition
                scene={scene}
                index={index}
                isTitle={index === 0}
              />
              <Audio src={scene.voiceUrl} volume={1} />
              {pages?.map((page: TikTokPage, pageIndex: number) => {
                // Cast page to MyTikTokPage so we can access endMs.
                const currentPage = page as MyTikTokPage;
                const nextPage = pages[pageIndex + 1] as
                  | MyTikTokPage
                  | undefined;
                const pageStartFrame = Math.floor((page.startMs / 1000) * fps);
                // Use nextPage.startMs if exists, else currentPage.endMs.
                const pageEndFrame = Math.floor(
                  ((nextPage ? nextPage.startMs : currentPage.endMs) / 1000) *
                    fps,
                );
                const pageDuration = pageEndFrame - pageStartFrame;
                if (pageDuration <= 0) return null;
                return (
                  <Sequence
                    key={pageIndex}
                    from={pageStartFrame}
                    durationInFrames={pageDuration}
                  >
                    <SubtitlePage page={page} />
                  </Sequence>
                );
              })}
            </Sequence>
          );
        },
      )}
    </AbsoluteFill>
  );
};
