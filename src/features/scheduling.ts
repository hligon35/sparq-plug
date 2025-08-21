// Post scheduling logic
export interface ScheduledPost {
  id: string;
  clientId: string;
  platform: string;
  content: string;
  scheduledTime: Date;
  status: 'scheduled' | 'posted' | 'failed';
}

export const scheduledPosts: ScheduledPost[] = [];
// ...add scheduling logic here...

interface EngagementData {
  timestamp: Date;
  engagement: number;
  contentType: 'image' | 'video' | 'text';
}

/**
 * Suggests the optimal time to post based on engagement analytics and content type.
 * @param analytics Engagement data for the client/platform
 * @param contentType Type of content to be posted
 * @returns Date object representing the recommended time
 */
export function getOptimalPostTime(analytics: EngagementData[], contentType: 'image' | 'video' | 'text'): Date {
  // Filter analytics by content type
  const filtered = analytics.filter(a => a.contentType === contentType);
  if (filtered.length === 0) return new Date(); // fallback: now

  // Group by hour of day
  const hourMap: { [hour: number]: number } = {};
  filtered.forEach(a => {
    const hour = a.timestamp.getHours();
    hourMap[hour] = (hourMap[hour] || 0) + a.engagement;
  });

  // Find hour with max engagement
  let bestHour = 0;
  let maxEngagement = -1;
  for (const hour in hourMap) {
    if (hourMap[hour] > maxEngagement) {
      maxEngagement = hourMap[hour];
      bestHour = Number(hour);
    }
  }

  // Suggest next occurrence of best hour
  const now = new Date();
  const suggested = new Date(now);
  suggested.setHours(bestHour, 0, 0, 0);
  if (suggested < now) suggested.setDate(now.getDate() + 1);
  return suggested;
}
