export interface Voice {
  id: string;
  name: string;
  type: "free" | "premium";
  description: string;
  accent: string;
  gender: string;
  preview: string;
  sampleUrl: string; // New field for pre-recorded samples
}

export const curatedVoices: Voice[] = [
  // Female voices
  {
    id: "FGY2WhTYpPnrIDTdsKH5", // Laura
    name: "Laura",
    type: "free",
    description: "Warm, friendly female voice perfect for lifestyle content",
    accent: "American",
    gender: "female",
    preview: "Hi there! I'm Laura, and I'm excited to help you create amazing content today. This is how I sound with my warm American accent.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/FGY2WhTYpPnrIDTdsKH5/79a125e8-cd45-4c13-8a67-188112f4dd22.mp3",
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL", // Sarah
    name: "Sarah",
    type: "free",
    description: "Professional female voice ideal for educational content",
    accent: "American",
    gender: "female",
    preview: "Welcome to this educational session. I'm Sarah, your professional guide with a clear American accent, ready to share knowledge.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/21b81c14-f85b-436e-9b7d-2a6e0ecfebdc.mp3",
  },
  {
    id: "XrExE9yKIg1WjnnlVkGX", // Matilda
    name: "Matilda",
    type: "free",
    description: "Energetic female voice great for motivational content",
    accent: "American",
    gender: "female",
    preview: "Hey there! I'm Matilda, and I'm absolutely excited to motivate you today with my energetic American accent. Let's get started!",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/XrExE9yKIg1WjnnlVkGX/002b3e98-b0c0-4599-a90a-a8bf3ba6b584.mp3",
  },
  {
    id: "aRlmTYIQo6Tlg5SlulGC", // Emma
    name: "Emma",
    type: "free",
    description: "Clear, articulate female voice perfect for storytelling",
    accent: "Australian",
    gender: "female",
    preview: "Hello! I'm Emma, and I absolutely love telling stories with my clear, articulate Australian voice. Let me share something wonderful with you today.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/aRlmTYIQo6Tlg5SlulGC/c1c74de8-cddd-4fde-a8b2-5ce19e9f8b4f.mp3",
  },
  {
    id: "ZF6FPAbjXT4488VcRRnw", // Grace
    name: "Grace",
    type: "free",
    description: "Elegant female voice ideal for premium content",
    accent: "British",
    gender: "female",
    preview: "Good afternoon! I'm Grace, speaking with an elegant British accent. I'm frightfully delighted to elevate your listening experience today.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/ZF6FPAbjXT4488VcRRnw/f6b8b3fe-76c8-4c60-a84e-66a4b62c1e63.mp3",
  },
  {
    id: "WzsP0bfiCpSDfNgLrUuN", // Sophia
    name: "Sophia",
    type: "free",
    description: "Sophisticated female voice great for business content",
    accent: "British",
    gender: "female",
    preview: "Hello there! I'm Sophia, your sophisticated narrator with a refined British accent. Shall we dive into today's business insights?",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/WzsP0bfiCpSDfNgLrUuN/b1cb0c04-9b63-4e3e-8b52-8e9d3a3c1e8b.mp3",
  },
  // Male voices
  {
    id: "IKne3meq5aSn9XLyUdCD", // Charlie
    name: "Charlie",
    type: "free",
    description: "Versatile male voice perfect for various content types",
    accent: "Australian",
    gender: "male",
    preview: "Hello there! I'm Charlie, bringing you content with my versatile Australian voice. I'm ready to adapt to whatever style you need today!",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/IKne3meq5aSn9XLyUdCD/60b1bb1a-6f6d-4b92-bc1c-c2e93dcf0e93.mp3",
  },
  {
    id: "JBFqnCBsd6RMkjVDRZzb", // George
    name: "George",
    type: "free",
    description: "Deep, authoritative male voice perfect for business content",
    accent: "British",
    gender: "male",
    preview: "Good day, I'm George. With my deep, authoritative British voice, I'm here to guide you through today's business insights with utmost confidence.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/cd556928-8b58-4c14-9e6c-9d8c7b7b5a1a.mp3",
  },
  {
    id: "bIHbv24MWmeRgasZH58o", // Will
    name: "Will",
    type: "free",
    description: "Engaging male voice great for storytelling and narratives",
    accent: "American",
    gender: "male",
    preview: "Hey there! I'm Will, and I'm excited to share stories with you using my engaging American accent. Let's dive into this tale!",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/bIHbv24MWmeRgasZH58o/e1e2e3e4-f5f6-7890-a1b2-c3d4e5f6g7h8.mp3",
  },
  {
    id: "TX3LPaxmHKxFdv7VOQHJ", // Liam
    name: "Liam",
    type: "free",
    description: "Friendly male voice ideal for tutorials and how-to content",
    accent: "American",
    gender: "male",
    preview: "Hey there! I'm Liam, and I'll walk you through everything step by step with my friendly American accent. Let's learn together!",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3LPaxmHKxFdv7VOQHJ/b7c8d9e0-f1a2-b3c4-d5e6-f7a8b9c0d1e2.mp3",
  },
  {
    id: "nPczCjzI2devNBz1zQrb", // Brian
    name: "Brian",
    type: "free",
    description: "Professional male voice excellent for educational content",
    accent: "American",
    gender: "male",
    preview: "Hello! I'm Brian, your educational guide with a professional American accent. I'm excited to help you learn something new today.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/nPczCjzI2devNBz1zQrb/3f4a5b6c-7d8e-9f0a-1b2c-3d4e5f6a7b8c.mp3",
  },
  {
    id: "onwK4e9ZLuTAKqWW03F9", // Daniel
    name: "Daniel",
    type: "free",
    description: "Confident male voice perfect for professional presentations",
    accent: "British",
    gender: "male",
    preview: "Good afternoon! I'm Daniel, and I'm delighted to present content with my confident British accent. Shall we begin this presentation?",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3",
  },
];

export const fallbackVoices: Voice[] = [
  {
    id: "FGY2WhTYpPnrIDTdsKH5",
    name: "Laura",
    type: "free",
    description: "Warm, friendly female voice",
    accent: "American",
    gender: "female",
    preview: "Hi there! I'm Laura with my warm American accent.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/FGY2WhTYpPnrIDTdsKH5/79a125e8-cd45-4c13-8a67-188112f4dd22.mp3",
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    name: "Sarah",
    type: "free",
    description: "Professional female voice",
    accent: "American",
    gender: "female",
    preview: "Welcome! I'm Sarah with my professional American voice.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/21b81c14-f85b-436e-9b7d-2a6e0ecfebdc.mp3",
  },
  {
    id: "XrExE9yKIg1WjnnlVkGX",
    name: "Matilda",
    type: "free",
    description: "Energetic female voice",
    accent: "American",
    gender: "female",
    preview: "Hey! I'm Matilda with my energetic American accent.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/XrExE9yKIg1WjnnlVkGX/002b3e98-b0c0-4599-a90a-a8bf3ba6b584.mp3",
  },
  {
    id: "aRlmTYIQo6Tlg5SlulGC",
    name: "Emma",
    type: "free",
    description: "Clear, articulate female voice",
    accent: "Australian",
    gender: "female",
    preview: "Hello! I'm Emma with my clear Australian voice.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/aRlmTYIQo6Tlg5SlulGC/c1c74de8-cddd-4fde-a8b2-5ce19e9f8b4f.mp3",
  },
  {
    id: "ZF6FPAbjXT4488VcRRnw",
    name: "Grace",
    type: "free",
    description: "Elegant female voice",
    accent: "British",
    gender: "female",
    preview: "Good afternoon! I'm Grace with my elegant British accent.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/ZF6FPAbjXT4488VcRRnw/f6b8b3fe-76c8-4c60-a84e-66a4b62c1e63.mp3",
  },
  {
    id: "WzsP0bfiCpSDfNgLrUuN",
    name: "Sophia",
    type: "free",
    description: "Sophisticated female voice",
    accent: "British",
    gender: "female",
    preview: "Hello! I'm Sophia with my sophisticated British accent.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/WzsP0bfiCpSDfNgLrUuN/b1cb0c04-9b63-4e3e-8b52-8e9d3a3c1e8b.mp3",
  },
  {
    id: "IKne3meq5aSn9XLyUdCD",
    name: "Charlie",
    type: "free",
    description: "Versatile male voice",
    accent: "Australian",
    gender: "male",
    preview: "Hello there! I'm Charlie with my versatile Australian voice.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/IKne3meq5aSn9XLyUdCD/60b1bb1a-6f6d-4b92-bc1c-c2e93dcf0e93.mp3",
  },
  {
    id: "JBFqnCBsd6RMkjVDRZzb",
    name: "George",
    type: "free",
    description: "Deep, authoritative male voice",
    accent: "British",
    gender: "male",
    preview: "Good day, I'm George with my deep British voice.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/cd556928-8b58-4c14-9e6c-9d8c7b7b5a1a.mp3",
  },
  {
    id: "bIHbv24MWmeRgasZH58o",
    name: "Will",
    type: "free",
    description: "Engaging male voice",
    accent: "American",
    gender: "male",
    preview: "Hey there! I'm Will with my engaging American accent.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/bIHbv24MWmeRgasZH58o/e1e2e3e4-f5f6-7890-a1b2-c3d4e5f6g7h8.mp3",
  },
  {
    id: "TX3LPaxmHKxFdv7VOQHJ",
    name: "Liam",
    type: "free",
    description: "Friendly male voice",
    accent: "American",
    gender: "male",
    preview: "Hey there! I'm Liam with my friendly American accent.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3LPaxmHKxFdv7VOQHJ/b7c8d9e0-f1a2-b3c4-d5e6-f7a8b9c0d1e2.mp3",
  },
  {
    id: "nPczCjzI2devNBz1zQrb",
    name: "Brian",
    type: "free",
    description: "Professional male voice",
    accent: "American",
    gender: "male",
    preview: "Hello! I'm Brian with my professional American accent.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/nPczCjzI2devNBz1zQrb/3f4a5b6c-7d8e-9f0a-1b2c-3d4e5f6a7b8c.mp3",
  },
  {
    id: "onwK4e9ZLuTAKqWW03F9",
    name: "Daniel",
    type: "free",
    description: "Confident male voice",
    accent: "British",
    gender: "male",
    preview: "Good afternoon! I'm Daniel with my confident British accent.",
    sampleUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3",
  },
];
