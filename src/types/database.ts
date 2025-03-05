
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
  date: string; // Now can include time, stored as ISO string
  photographer_id: string;
  status: 'open' | 'progress' | 'cancel' | 'complete';
  created_at: string;
}
