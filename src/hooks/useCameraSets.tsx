
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CameraSet } from "@/types/database";

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
      // Only include fields that exist in the database table
      const dataToSubmit = {
        photographer_id: photographerId,
        camera_body_model: formData.camera_body_model || null,
        camera_body_serial: formData.camera_body_serial || null,
        lens_16_35_serial: formData.lens_16_35_serial || null,
        lens_24_105_serial: formData.lens_24_105_serial || null,
        lens_70_200_serial: formData.lens_70_200_serial || null,
        battery_grip_serial: formData.battery_grip_serial || null,
        flash_serial: formData.flash_serial || null,
        adapter_serial: formData.adapter_serial || null,
        camera_year_make: formData.camera_year_make || null,
        date_received: formData.date_received || null,
        status: formData.status || 'active',
        notes: formData.notes || null,
      };

      console.log('Submitting camera set data:', dataToSubmit);

      if (editingSet) {
        const { error } = await supabase
          .from('camera_sets')
          .update(dataToSubmit)
          .eq('id', editingSet.id);
        
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        toast.success("Camera set updated successfully");
      } else {
        const { error } = await supabase
          .from('camera_sets')
          .insert([dataToSubmit]);
        
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        toast.success("Camera set added successfully");
      }

      queryClient.invalidateQueries({ queryKey: ['camera-sets', photographerId] });
    } catch (error) {
      console.error("Error saving camera set:", error);
      toast.error(`Failed to save camera set: ${error.message || 'Unknown error'}`);
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
