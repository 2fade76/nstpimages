
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CameraSet {
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
  lens_24_105_year_make: string | null;
  lens_70_200_year_make: string | null;
  battery_grip_year_make: string | null;
  flash_year_make: string | null;
  adapter_year_make: string | null;
  date_received: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useCameraSets(photographerId: string, isEnabled: boolean) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: cameraSets, isLoading } = useQuery({
    queryKey: ['camera-sets', photographerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('camera_sets')
        .select('*')
        .eq('photographer_id', photographerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CameraSet[];
    },
    enabled: isEnabled && !!photographerId,
  });

  const handleSubmit = async (formData: any, editingSet: CameraSet | null) => {
    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        photographer_id: photographerId,
        // Convert empty strings to null
        camera_body_model: formData.camera_body_model || null,
        camera_body_serial: formData.camera_body_serial || null,
        lens_16_35_serial: formData.lens_16_35_serial || null,
        lens_24_105_serial: formData.lens_24_105_serial || null,
        lens_70_200_serial: formData.lens_70_200_serial || null,
        battery_grip_serial: formData.battery_grip_serial || null,
        flash_serial: formData.flash_serial || null,
        adapter_serial: formData.adapter_serial || null,
        camera_year_make: formData.camera_year_make || null,
        lens_16_35_year_make: formData.lens_16_35_year_make || null,
        lens_24_105_year_make: formData.lens_24_105_year_make || null,
        lens_70_200_year_make: formData.lens_70_200_year_make || null,
        battery_grip_year_make: formData.battery_grip_year_make || null,
        flash_year_make: formData.flash_year_make || null,
        adapter_year_make: formData.adapter_year_make || null,
        date_received: formData.date_received || null,
        notes: formData.notes || null,
      };

      if (editingSet) {
        const { error } = await supabase
          .from('camera_sets')
          .update(dataToSubmit)
          .eq('id', editingSet.id);
        
        if (error) throw error;
        toast.success("Camera set updated successfully");
      } else {
        const { error } = await supabase
          .from('camera_sets')
          .insert([dataToSubmit]);
        
        if (error) throw error;
        toast.success("Camera set added successfully");
      }

      queryClient.invalidateQueries({ queryKey: ['camera-sets', photographerId] });
    } catch (error) {
      console.error("Error saving camera set:", error);
      toast.error("Failed to save camera set");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('camera_sets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success("Camera set deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['camera-sets', photographerId] });
    } catch (error) {
      console.error("Error deleting camera set:", error);
      toast.error("Failed to delete camera set");
    }
  };

  return {
    cameraSets,
    isLoading,
    isSubmitting,
    handleSubmit,
    handleDelete,
  };
}
