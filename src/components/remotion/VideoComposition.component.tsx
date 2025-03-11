import React, { useEffect } from "react";
import { AbsoluteFill, Audio, useVideoConfig, prefetch } from "remotion";
import {
  type Caption,
  createTikTokStyleCaptions,
  type TikTokPage,
} from "@remotion/captions";
import type { Scene, SceneWithTiming } from "@/app/types";
import { SceneComposition } from "@/components/remotion/SceneComposition.component";
import SubtitlePage from "@/components/remotion/SubtitlePage.component";
import { PremountedSequence } from "@/components/remotion/PremountedSequence.component";
import { resolveRedirect } from "@remotion/preload";

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

  useEffect(() => {
    Object.values(scenes).forEach((scene) => {
      if (scene.voiceUrl) {
        resolveRedirect(scene.voiceUrl)
          .then((resolvedUrl) => {
            prefetch(resolvedUrl, {
              method: "blob-url",
              contentType: "audio/mpeg",
            });
          })
          .catch((err) => {
            console.error(
              `Could not resolve redirect for audio ${scene.voiceUrl}`,
              err,
            );
          });
      }
    });
  }, [scenes]);

  let currentFrame = 0;

  // Calculate timing information for each scene.
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

      const tikTokCaptions: Caption[] = scene.captionsWords.map((caption) => ({
        text: caption.text + " ",
        startMs: caption.start * 1000,
        endMs: caption.end * 1000,
        timestampMs: (caption.start + (caption.end - caption.start) / 2) * 1000,
        confidence: null,
      }));

      const { pages } = createTikTokStyleCaptions({
        captions: tikTokCaptions,
        combineTokensWithinMilliseconds: COMBINE_TOKENS_MS,
      });

      const startFrame = currentFrame;
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
            <PremountedSequence
              key={index}
              from={startFrame}
              durationInFrames={durationInFrames}
              premountFor={100} // adjust the number of frames to premount as needed
            >
              <SceneComposition
                scene={scene}
                index={index}
                isTitle={index === 0}
              />
              <Audio src={scene.voiceUrl} volume={1} />
              {pages?.map((page: TikTokPage, pageIndex: number) => {
                const currentPage = page as MyTikTokPage;
                const nextPage = pages[pageIndex + 1] as
                  | MyTikTokPage
                  | undefined;
                const pageStartFrame = Math.floor((page.startMs / 1000) * fps);
                const pageEndFrame = Math.floor(
                  ((nextPage ? nextPage.startMs : currentPage.endMs) / 1000) *
                    fps,
                );
                const pageDuration = pageEndFrame - pageStartFrame;
                if (pageDuration <= 0) return null;
                return (
                  <PremountedSequence
                    key={pageIndex}
                    from={pageStartFrame}
                    durationInFrames={pageDuration}
                    premountFor={30} // adjust as needed for subtitles
                  >
                    <SubtitlePage page={page} />
                  </PremountedSequence>
                );
              })}
            </PremountedSequence>
          );
        },
      )}
    </AbsoluteFill>
  );
};
