
export interface Photographer {
  id: string;
  name: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  location: string;
  date: string;
  photographer_id: string;
  status: 'open' | 'progress' | 'hold' | 'complete';
  created_at: string;
}
