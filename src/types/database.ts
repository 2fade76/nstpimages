
export interface Photographer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  equipment: string | null;
  status: 'active' | 'onleave';
  created_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  location: string;
  date: string; // Date only, YYYY-MM-DD
  time: string; // Separate time field, HH:MM:SS
  photographer_id: string;
  status: 'open' | 'complete' | 'cancelled';
  created_at: string;
}
