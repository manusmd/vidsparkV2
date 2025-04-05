# Video Templates Feature Proposal

## Overview

This document outlines a proposal for implementing a template feature in VidSpark Studio that will streamline the video creation process and enable bulk content production. Templates will allow users to save their preferred settings for various aspects of video creation, reducing repetitive configuration when creating multiple videos of the same style.

## Purpose

The template feature will address several key needs:

1. **Efficiency**: Reduce the time spent configuring the same settings for multiple videos
2. **Consistency**: Maintain brand consistency across multiple videos
3. **Scalability**: Enable bulk video creation from predefined templates
4. **Flexibility**: Allow for quick experimentation with different styles

## Template Components

Each template will store the following elements:

| Component | Description | Default |
|-----------|-------------|---------|
| Content Type | The selected content type (e.g., Mind-Blowing Facts, Historical Tales) | Required |
| Voice | The narrator voice to be used | Required |
| Image Style | Visual styling for generated images | Required |
| Text Design | Style and font for on-screen text | Required |
| Text Position | Placement of text on the video | Required |
| Show Title | Whether to display the video title | `true` |
| Background Music | Selected background track | Required |
| Template Name | User-defined name for the template | "Untitled Template" |
| Creation Date | When the template was created | Current date |
| Last Used | When the template was last used | Creation date |

> **Note:** The narration text will always be AI-generated based on the selected content type and cannot be saved as part of the template.

## User Flows

### Creating a Template

1. User goes through the normal video creation flow, selecting all components
2. At any point, user can click "Save as Template" button
3. User enters a name for the template
4. System confirms template has been saved

### Using a Template for Single Video Creation

1. User selects "Create from Template" option
2. User selects a template from their saved templates
3. System pre-fills all settings based on the template
4. User is prompted to generate AI narration
5. User can review and optionally modify any settings
6. User proceeds with video creation

### Bulk Video Creation from Template

1. User selects "Bulk Create" option
2. User selects a template from their saved templates
3. User specifies the number of videos to create (with a reasonable limit)
4. System generates the specified number of videos:
   - Using all template settings
   - Generating unique AI narration for each video
5. Videos are queued for processing
6. User can monitor progress in the dashboard

For detailed flow diagrams, see [Template Flow Diagrams](./images/template-flow.md).

## Technical Implementation

### Data Model

```typescript
interface VideoTemplate {
  id: string;
  userId: string;
  name: string;
  contentTypeId: string;
  voiceId: string;
  imageStyleId: string;
  textDesign: {
    fontId: string;
    styleId: string;
  };
  textPosition: 'top' | 'middle' | 'bottom';
  showTitle: boolean;
  musicId: string;
  createdAt: Date;
  lastUsedAt: Date;
}
```

### Storage

Templates will be stored in Firebase Firestore under a `templates` collection, with the following structure:

```
templates/{templateId}
```

Each template document will include references to the components rather than the full component data to minimize storage requirements and ensure templates always use the latest versions of components.

## UI Components

### Template Manager

A new section in the user dashboard will be dedicated to managing templates:
- List view of all saved templates
- Ability to edit, rename, or delete templates
- Usage statistics (how many videos created from each template)
- Preview of template settings

### Template Selection Interface

When starting the video creation process, users will see:
- Option to start from scratch
- Option to use a template
- Grid or list of available templates with preview cards

### Bulk Creation Interface

A new interface for bulk creation will include:
- Template selection
- Number of videos to create (with appropriate limits)
- Estimated processing time
- Option to customize certain aspects (like specific topics)

For UI mockups, see [Template UI Mockups](./images/template-ui-mockup.md).

## Implementation Plan

### Phase 1: Template Creation & Storage

- [x] Create data model for templates
- [x] Implement template storage in Firestore
- [x] Add "Save as Template" button to video creation flow
- [x] Implement template saving functionality
- [x] Create basic template management UI

### Phase 2: Template Usage

- [x] Implement "Create from Template" flow
- [x] Add template selection interface
- [x] Create functionality to apply template settings to video creation
- [x] Test end-to-end template usage workflow

### Phase 3: Bulk Creation

- [x] Design bulk creation interface
- [x] Implement backend processing for multiple AI narration generation
- [x] Create queue system for processing multiple videos
- [x] Add progress tracking and notification system
- [x] Implement error handling and recovery for bulk processing

### Phase 4: Refinement & Optimization

- [ ] Add template analytics (usage stats)
- [ ] Implement template sharing functionality (optional)
- [ ] Optimize bulk processing for performance
- [ ] Add template favoriting and categorization

## Technical Considerations

1. **Performance**: Bulk creation will require significant server resources. Consider implementing rate limiting and queue management.

2. **Error Handling**: If one video in a bulk creation fails, the system should continue processing the rest.

3. **Quotas**: Consider implementing template and bulk creation limits based on user subscription tier.

4. **Testing**: Extensive testing will be needed to ensure templates correctly preserve all settings and that bulk creation works reliably.

## To-Do List

1. [x] Define template data structure in Firestore
2. [x] Create UI components for template management
3. [x] Implement template saving functionality
4. [x] Develop template selection interface
5. [x] Build template application logic
6. [x] Design and implement bulk creation interface
7. [x] Develop backend services for bulk processing
8. [x] Create queue management system
9. [x] Implement progress tracking and notifications
10. [x] Add error handling and recovery mechanisms
11. [ ] Test all flows extensively
12. [ ] Create documentation for users 