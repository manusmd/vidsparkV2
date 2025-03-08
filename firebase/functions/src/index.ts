import { processVideoQueue } from "./video/videoProcessing";
import { syncNewUserToFirestore } from "./auth/userSync";
import { processVoiceQueue } from "./video/steps/voiceProcessing";
import { processImageQueue } from "./video/steps/imageProcessing";

exports.videoQueue = processVideoQueue;
exports.voiceQueue = processVoiceQueue;
exports.imageQueue = processImageQueue;
exports.syncNewUserToFirestore = syncNewUserToFirestore;
