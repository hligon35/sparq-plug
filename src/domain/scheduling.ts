export interface ScheduledPostModel {
  id: string;
  content: string;
  platforms: string[];
  clientId: string;
  clientName: string;
  scheduledAt: string; // ISO timestamp
  status: 'Scheduled' | 'Draft' | 'Published' | 'Failed';
  mediaType?: 'image' | 'video' | 'carousel' | 'text';
  engagement?: { likes: number; comments: number; shares: number };
}

export interface ListPostsParams {
  clientId?: string | null;
  managerId?: string | null; // 'current'
  status?: string | null; // csv
  platform?: string | null; // csv
  from?: string | null;
  to?: string | null;
}
