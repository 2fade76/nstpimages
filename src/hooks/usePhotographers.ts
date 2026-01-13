
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Photographer, CameraSet } from "@/types/database";
import { toast } from "sonner";

export interface PhotographerWithCameraSets extends Photographer {
  camera_sets: CameraSet[];
}

// Helper function to check if any camera set field matches the search query
const matchesCameraSet = (cameraSets: CameraSet[] | undefined, query: string): boolean => {
  if (!cameraSets || cameraSets.length === 0) return false;
  
  return cameraSets.some(set => 
    set.camera_body_model?.toLowerCase().includes(query) ||
    set.camera_body_serial?.toLowerCase().includes(query) ||
    set.lens_16_35_serial?.toLowerCase().includes(query) ||
    set.lens_24_105_serial?.toLowerCase().includes(query) ||
    set.lens_70_200_serial?.toLowerCase().includes(query) ||
    set.battery_grip_serial?.toLowerCase().includes(query) ||
    set.flash_serial?.toLowerCase().includes(query) ||
    set.adapter_serial?.toLowerCase().includes(query) ||
    set.camera_year_make?.toLowerCase().includes(query)
  );
};

export function usePhotographers() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const {
    data: photographers,
    isLoading
  } = useQuery({
    queryKey: ['photographers'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('photographers').select('*, camera_sets(*)').order('name');
      if (error) throw error;

      // Ensure the status property is of the correct type
      return data.map(photographer => ({
        ...photographer,
        status: photographer.status === 'staff' || photographer.status === 'stringers' || photographer.status === 'staff_oc' ? photographer.status as 'staff' | 'stringers' | 'staff_oc' : 'staff',
        camera_sets: photographer.camera_sets || [],
      })) as PhotographerWithCameraSets[];
    }
  });

  // Filter photographers based on search query (including camera sets/equipment)
  const filteredPhotographers = photographers?.filter(photographer => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Check basic photographer fields
    const matchesBasicFields = (
      photographer.name.toLowerCase().includes(query) ||
      photographer.email?.toLowerCase().includes(query) ||
      photographer.phone?.toLowerCase().includes(query) ||
      photographer.Location?.toLowerCase().includes(query)
    );
    
    // Check camera sets/equipment fields
    const matchesEquipment = matchesCameraSet(photographer.camera_sets, query);
    
    return matchesBasicFields || matchesEquipment;
  });

  const handleDelete = async (id: string) => {
    try {
      // Check if photographer is assigned to any assignment
      const {
        data: assignments,
        error: fetchError
      } = await supabase.from('assignments').select('id').eq('photographer_id', id);
      if (fetchError) throw fetchError;
      if (assignments && assignments.length > 0) {
        toast.error("Cannot delete photographer with assigned assignments");
        return;
      }
      const {
        error
      } = await supabase.from('photographers').delete().eq('id', id);
      if (error) throw error;
      toast.success("Photographer deleted successfully");
      // Invalidate the query to refresh the photographers list after deleting
      queryClient.invalidateQueries({
        queryKey: ['photographers']
      });
    } catch (error) {
      toast.error("Failed to delete photographer");
      console.error(error);
    }
  };

  const refreshPhotographers = () => {
    queryClient.invalidateQueries({
      queryKey: ['photographers']
    });
  };

  return {
    photographers,
    filteredPhotographers,
    isLoading,
    searchQuery,
    setSearchQuery,
    handleDelete,
    refreshPhotographers,
  };
}
