import { BotConfig, BotChannel } from './botTypes';

export interface PostResult { ok: boolean; id?: string; sandbox?: boolean; error?: string; }

export interface ChannelAdapter {
  channel: BotChannel;
  send(config: BotConfig, message: string, meta?: Record<string, unknown>): Promise<PostResult>;
}

abstract class BaseAdapter implements ChannelAdapter {
  abstract channel: BotChannel;
  async send(config: BotConfig, message: string, meta?: Record<string, unknown>): Promise<PostResult> {
    if (config.sandbox) {
      return { ok: true, sandbox: true, id: `sandbox_${Date.now()}` };
    }
    // Real implementation would call platform API.
    return { ok: true, id: `${this.channel}_${Date.now()}` };
  }
}

export class MetaGraphAdapter extends BaseAdapter { channel: BotChannel = 'facebook'; }
export class InstagramAdapter extends BaseAdapter { channel: BotChannel = 'instagram'; }
export class LinkedInAdapter extends BaseAdapter { channel: BotChannel = 'linkedin'; }
export class TwitterXAdapter extends BaseAdapter { channel: BotChannel = 'x'; }
export class EmailAdapter extends BaseAdapter { channel: BotChannel = 'email'; }

export function buildAdapters(channels: BotChannel[]): ChannelAdapter[] {
  return channels.map(ch => {
    switch (ch) {
      case 'facebook': return new MetaGraphAdapter();
      case 'instagram': return new InstagramAdapter();
      case 'linkedin': return new LinkedInAdapter();
      case 'x': return new TwitterXAdapter();
      case 'email': return new EmailAdapter();
    }
  });
}
