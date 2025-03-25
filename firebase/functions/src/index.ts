import { processVideoQueue } from "./video/videoProcessing";
import { syncNewUserToFirestore } from "./auth/userSync";
import { processVoiceQueue } from "./video/steps/voiceProcessing";
import { processImageQueue } from "./video/steps/imageProcessing";
import { processVideoRender } from "./video/videoRenderProcessing";
import { processStoryRequest } from "./story/storyRequestProcessing";
import { processStoryIdea } from "./story/storyIdeaProcessing";
import { syncVideoStatus } from "./video/syncVideoStatus";
import { processYoutubeUploadQueue } from "./video/uploadToYoutubeProcessing";

exports.videoQueue = processVideoQueue;
exports.voiceQueue = processVoiceQueue;
exports.imageQueue = processImageQueue;
exports.youtubeUploadQueue = processYoutubeUploadQueue;
exports.storyRequestProcessing = processStoryRequest;
exports.storyIdeaProcessing = processStoryIdea;
exports.videoRenderProcessing = processVideoRender;
exports.syncVideoStatus = syncVideoStatus;
exports.syncNewUserToFirestore = syncNewUserToFirestore;
