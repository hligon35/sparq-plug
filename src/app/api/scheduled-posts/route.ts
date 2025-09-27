import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/storage';
import { createApiHandler } from '@/core/apiHandler';
import { isFlagEnabled } from '@/core/featureFlags';
import { ScheduledPostSchema, validate } from '@/core/validation';
import { ValidationError } from '@/core/errors';
import { counter } from '@/core/metrics';
import { listPosts, createPost, aggregateByDay } from '@/services/schedulingService';
import { ScheduledPostModel } from '@/domain/scheduling';

export type ScheduledPost = {
  id: string;
  content: string;
  platforms: string[];
  clientId: string;
  clientName: string;
  scheduledAt: string; // ISO
  status: 'Scheduled' | 'Draft' | 'Published' | 'Failed';
  mediaType?: 'image' | 'video' | 'carousel' | 'text';
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
};

// Mock data for demonstration
const mockPosts: ScheduledPost[] = [
  {
    id: '1',
    content: 'Exciting product launch announcement! 🚀 Our new AI-powered analytics dashboard is now live. Get insights like never before! #TechCorp #Analytics #Innovation',
    platforms: ['Facebook', 'LinkedIn', 'Twitter/X'],
    clientId: 'tech-corp-1',
    clientName: 'TechCorp Solutions',
    scheduledAt: '2025-09-25T10:00:00Z',
    status: 'Published',
    mediaType: 'image',
    engagement: { likes: 324, comments: 45, shares: 89 }
  },
  {
    id: '2',
    content: 'Behind the scenes: Our development team working on the next big feature. Stay tuned! 👨‍💻 #BehindTheScenes #Development',
    platforms: ['Instagram', 'Facebook'],
    clientId: 'tech-corp-1',
    clientName: 'TechCorp Solutions',
    scheduledAt: '2025-09-26T14:30:00Z',
    status: 'Scheduled',
    mediaType: 'video'
  },
  {
    id: '3',
    content: 'Customer success story: How TechCorp helped ABC Company increase their productivity by 300%. Read the full case study on our blog.',
    platforms: ['LinkedIn'],
    clientId: 'tech-corp-1',
    clientName: 'TechCorp Solutions',
    scheduledAt: '2025-09-27T09:00:00Z',
    status: 'Draft',
    mediaType: 'text'
  },
  {
    id: '4',
    content: 'Quick tip Tuesday: 5 ways to optimize your workflow with our tools. Swipe to see all tips! ➡️ #TipTuesday #Productivity',
    platforms: ['Instagram', 'TikTok'],
    clientId: 'tech-corp-1',
    clientName: 'TechCorp Solutions',
    scheduledAt: '2025-09-30T11:00:00Z',
    status: 'Scheduled',
    mediaType: 'carousel'
  },
  {
    id: '5',
    content: 'Join us at the Tech Innovation Summit 2025! We\'ll be showcasing our latest solutions. Book a meeting with our team at booth #47.',
    platforms: ['Facebook', 'LinkedIn', 'Twitter/X'],
    clientId: 'tech-corp-1',
    clientName: 'TechCorp Solutions',
    scheduledAt: '2025-10-01T08:00:00Z',
    status: 'Scheduled',
    mediaType: 'image'
  },
  {
    id: '6',
    content: 'Weekend inspiration: Success is not final, failure is not fatal. It is the courage to continue that counts. - Winston Churchill ✨',
    platforms: ['Instagram', 'Facebook'],
    clientId: 'tech-corp-1',
    clientName: 'TechCorp Solutions',
    scheduledAt: '2025-10-04T16:00:00Z',
    status: 'Draft',
    mediaType: 'text'
  },
  {
    id: '7',
    content: 'New blog post alert! 📝 "The Future of AI in Business Analytics" - Discover how artificial intelligence is transforming data insights.',
    platforms: ['LinkedIn', 'Twitter/X'],
    clientId: 'tech-corp-1',
    clientName: 'TechCorp Solutions',
    scheduledAt: '2025-10-05T12:00:00Z',
    status: 'Published',
    mediaType: 'text',
    engagement: { likes: 156, comments: 23, shares: 34 }
  },
  {
    id: '8',
    content: 'Team spotlight: Meet Sarah, our Lead UX Designer! She\'s the creative mind behind our intuitive user interfaces. 🎨 #TeamSpotlight',
    platforms: ['Instagram', 'Facebook', 'LinkedIn'],
    clientId: 'tech-corp-1',
    clientName: 'TechCorp Solutions',
    scheduledAt: '2025-10-07T13:30:00Z',
    status: 'Scheduled',
    mediaType: 'image'
  },
  // Posts for Bella Vista Restaurant
  {
    id: '20',
    content: 'Fresh ingredients, authentic flavors! Come taste our signature dishes made with locally sourced ingredients. 🍝 #LocalFlavors #FreshFood',
    platforms: ['Instagram', 'Facebook'],
    clientId: 'restaurant-1',
    clientName: 'Bella Vista Restaurant',
    scheduledAt: '2025-09-25T18:00:00Z',
    status: 'Published',
    mediaType: 'image',
    engagement: { likes: 245, comments: 32, shares: 18 }
  },
  {
    id: '21',
    content: 'Wine Wednesday special: 30% off all Italian wines! Perfect pairing with our chef\'s special pasta. 🍷 #WineWednesday #ItalianWine',
    platforms: ['Facebook', 'Instagram'],
    clientId: 'restaurant-1',
    clientName: 'Bella Vista Restaurant',
    scheduledAt: '2025-10-01T17:00:00Z',
    status: 'Scheduled',
    mediaType: 'image'
  },
  {
    id: '22',
    content: 'Chef\'s special tonight: Homemade Osso Buco with saffron risotto. Made with love, served with tradition. 👨‍🍳 #ChefSpecial',
    platforms: ['Instagram', 'TikTok'],
    clientId: 'restaurant-1',
    clientName: 'Bella Vista Restaurant',
    scheduledAt: '2025-10-02T16:30:00Z',
    status: 'Draft',
    mediaType: 'video'
  },
  {
    id: '23',
    content: 'Sunday family dinner traditions start here. Book your table for our Sunday special menu. 👨‍👩‍👧‍👦 #SundayDinner #Family',
    platforms: ['Facebook', 'Instagram'],
    clientId: 'restaurant-1',
    clientName: 'Bella Vista Restaurant',
    scheduledAt: '2025-10-06T15:00:00Z',
    status: 'Scheduled',
    mediaType: 'image'
  },
  // Posts for Peak Performance Fitness
  {
    id: '30',
    content: 'Monday motivation: Your only competition is who you were yesterday. Let\'s crush this week together! 💪 #MondayMotivation #FitnessGoals',
    platforms: ['Instagram', 'Facebook', 'TikTok'],
    clientId: 'fitness-studio-1',
    clientName: 'Peak Performance Fitness',
    scheduledAt: '2025-09-23T07:00:00Z',
    status: 'Published',
    mediaType: 'video',
    engagement: { likes: 423, comments: 67, shares: 89 }
  },
  {
    id: '31',
    content: 'New HIIT class starting this week! High intensity, maximum results. Sign up now - limited spots available. 🔥 #HIIT #NewClass',
    platforms: ['Instagram', 'Facebook'],
    clientId: 'fitness-studio-1',
    clientName: 'Peak Performance Fitness',
    scheduledAt: '2025-09-26T09:00:00Z',
    status: 'Scheduled',
    mediaType: 'image'
  },
  {
    id: '32',
    content: 'Transformation Tuesday: Meet Sarah who lost 30lbs and gained confidence! Your journey starts with one step. 🌟 #TransformationTuesday',
    platforms: ['Instagram', 'TikTok'],
    clientId: 'fitness-studio-1',
    clientName: 'Peak Performance Fitness',
    scheduledAt: '2025-10-01T12:00:00Z',
    status: 'Draft',
    mediaType: 'carousel'
  },
  {
    id: '33',
    content: 'Workout tip Wednesday: Proper form beats heavy weights every time. Quality over quantity always! 🏋️‍♀️ #WorkoutTip #ProperForm',
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    clientId: 'fitness-studio-1',
    clientName: 'Peak Performance Fitness',
    scheduledAt: '2025-10-02T10:30:00Z',
    status: 'Scheduled',
    mediaType: 'video'
  },
  {
    id: '34',
    content: 'Free nutrition workshop this Saturday! Learn meal prep secrets from our certified nutritionist. Register link in bio! 🥗 #Nutrition #Workshop',
    platforms: ['Instagram', 'Facebook'],
    clientId: 'fitness-studio-1',
    clientName: 'Peak Performance Fitness',
    scheduledAt: '2025-09-28T14:00:00Z',
    status: 'Published',
    mediaType: 'image',
    engagement: { likes: 156, comments: 34, shares: 23 }
  }
];

export const GET = createApiHandler(async (request: NextRequest, { logger }) => {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  const managerId = searchParams.get('managerId');
  const status = searchParams.get('status'); // comma separated
  const platform = searchParams.get('platform'); // single or comma separated
  const from = searchParams.get('from'); // ISO date (inclusive)
  const to = searchParams.get('to'); // ISO date (inclusive)
  const aggregate = searchParams.get('aggregate'); // when '1' enable grouping meta

  let posts: ScheduledPostModel[] = await listPosts({ clientId, managerId, status, platform, from, to });

  if (clientId) {
    posts = posts.filter(p => p.clientId === clientId);
  }

  if (managerId === 'current') {
    const managerClientIds = ['tech-corp-1', 'restaurant-1'];
    posts = posts.filter(p => managerClientIds.includes(p.clientId));
  }

  if (status) {
    const allowed = status.split(',').map(s => s.trim().toLowerCase());
    posts = posts.filter(p => allowed.includes(p.status.toLowerCase()));
  }

  if (platform) {
    const platforms = platform.split(',').map(p => p.trim().toLowerCase());
    posts = posts.filter(p => p.platforms.some(pl => platforms.includes(pl.toLowerCase())));
  }

  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate.getTime())) {
      posts = posts.filter(p => new Date(p.scheduledAt) >= fromDate);
    }
  }
  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate.getTime())) {
      posts = posts.filter(p => new Date(p.scheduledAt) <= toDate);
    }
  }

  // Basic sort by scheduledAt asc for deterministic consumption
  posts = posts.slice().sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  if (aggregate === '1') {
    const days = aggregateByDay(posts);
    logger.debug('scheduledPosts.aggregate', { totalDays: days.length, totalPosts: posts.length });
    return NextResponse.json({ aggregate: true, days, totalPosts: posts.length });
  }

  logger.debug('scheduledPosts.list', { count: posts.length });
  return NextResponse.json({ posts });
});

const postCounter = counter('scheduled_posts_created');

export const POST = createApiHandler(async (req: NextRequest, { logger }) => {
  const raw = await req.json();
  if (isFlagEnabled('advanced_validation')) {
    const result = validate(ScheduledPostSchema, raw);
    if (!result.ok) {
      logger.warn('scheduledPosts.validation_failed', { issues: result.issues });
      throw new ValidationError(result.issues);
    }
  } else {
    if (!raw?.content || !Array.isArray(raw?.platforms) || !raw?.scheduledFor) {
      throw new ValidationError([{ path: 'root', message: 'Invalid payload' }]);
    }
  }

  const item = await createPost({
    content: raw.content,
    platforms: raw.platforms,
    clientId: raw.clientId || 'default',
    clientName: raw.clientName || 'Default Client',
    scheduledAt: raw.scheduledFor || raw.scheduledAt,
    status: (raw.status as any) || 'Scheduled',
    mediaType: raw.mediaType || 'text',
    engagement: raw.engagement || undefined,
  });
  postCounter.inc();
  logger.info('scheduledPosts.created', { id: item.id, clientId: item.clientId });
  return NextResponse.json({ item }, { status: 201 });
});
