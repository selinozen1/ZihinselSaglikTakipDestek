export interface Mood {
  id?: string;
  userId: string;
  mood: 'Çok İyi' | 'İyi' | 'Normal' | 'Kötü' | 'Çok Kötü';
  note?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MoodSummary {
  totalEntries: number;
  moodDistribution: {
    'Çok İyi': number;
    'İyi': number;
    'Normal': number;
    'Kötü': number;
    'Çok Kötü': number;
  };
  averageMood: number;
  mostCommonTags: string[];
  lastUpdated: string;
} 