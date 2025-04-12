"use client";

import React, { Fragment, useEffect } from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  prefetch,
  useVideoConfig,
  Sequence,
  Img,
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
  const scenePadding = Math.ceil(0.5 * fps); // 0.5 seconds padding before and after
  const thumbnailDuration = 1; // Just 1 frame for thumbnail

  // Preload all media assets
  useEffect(() => {
    // Preload all scene images
    Object.values(scenes).forEach((scene) => {
      if (scene.imageUrl) {
        prefetch(scene.imageUrl, {
          method: "blob-url",
          contentType: "image/*",
        });
      }
    });

    // Preload all audio files
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

    // Preload background music if exists
    if (musicUrl) {
      resolveRedirect(musicUrl)
        .then((resolvedUrl) => {
          prefetch(resolvedUrl, {
            method: "blob-url",
            contentType: "audio/mpeg",
          });
        })
        .catch((err) => {
          console.error(`Could not resolve redirect for music ${musicUrl}`, err);
        });
    }
  }, [scenes, musicUrl]);

  // Add thumbnail duration to the starting frame of all scenes
  currentFrameRef.current = thumbnailDuration;

  const alignmentClass =
    textPosition === "top"
      ? "items-start"
      : textPosition === "center"
        ? "items-center"
        : textPosition === "bottom"
          ? "items-end"
          : "items-start";

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
      const contentDuration = Math.ceil(audioDuration * fps);
      const durationInFrames = contentDuration + (scenePadding * 2); // Add padding to both start and end
      currentFrameRef.current += durationInFrames;

      return {
        scene,
        startFrame,
        durationInFrames,
        contentDuration,
        pages,
      };
    })
    .filter((item): item is Exclude<SceneWithTiming, null> => item !== null);

  const totalFrames = currentFrameRef.current;

  return (
    <AbsoluteFill>
      {/* Thumbnail sequence - just 1 frame */}
      {showTitle && title && scenesWithTiming.length > 0 && (
        <Sequence from={0} durationInFrames={thumbnailDuration}>
          <AbsoluteFill>
            <Img
              src={scenesWithTiming[0].scene.imageUrl ?? ""}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <AbsoluteFill
              style={{
                background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
              }}
            />
            <AbsoluteFill className="flex items-center justify-center">
              <TextDesign
                enterProgress={1}
                page={{
                  startMs: 0,
                  durationMs: 1,
                  text: title,
                  tokens: [{
                    text: title,
                    fromMs: 0,
                    toMs: 1
                  }]
                }}
                textVariant={styling?.font}
                variant={styling?.variant}
                isTitle={true}
              />
            </AbsoluteFill>
          </AbsoluteFill>
        </Sequence>
      )}

      {/* Regular scenes */}
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
              <SceneComposition 
                scene={scene} 
                index={sceneIndex} 
                durationInFrames={durationInFrames}
              />
              <Sequence from={scenePadding}>
                <Audio src={scene.voiceUrl} volume={1} />
              </Sequence>
              {pages?.map((page: TikTokPage, pageIndex: number) => {
                const currentPage = page as MyTikTokPage;
                const nextPage = pages[pageIndex + 1] as MyTikTokPage | undefined;
                const pageStartFrame = Math.floor((page.startMs / 1000) * fps) + scenePadding;
                const pageEndFrame = Math.floor(
                  ((nextPage ? nextPage.startMs : currentPage.endMs) / 1000) * fps
                ) + scenePadding;
                const pageDuration = pageEndFrame - pageStartFrame;
                if (pageDuration <= 0) return null;

                return (
                  <PremountedSequence
                    key={pageIndex}
                    from={pageStartFrame}
                    durationInFrames={Math.max(1, pageDuration)}
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
