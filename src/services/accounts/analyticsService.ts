import { google } from "googleapis";
import { AccountData, createOAuth2Client, refreshOAuth2Token } from "./accountService";

// Define interfaces for analytics data
export interface ChannelStats {
  viewCount: number;
  subscriberCount: number;
  videoCount: number;
}

export interface VideoData {
  publishDay: number;
  publishHour: number;
  views: number;
}

export interface BestPostingHour {
  hour: string;
  hourFormatted: string;
  totalViews: number;
  totalWatchTime: number;
  count: number;
  avgViews: number;
  avgWatchTime: number;
  day?: string;
}

export interface DayData {
  day: string;
  dayName?: string;
  totalViews: number;
  totalWatchTime: number;
  count: number;
  avgViews?: number;
  avgWatchTime?: number;
}

export interface AnalyticsResponse {
  channelStats: ChannelStats;
  bestPostingTimes: {
    days: Array<DayData & { dayName: string }>;
    hours: BestPostingHour[];
    hoursByDay: { [day: string]: BestPostingHour[] };
  };
  videoAnalysis: {
    videosAnalyzed: number;
    dataSource: "channel_videos" | "analytics_api";
    dateRange: {
      start: string;
      end: string;
    };
    description: string;
  };
}

/**
 * Gets analytics data for a YouTube channel
 * @param accountData The account data
 * @param accountId The account ID
 * @returns The analytics data
 */
export async function getChannelAnalytics(
  accountData: AccountData,
  accountId: string
): Promise<AnalyticsResponse> {
  // Create OAuth2 client
  let oauth2Client = createOAuth2Client(accountData);

  // Refresh the token
  oauth2Client = await refreshOAuth2Token(
    accountId,
    oauth2Client,
    accountData.refreshToken
  );

  // Get YouTube API client
  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  // Get channel statistics
  const channelResponse = await youtube.channels.list({
    part: ["statistics", "contentDetails"],
    id: [accountData.accountId],
  });

  const channelStats = channelResponse.data.items?.[0]?.statistics || {
    viewCount: "0",
    subscriberCount: "0",
    videoCount: "0",
  };

  // Get uploads playlist ID
  const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  // Get video data
  const videoData: VideoData[] = [];

  if (uploadsPlaylistId) {
    const playlistItemsResponse = await youtube.playlistItems.list({
      part: ["snippet", "contentDetails"],
      playlistId: uploadsPlaylistId,
      maxResults: 50,
    });

    const videoIds = playlistItemsResponse.data.items?.map(
      (item) => item.contentDetails?.videoId || ""
    ).filter(id => id !== "") || [];

    if (videoIds.length > 0) {
      const videosResponse = await youtube.videos.list({
        part: ["statistics", "snippet"],
        id: videoIds,
      });

      videosResponse.data.items?.forEach((video) => {
        const publishedAt = video.snippet?.publishedAt;
        const viewCount = parseInt(video.statistics?.viewCount || "0");

        if (publishedAt) {
          const publishDate = new Date(publishedAt);
          const publishDay = publishDate.getDay();
          const publishHour = publishDate.getHours();

          videoData.push({
            publishDay,
            publishHour,
            views: viewCount,
          });
        }
      });
    }
  }

  // Get YouTube Analytics API client
  const youtubeAnalytics = google.youtubeAnalytics({
    version: "v2",
    auth: oauth2Client,
  });

  // Set date range for analytics
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const startDateStr = startDate.toISOString().split("T")[0];

  // Get day analytics
  const dayAnalyticsResponse = await youtubeAnalytics.reports.query({
    ids: `channel==${accountData.accountId}`,
    startDate: startDateStr,
    endDate,
    metrics: "estimatedMinutesWatched,views,likes,subscribersGained",
    dimensions: "day",
    sort: "-estimatedMinutesWatched",
  });

  const dayData = dayAnalyticsResponse.data.rows || [];

  // Get hour analytics
  const hourAnalyticsResponse = await youtubeAnalytics.reports.query({
    ids: `channel==${accountData.accountId}`,
    startDate: startDateStr,
    endDate,
    metrics: "estimatedMinutesWatched,views",
    dimensions: "day",
    sort: "-estimatedMinutesWatched",
  });

  const hourData = hourAnalyticsResponse.data.rows || [];

  // Process analytics data
  return processAnalyticsData(
    videoData,
    dayData as [string, string, string][],
    hourData as [string, string, string][],
    channelStats as {
      viewCount: string;
      subscriberCount: string;
      videoCount: string;
    },
    startDateStr,
    endDate
  );
}

/**
 * Processes analytics data to calculate best posting times
 * @param videoData Video data from the channel
 * @param dayData Day analytics data
 * @param hourData Hour analytics data
 * @param channelStats Channel statistics
 * @param startDateStr Start date for analytics
 * @param endDate End date for analytics
 * @returns Processed analytics data
 */
function processAnalyticsData(
  videoData: VideoData[],
  dayData: [string, string, string][],
  hourData: [string, string, string][],
  channelStats: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  },
  startDateStr: string,
  endDate: string
): AnalyticsResponse {
  const dayMap: { [key: string]: DayData } = {};

  // Initialize hours by day
  const hoursByDay: { [day: string]: { [hour: string]: BestPostingHour } } = {};
  for (let day = 0; day < 7; day++) {
    hoursByDay[day.toString()] = {};
    for (let hour = 0; hour < 24; hour++) {
      hoursByDay[day.toString()][hour.toString()] = {
        hour: hour.toString(),
        day: day.toString(),
        hourFormatted: formatHour(hour),
        totalViews: 0,
        totalWatchTime: 0,
        count: 0,
        avgViews: 0,
        avgWatchTime: 0,
      };
    }
  }

  // Process video data if available
  if (videoData.length > 0) {
    videoData.forEach((video) => {
      const day = video.publishDay.toString();
      const hour = video.publishHour.toString();

      if (!hoursByDay[day][hour]) {
        hoursByDay[day][hour] = {
          hour,
          day,
          hourFormatted: formatHour(parseInt(hour)),
          totalViews: 0,
          totalWatchTime: 0,
          count: 0,
          avgViews: 0,
          avgWatchTime: 0,
        };
      }

      hoursByDay[day][hour].totalViews += video.views;
      hoursByDay[day][hour].totalWatchTime += video.views * 2;
      hoursByDay[day][hour].count++;

      if (!dayMap[day]) {
        dayMap[day] = { day, totalViews: 0, totalWatchTime: 0, count: 0 };
      }
      dayMap[day].totalViews += video.views;
      dayMap[day].totalWatchTime += video.views * 2;
      dayMap[day].count++;
    });
  } else {
    // Process analytics data if no video data
    const processAnalyticsRows = (data: [string, string, string][]) => {
      data.forEach((row) => {
        const [date, watchTime, views] = row;

        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay().toString();

        if (!dayMap[dayOfWeek]) {
          dayMap[dayOfWeek] = { day: dayOfWeek, totalViews: 0, totalWatchTime: 0, count: 0 };
        }
        dayMap[dayOfWeek].totalViews += parseInt(views);
        dayMap[dayOfWeek].totalWatchTime += parseInt(watchTime);
        dayMap[dayOfWeek].count++;
      });
    };

    processAnalyticsRows(hourData);
    processAnalyticsRows(dayData);
  }

  // Calculate best days
  const bestDays = Object.values(dayMap)
    .map(d => ({
      ...d,
      avgViews: d.totalViews / d.count,
      avgWatchTime: d.totalWatchTime / d.count,
    }))
    .sort((a, b) => b.avgWatchTime - a.avgWatchTime);

  const topDays = bestDays.slice(0, 3);

  // Format day names
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const formattedTopDays = topDays.map(d => ({
    ...d,
    dayName: dayNames[parseInt(d.day)],
  }));

  // General recommendations for posting times
  const generalRecommendations: { [key: string]: number[] } = {
    "1": [16, 15, 17], // Monday
    "2": [15, 16, 17], // Tuesday
    "3": [16, 15, 17], // Wednesday
    "4": [16, 15, 17], // Thursday
    "5": [15, 16, 17], // Friday
    "6": [17, 15, 16], // Saturday
    "0": [15, 16, 17]  // Sunday
  };

  // Process hours by day
  const hoursByDayProcessed: { [day: string]: BestPostingHour[] } = {};

  Object.keys(hoursByDay).forEach(day => {
    const hoursForThisDay = Object.values(hoursByDay[day]);
    const hasEnoughData = hoursForThisDay.length > 0 && hoursForThisDay.some(h => h.count > 0);

    let hoursForDay;

    if (!hasEnoughData) {
      // Use general recommendations if not enough data
      hoursForDay = generalRecommendations[day].map((hour: number) => {
        return {
          hour: hour.toString(),
          day: day,
          hourFormatted: formatHour(hour),
          totalViews: 0,
          totalWatchTime: 0,
          count: 0,
          avgViews: 0,
          avgWatchTime: 0,
        };
      });
    } else {
      // Calculate best hours based on data
      hoursForDay = Object.values(hoursByDay[day])
        .map(h => ({
          ...h,
          avgViews: h.totalViews / h.count,
          avgWatchTime: h.totalWatchTime / h.count,
        }))
        .sort((a, b) => {
          const watchTimeDiff = b.avgWatchTime - a.avgWatchTime;
          return watchTimeDiff !== 0 ? watchTimeDiff : parseInt(a.hour) - parseInt(b.hour);
        })
        .slice(0, 3);
    }

    hoursByDayProcessed[day] = hoursForDay;
  });

  // Calculate top hours overall
  const allHours: BestPostingHour[] = [];

  const topDayIndices = topDays.map(d => d.day);

  topDayIndices.forEach(day => {
    const recommendedHours = generalRecommendations[day];

    recommendedHours.forEach((hour: number, index: number) => {
      const score = (3 - topDayIndices.indexOf(day)) * 100 + (3 - index) * 10;

      allHours.push({
        hour: hour.toString(),
        day,
        hourFormatted: formatHour(hour),
        totalViews: 0,
        totalWatchTime: 0,
        count: 0,
        avgViews: 0,
        avgWatchTime: score
      });
    });
  });

  const topHours = allHours
    .sort((a, b) => b.avgWatchTime - a.avgWatchTime)
    .slice(0, 3);

  const formattedTopHours: BestPostingHour[] = topHours.length > 0 ? topHours : [
    {
      hour: "16",
      day: "3",
      hourFormatted: "4 PM",
      totalViews: 0,
      totalWatchTime: 0,
      count: 0,
      avgViews: 0,
      avgWatchTime: 0
    }
  ];

  // Return formatted response
  return {
    channelStats: {
      viewCount: parseInt(channelStats.viewCount || "0"),
      subscriberCount: parseInt(channelStats.subscriberCount || "0"),
      videoCount: parseInt(channelStats.videoCount || "0"),
    },
    bestPostingTimes: {
      days: formattedTopDays,
      hours: formattedTopHours,
      hoursByDay: hoursByDayProcessed,
    },
    videoAnalysis: {
      videosAnalyzed: videoData.length,
      dataSource: videoData.length > 0 ? "channel_videos" : "analytics_api",
      dateRange: {
        start: startDateStr,
        end: endDate,
      },
      description: videoData.length > 0 
        ? `Analysis based on ${videoData.length} videos from your channel` 
        : "Analysis based on general channel analytics data",
    },
  };
}

/**
 * Formats an hour number to a 12-hour format with AM/PM
 * @param hour The hour (0-23)
 * @returns Formatted hour string (e.g., "3 PM")
 */
function formatHour(hour: number): string {
  const hour12 = hour % 12 || 12;
  const amPm = hour < 12 ? 'AM' : 'PM';
  return `${hour12} ${amPm}`;
}
