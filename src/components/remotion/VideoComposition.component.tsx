"use client";

import React, { Fragment, useEffect } from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  prefetch,
  useVideoConfig,
} from "remotion";
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

const COMBINE_TOKENS_MS = 800;

interface Props {
  scenes?: { [sceneIndex: string]: Scene };
  styling?: VideoStyling;
  textPosition?: string;
  showTitle?: boolean;
  title?: string;
  musicVolume?: number;
  musicUrl?: string | null;
}

export const VideoComposition: React.FC<Props> = ({
  scenes = {},
  styling,
  textPosition = "top",
  showTitle = true,
  title,
  musicVolume = 0.5,
  musicUrl,
}) => {
  const { fps } = useVideoConfig();
  const currentFrameRef = { current: 0 };

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

      const startFrame = currentFrameRef.current;
      const audioDuration =
        tikTokCaptions[tikTokCaptions.length - 1].endMs / 1000;
      const durationInFrames = Math.ceil(audioDuration * fps);
      currentFrameRef.current += durationInFrames;

      return {
        scene,
        startFrame,
        durationInFrames,
        pages,
      };
    })
    .filter((item): item is Exclude<SceneWithTiming, null> => item !== null);

  const totalFrames = currentFrameRef.current;

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
                  // Split the title into words to create multiple tokens
                  const words = title.split(" ");
                  const titleTokens = words.map((word, i) => ({
                    text: word + (i < words.length - 1 ? " " : ""),
                    fromMs: 0,
                    toMs: 1,
                  }));

                  const titlePage: TikTokPage = {
                    startMs: 0,
                    durationMs: 1,
                    tokens: titleTokens,
                    text: title,
                  };
                  return (
                    <Fragment key={`${scene.voiceUrl}-${pageIndex}`}>
                      <PremountedSequence
                        from={0}
                        durationInFrames={1} // Changed from 30 to 1 frame as per requirement
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
                            isTitle={true}
                          />
                        </AbsoluteFill>
                      </PremountedSequence>
                      <PremountedSequence
                        from={1} // Start after the title page ends (which is 1 frame)
                        durationInFrames={Math.max(1, pageDuration - 1)} // Ensure duration is at least 1 frame
                        premountFor={30}
                      >
                        <SubtitlePage
                          page={page}
                          styling={styling}
                          textPosition={textPosition}
                        />
                      </PremountedSequence>
                    </Fragment>
                  );
                }

                return (
                  <PremountedSequence
                    key={pageIndex}
                    from={pageStartFrame}
                    durationInFrames={Math.max(1, pageDuration)} // Ensure duration is at least 1 frame
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
      {/* Background Music with Fade Out over the last 30 frames */}
      {musicUrl && (
        <Audio
          src={musicUrl}
          volume={(frame) => {
            if (frame < totalFrames - 30) {
              return musicVolume;
            }
            return interpolate(
              frame,
              [totalFrames - 30, totalFrames],
              [musicVolume, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
          }}
        />
      )}
    </AbsoluteFill>
  );
};
