# Vidspark ✨

Vidspark is an innovative platform that automates the creation of engaging short-form videos using AI-generated story ideas, images, voiceovers, and music. Built with Next.js, Firebase, and Remotion (with AWS Lambda), Vidspark streamlines the creative process from content ideation to video rendering while offering a robust admin interface to manage content types and assets. 🎥🚀

## Features
- **AI-Driven Narration 🤖:**  
  Generate creative, engaging story narrations using OpenAI.
- **Dynamic Image Generation 🎨:**  
  Use Replicate to create high-quality, theme-based images with built‑in NSFW filtering and prompt adjustments.
- **Voice Synthesis & Captioning 🎙:**  
  Produce realistic voiceovers and automatic captions via ElevenLabs APIs.
- **Background Music Selection 🎵:**  
  Choose and update background music tracks with adjustable volume that is saved directly in the database.
- **Video Rendering Pipeline 🎞:**  
  Render videos with Remotion orchestrated on AWS Lambda. A polling mechanism tracks real‑time rendering progress.
- **Content Type Management 📝:**  
  Manage content types through an admin panel featuring drag‑and‑drop reordering (using dnd‑kit), inline editing with React Hook Form, and Zod validation.
- **Task Queues & Asset Syncing 🔄:**  
  Process image, voice, and asset synchronization tasks with Firebase Cloud Tasks to ensure every asset is ready before video rendering.

## Technology Stack
- **Frontend:** Next.js, React, Tailwind CSS, Framer Motion
- **Backend:** Firebase (Firestore, Cloud Functions, Cloud Tasks), Node.js
- **Video Rendering:** Remotion with AWS Lambda
- **AI Services:** OpenAI, Replicate, ElevenLabs
- **Drag-and-Drop:** dnd‑kit

## Architecture Overview

### 1. Content Creation Flow:
- Users select a content type and provide a story idea.
- AI services generate narration, images, voice, and background music.
- The admin interface allows managing and ordering content types.

### 2. Asset Processing:
- Firebase Cloud Tasks enqueue and process individual tasks (image generation, voice synthesis, captioning).
- A sync function monitors the status of each asset, updating the video status to “assets: ready” when every asset is complete.

### 3. Video Rendering:
- Remotion renders the final video on AWS Lambda once all assets are ready.
- A polling mechanism tracks the render progress and updates the video’s status in real‑time.

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- Firebase CLI
- AWS Account & credentials for AWS Lambda
- API Keys for:
    - OpenAI
    - Replicate
    - ElevenLabs

### Installation

#### 1. Clone the Repository:
```bash
git clone https://github.com/yourusername/vidspark.git
cd vidspark
```

#### 2. Install Dependencies:
```bash
npm install
# or
yarn install
```

#### 3. Configure Environment Variables:

Create a .env file in the root directory with the following keys (adjust values accordingly):
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

REMOTION_AWS_LAMBDA_FUNCTION_NAME=your_lambda_function_name
REMOTION_AWS_LAMBDA_REGION=us-east-1
REMOTION_AWS_SERVE_URL=https://your-serve-url.com
REMOTION_AWS_ACCESS_KEY_ID=your_aws_access_key_id
REMOTION_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

OPENAI_API_KEY=your_openai_api_key
REPLICATE_API_KEY=your_replicate_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

#### 4. Deploy Firebase Functions:

Use the Firebase CLI to deploy your functions and tasks:
```bash
firebase deploy --only functions
```

#### 5. Run the Application Locally:
```bash
npm run dev
```

## Usage
- **Content Creation & Editing:**  
  Navigate to the content creation section to generate story ideas and customize your video assets. The UI shows real‑time status for narration, image, voice, and music processing.
- **Admin Panel:**  
  Manage content types with drag‑and‑drop reordering and inline editing, powered by React Hook Form and Zod validation.
- **Video Rendering:**  
  Once assets are ready, the video is rendered using Remotion on AWS Lambda. Monitor progress and status updates throughout the rendering process.
- **Asset Syncing:**  
  Firebase Cloud Tasks handle individual tasks for image and voice processing, and a sync task ensures all assets are ready before final video processing.

## Contributing
Contributions are welcome!  
Feel free to fork the repository, open issues, or submit pull requests with improvements or new features. For major changes, please open an issue first to discuss your ideas.

## Support & Contact
For questions or support, please reach out to [info@manu-web.de](mailto:info@manu-web.de) 😊