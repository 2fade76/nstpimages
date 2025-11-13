

export interface Photographer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  Location: string | null;
  status: 'staff' | 'stringers' | 'staff_oc';
  awards: string | null;
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

export interface CameraSet {
  id: string;
  photographer_id: string;
  camera_body_model: string | null;
  camera_body_serial: string | null;
  lens_16_35_serial: string | null;
  lens_24_105_serial: string | null;
  lens_70_200_serial: string | null;
  battery_grip_serial: string | null;
  flash_serial: string | null;
  adapter_serial: string | null;
  camera_year_make: string | null;
  lens_16_35_year_make: string | null;
  lens_70_200_year_make: string | null;
  battery_grip_year_make: string | null;
  flash_year_make: string | null;
  adapter_year_make: string | null;
  date_received: string | null;
  status: string;
  ownership: 'loan' | 'own';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

