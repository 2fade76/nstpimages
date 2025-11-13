import { z } from 'zod';

export const assignmentSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  location: z.string()
    .min(1, "Location is required")
    .max(200, "Location must be less than 200 characters")
    .trim(),
  date: z.date({
    required_error: "Date is required",
    invalid_type_error: "Please select a valid date"
  }),
  time: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  photographer_id: z.string()
    .min(1, "Please select a photographer")
    .uuid("Invalid photographer selection"),
  status: z.enum(['open', 'complete', 'cancelled'], {
    required_error: "Please select a status"
  })
});

export const photographerSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z.string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]*$/, "Invalid phone number format")
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal('')),
  location: z.string()
    .max(200, "Location must be less than 200 characters")
    .optional()
    .or(z.literal('')),
  awards: z.string()
    .max(500, "Awards must be less than 500 characters")
    .optional()
    .or(z.literal('')),
  status: z.enum(['staff', 'stringers', 'staff_oc'], {
    required_error: "Please select a status"
  })
});

export const cameraSetSchema = z.object({
  camera_body_model: z.string().max(100, "Model must be less than 100 characters").optional(),
  camera_body_serial: z.string().max(100, "Serial must be less than 100 characters").optional(),
  lens_16_35_serial: z.string().max(100, "Serial must be less than 100 characters").optional(),
  lens_24_105_serial: z.string().max(100, "Serial must be less than 100 characters").optional(),
  lens_70_200_serial: z.string().max(100, "Serial must be less than 100 characters").optional(),
  battery_grip_serial: z.string().max(100, "Serial must be less than 100 characters").optional(),
  flash_serial: z.string().max(100, "Serial must be less than 100 characters").optional(),
  adapter_serial: z.string().max(100, "Serial must be less than 100 characters").optional(),
  camera_year_make: z.string().max(50, "Year/Make must be less than 50 characters").optional(),
  date_received: z.string().optional(),
  status: z.enum(['active', 'maintenance', 'stored', 'retired'], {
    required_error: "Please select a status"
  }),
  ownership: z.enum(['loan', 'own'], {
    required_error: "Please select ownership type"
  }),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional()
});

export type AssignmentFormData = z.infer<typeof assignmentSchema>;
export type PhotographerFormData = z.infer<typeof photographerSchema>;
export type CameraSetFormData = z.infer<typeof cameraSetSchema>;
