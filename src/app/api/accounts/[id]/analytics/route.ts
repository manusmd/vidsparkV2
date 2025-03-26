import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { google } from "googleapis";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "").trim();
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const channelId = params.id;

    const accountDoc = await db.collection("accounts").doc(channelId).get();
    if (!accountDoc.exists) {
      return NextResponse.json(
        { error: "Channel not found" },
        { status: 404 }
      );
    }

    const accountData = accountDoc.data();
    if (!accountData) {
      return NextResponse.json(
        { error: "Channel data not found" },
        { status: 404 }
      );
    }

    if (accountData.userId !== uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!
    );
    oauth2Client.setCredentials({
      access_token: accountData.token,
      refresh_token: accountData.refreshToken,
    });

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      await db.collection("accounts").doc(channelId).update({
        token: credentials.access_token,
        refreshToken: credentials.refresh_token || accountData.refreshToken,
      });
      oauth2Client.setCredentials({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || accountData.refreshToken,
      });
    } catch (refreshError) {
      console.error("Failed to refresh access token:", refreshError);
      return NextResponse.json(
        { error: "Failed to refresh access token" },
        { status: 500 }
      );
    }

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const channelResponse = await youtube.channels.list({
      part: ["statistics", "contentDetails"],
      id: [accountData.accountId],
    });

    const channelStats = channelResponse.data.items?.[0]?.statistics || {
      viewCount: "0",
      subscriberCount: "0",
      videoCount: "0",
    };

    const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    const videoData: { publishDay: number; publishHour: number; views: number; }[] = [];

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

    const youtubeAnalytics = google.youtubeAnalytics({
      version: "v2",
      auth: oauth2Client,
    });

    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const startDateStr = startDate.toISOString().split("T")[0];

    const dayAnalyticsResponse = await youtubeAnalytics.reports.query({
      ids: `channel==${accountData.accountId}`,
      startDate: startDateStr,
      endDate,
      metrics: "estimatedMinutesWatched,views,likes,subscribersGained",
      dimensions: "day",
      sort: "-estimatedMinutesWatched",
    });

    const dayData = dayAnalyticsResponse.data.rows || [];

    const dayMap: { [key: string]: { day: string, totalViews: number, totalWatchTime: number, count: number } } = {};

    const hourAnalyticsResponse = await youtubeAnalytics.reports.query({
      ids: `channel==${accountData.accountId}`,
      startDate: startDateStr,
      endDate,
      metrics: "estimatedMinutesWatched,views",
      dimensions: "day",
      sort: "-estimatedMinutesWatched",
    });

    const hourData = hourAnalyticsResponse.data.rows || [];

    const hoursByDay: { [day: string]: { [hour: string]: { hour: string, day: string, totalViews: number, totalWatchTime: number, count: number } } } = {};
    for (let day = 0; day < 7; day++) {
      hoursByDay[day.toString()] = {};
      for (let hour = 0; hour < 24; hour++) {
        hoursByDay[day.toString()][hour.toString()] = {
          hour: hour.toString(),
          day: day.toString(),
          totalViews: 0,
          totalWatchTime: 0,
          count: 0
        };
      }
    }

    if (videoData.length > 0) {
      videoData.forEach((video) => {
        const day = video.publishDay.toString();
        const hour = video.publishHour.toString();

        if (!hoursByDay[day][hour]) {
          hoursByDay[day][hour] = {
            hour,
            day,
            totalViews: 0,
            totalWatchTime: 0,
            count: 0
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
      type DayAnalyticsRow = [string, string, string];

      const processAnalyticsData = (data: DayAnalyticsRow[]) => {
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

      processAnalyticsData(hourData as DayAnalyticsRow[]);
      processAnalyticsData(dayData as DayAnalyticsRow[]);
    }

    const bestDays = Object.values(dayMap)
      .map(d => ({
        ...d,
        avgViews: d.totalViews / d.count,
        avgWatchTime: d.totalWatchTime / d.count,
      }))
      .sort((a, b) => b.avgWatchTime - a.avgWatchTime);

    const topDays = bestDays.slice(0, 3);

    type BestPostingHour = {
      hour: string;
      hourFormatted: string;
      totalViews: number;
      totalWatchTime: number;
      count: number;
      avgViews: number;
      avgWatchTime: number;
      day?: string;
    };

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const formattedTopDays = topDays.map(d => ({
      ...d,
      dayName: dayNames[parseInt(d.day)],
    }));

    const generalRecommendations: { [key: string]: number[] } = {
      "1": [16, 15, 17],
      "2": [15, 16, 17],
      "3": [16, 15, 17],
      "4": [16, 15, 17],
      "5": [15, 16, 17],
      "6": [17, 15, 16],
      "0": [15, 16, 17]
    };

    const hoursByDayProcessed: { [day: string]: BestPostingHour[] } = {};

    Object.keys(hoursByDay).forEach(day => {
      const hoursForThisDay = Object.values(hoursByDay[day]);
      const hasEnoughData = hoursForThisDay.length > 0 && hoursForThisDay.some(h => h.count > 0);

      let hoursForDay;

      if (!hasEnoughData) {
        hoursForDay = generalRecommendations[day].map((hour: number) => {
          return {
            hour: hour.toString(),
            day: day,
            totalViews: 0,
            totalWatchTime: 0,
            count: 0,
            avgViews: 0,
            avgWatchTime: 0,
          };
        });
      } else {
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

      const formattedHoursForDay = hoursForDay.map(h => {
        const hourNum = parseInt(h.hour);
        const hour12 = hourNum % 12 || 12;
        const amPm = hourNum < 12 ? 'AM' : 'PM';
        return {
          ...h,
          hourFormatted: `${hour12} ${amPm}`,
        };
      });

      hoursByDayProcessed[day] = formattedHoursForDay;
    });

    const allHours: BestPostingHour[] = [];

    const topDayIndices = topDays.map(d => d.day);

    topDayIndices.forEach(day => {
      const recommendedHours = generalRecommendations[day];

      recommendedHours.forEach((hour: number, index: number) => {
        const score = (3 - topDayIndices.indexOf(day)) * 100 + (3 - index) * 10;

        allHours.push({
          hour: hour.toString(),
          day,
          hourFormatted: `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`,
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

    return NextResponse.json({
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
    });
  } catch (error: unknown) {
    console.error("Error fetching analytics:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
