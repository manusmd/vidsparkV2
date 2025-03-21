import { processVideoQueue } from "./video/videoProcessing";
import { syncNewUserToFirestore } from "./auth/userSync";
import { processVoiceQueue } from "./video/steps/voiceProcessing";
import { processImageQueue } from "./video/steps/imageProcessing";
import { processVideoRender } from "./video/videoRenderProcessing";
import { processStoryRequest } from "./story/storyRequestProcessing";
import { processStoryIdea } from "./story/storyIdeaProcessing";

exports.videoQueue = processVideoQueue;
exports.voiceQueue = processVoiceQueue;
exports.imageQueue = processImageQueue;
exports.storyRequestProcessing = processStoryRequest;
exports.storyIdeaProcessing = processStoryIdea;
exports.videoRenderProcessing = processVideoRender;
exports.syncNewUserToFirestore = syncNewUserToFirestore;
