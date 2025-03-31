# VidSpark Dashboard Proposal

## Overview

The VidSpark dashboard should serve as a central hub for users to monitor their platform activities, manage resources, and access key features. This proposal focuses exclusively on platform-related content and features, distinct from the YouTube analytics already available in the analytics dashboard.

## Data Sources

Based on the codebase analysis, we have access to these key data sources:

1. **User Videos** (`/api/video/get-user-videos`)
   - Video metadata (ID, title, description)
   - Creation dates
   - Processing status
   - Platform-specific metrics

2. **User Credits** (`/api/credits`)
   - Available credits
   - Lifetime credits
   - Credits expiration date
   - User plan (free, pro, business)
   - Transaction history

## Dashboard Sections

### 1. Main Platform Dashboard

#### Key Performance Indicators (KPIs)
- **Total Videos Created**: Count of all videos generated with VidSpark
- **Videos in Production**: Number of videos in various stages of the pipeline
- **Available Credits**: Current credit balance
- **Completion Rate**: Percentage of started videos that reach completion

#### Quick Actions Panel
- Create New Video
- Resume Draft
- Purchase Credits
- Access Settings

### 2. Content Management

#### Recent Videos
- Display the 6 most recent videos with:
  - Thumbnail
  - Title
  - Creation date
  - Status (draft, processing, completed)
  - Platform-specific metrics
  - Quick action buttons (edit, publish, delete)

#### Content Pipeline
- **Creation Stages**: Visual pipeline showing videos at different stages
- **Production Status**: Overview of rendering/processing activities
- **Content Health**: Completion rate of videos (started vs. published)

### 3. Platform Activity

#### Creation Trends
- Video creation frequency (daily/weekly/monthly)
- Content type distribution
- Completion time averages

#### Popular Templates
- Most used content templates
- Successful format recommendations
- Template usage statistics

### 4. Resource Management

#### Credit Usage
- Credit balance and usage history
- Credits spent per video
- Estimated remaining capacity (videos that can be created)
- Subscription tier and benefits

#### Credit Transactions
- Transaction history table showing:
  - Date
  - Transaction type (purchase, usage, refund, expiration, plan allocation)
  - Amount
  - Description
  - Balance after transaction

## Visual Design

The dashboard should maintain the existing design system while emphasizing:

1. **Platform Metrics**: Focus on creation and production metrics
2. **Card-Based Layout**: Modular sections that can be reorganized
3. **Actionable Insights**: Highlight recommendations and next steps
4. **Progressive Disclosure**: Show essential information first with options to expand

## Implementation Priority

### Phase 1: Core Platform Experience
Breaking down the highest priority items into manageable sub-phases:

#### Phase 1A: Essential KPIs and Video Management
- **Dashboard Core Metrics**:
  - Total Videos Created counter
  - Available Credits display
  - Videos in Production counter
- **Recent Videos Grid**:
  - Basic list with thumbnails, titles, and creation dates
  - Status indicators (draft, processing, completed)
  - Simple action buttons (view, edit)

#### Phase 1B: Quick Actions and Basic Content Performance
- **Quick Action Panel**:
  - Create New Video button with content type selection
  - Purchase Credits shortcut
- **Extended Video Grid Features**:
  - Platform metrics for videos
  - Filter options (all, drafts, completed)
  - Pagination/infinite scroll for larger libraries

#### Phase 1C: Basic Platform Insights
- **Creation Activity Metrics**:
  - Simple chart for video creation trends
  - Completion rate of videos (started vs. completed)
- **Resource Utilization**:
  - Credits used over time
  - Average resource consumption per video

### Phase 2: Enhanced Platform Insights

- **Advanced Platform Dashboard**:
  - Content pipeline visualization
  - Production time metrics
  - Platform usage patterns
- **Template Analysis**:
  - Popular template tracking
  - Content type distribution
  - Success rate by template type

### Phase 3: Resource Management and Advanced Features

- **Credit Management Dashboard**:
  - Detailed credit history and transaction log
  - Usage analytics (credits per video)
  - Subscription tier benefits visualization
- **Content Library Management**:
  - Advanced filtering and sorting
  - Batch operations
  - Archive and restoration features

### Phase 4: Workflow Optimization

- **Platform Workflow Integration**:
  - Template favorites and quick access
  - Custom workflow creation
  - Saved preferences
- **AI-Driven Platform Recommendations**:
  - Content template suggestions
  - Optimization tips for efficient creation
  - Resource usage optimization

### Phase 5: Automation and Scalability

- **Automation Workflows**:
  - Create templated video sequences
  - Batch content creation
  - Advanced resource management
- **Advanced Platform Optimization**:
  - Custom dashboard configurations
  - Export and reporting capabilities
  - Team collaboration features

## Technical Considerations

- Use existing API endpoints to avoid backend changes
- Implement client-side data processing for platform insights
- Consider caching strategies for frequently accessed data
- Ensure responsive design for mobile users

## Expected Outcomes

- **Increased Platform Engagement**: More time spent creating content
- **Higher Resource Utilization**: Increase in credit purchases from dashboard insights
- **Improved Content Creation**: Users creating more videos based on platform recommendations
- **Better Platform Experience**: Improvement in user satisfaction metrics

This dashboard proposal is designed to focus exclusively on the VidSpark platform experience, complementing (rather than duplicating) the existing YouTube analytics dashboard.
