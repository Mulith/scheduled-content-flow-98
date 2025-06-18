
export interface ContentChannel {
  id: string;
  name: string;
  socialAccount: {
    platform: "youtube" | "tiktok";
    accountName: string;
    connected: boolean;
  };
  theme: {
    id: string;
    name: string;
    color: string;
  };
  voice: {
    id: string;
    name: string;
    type: "free" | "premium";
  };
  topic: string;
  schedule: string;
  status: "active" | "paused" | "setup";
  lastGenerated?: string;
  totalVideos: number;
  isActive?: boolean;
  videoStyle?: {
    id: string;
    name: string;
  };
  themes?: string[];
}
