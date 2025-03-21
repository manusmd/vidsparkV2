export function prepareScenes(generatedScenes: any[]): {
  scenes: { [index: number]: any };
  sceneStatus: { [index: number]: any };
  imageStatus: { [index: number]: any };
  voiceStatus: { [index: number]: any };
} {
  const scenes: { [index: number]: any } = {};
  const sceneStatus: { [index: number]: any } = {};
  const imageStatus: { [index: number]: any } = {};
  const voiceStatus: { [index: number]: any } = {};

  generatedScenes.forEach((scene: any, index: number) => {
    scenes[index] = {
      narration: scene.narration,
      imagePrompt: scene.imagePrompt,
      imageUrl: "",
      voiceUrl: "",
      captions: "",
      captionsWords: [],
    };
    sceneStatus[index] = { statusMessage: "pending", progress: 0 };
    imageStatus[index] = { statusMessage: "pending", progress: 0 };
    voiceStatus[index] = { statusMessage: "pending", progress: 0 };
  });

  return { scenes, sceneStatus, imageStatus, voiceStatus };
}
