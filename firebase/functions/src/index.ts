import { processVideoQueue } from "./video/videoProcessing";
import { syncNewUserToFirestore } from "./auth/userSync";
import { processVoiceQueue } from "./video/steps/voiceProcessing";
import { processImageQueue } from "./video/steps/imageProcessing";
import { processVideoStory } from "./story/storyProcessing";
import { processVideoRender } from "./video/videoRenderProcessing";

exports.videoQueue = processVideoQueue;
exports.voiceQueue = processVoiceQueue;
exports.imageQueue = processImageQueue;
exports.storyProcessing = processVideoStory;
exports.videoRenderProcessing = processVideoRender;
exports.syncNewUserToFirestore = syncNewUserToFirestore;
