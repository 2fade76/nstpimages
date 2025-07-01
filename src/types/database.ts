
export interface Photographer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  Location: string | null;
  camera_body: string | null;
  body_serialno: string | null;
  Adapter: string | null;
  "Lens 24-105mm": string | null;
  "Lens 70-200mm": string | null;
  "Lens 16-75mm": string | null;
  "Battery Grip": string | null;
  Flash: string | null;
  Drones: string | null;
  status: 'staff' | 'stringers' | 'staff_oc';
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
