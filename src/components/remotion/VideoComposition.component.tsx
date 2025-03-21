"use client";

import React, { useEffect } from "react";
import { AbsoluteFill, Audio, useVideoConfig, prefetch } from "remotion";
import {
  type Caption,
  createTikTokStyleCaptions,
  type TikTokPage,
} from "@remotion/captions";
import type { Scene, SceneWithTiming, VideoStyling } from "@/app/types";
import { SceneComposition } from "@/components/remotion/SceneComposition.component";
import SubtitlePage from "@/components/remotion/SubtitlePage.component";
import { PremountedSequence } from "@/components/remotion/PremountedSequence.component";
import { resolveRedirect } from "@remotion/preload";
import { TextDesign } from "@/components/remotion/TextDesign.component";

interface MyTikTokPage extends TikTokPage {
  endMs: number;
}

const COMBINE_TOKENS_MS = 500;

interface Props {
  scenes?: { [sceneIndex: number]: Scene };
  styling?: VideoStyling;
  textPosition?: string;
  showTitle?: boolean;
  title?: string;
}

export const VideoComposition: React.FC<Props> = ({
  scenes = {},
  styling,
  textPosition = "top",
  showTitle = true,
  title,
}) => {
  const { fps } = useVideoConfig();

  const alignmentClass =
    textPosition === "top"
      ? "items-start"
      : textPosition === "center"
        ? "items-center"
        : textPosition === "bottom"
          ? "items-end"
          : "items-start";

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
        ({ scene, startFrame, durationInFrames, pages }, sceneIndex) => {
          if (!scene.voiceUrl || !scene.imageUrl) {
            console.error(`Missing assets for scene ${sceneIndex}:`, {
              voiceUrl: scene.voiceUrl,
              imageUrl: scene.imageUrl,
            });
            return null;
          }
          return (
            <PremountedSequence
              key={sceneIndex}
              from={startFrame}
              durationInFrames={durationInFrames}
              premountFor={100}
            >
              <SceneComposition scene={scene} index={sceneIndex} />
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

                if (sceneIndex === 0 && showTitle && pageIndex === 0 && title) {
                  const titlePage: TikTokPage = {
                    startMs: 0,
                    tokens: [{ text: title, fromMs: 0, toMs: 1 }],
                    text: title,
                  };
                  return (
                    <>
                      <PremountedSequence
                        key={`${pageIndex}-title`}
                        from={0}
                        durationInFrames={1}
                        premountFor={30}
                      >
                        <AbsoluteFill
                          className={`flex ${alignmentClass} justify-center`}
                        >
                          <TextDesign
                            enterProgress={1}
                            page={titlePage}
                            textVariant={styling?.font}
                            variant={styling?.variant}
                          />
                        </AbsoluteFill>
                      </PremountedSequence>
                      <PremountedSequence
                        key={`${pageIndex}-subtitle`}
                        from={pageStartFrame + 1}
                        durationInFrames={pageDuration - 1}
                        premountFor={30}
                      >
                        <SubtitlePage
                          page={page}
                          styling={styling}
                          textPosition={textPosition}
                        />
                      </PremountedSequence>
                    </>
                  );
                }

                return (
                  <PremountedSequence
                    key={pageIndex}
                    from={pageStartFrame}
                    durationInFrames={pageDuration}
                    premountFor={30}
                  >
                    <SubtitlePage
                      page={page}
                      styling={styling}
                      textPosition={textPosition}
                    />
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
