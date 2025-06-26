
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PhotographerCard } from "./PhotographerCard";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Photographer } from "@/types/database";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PhotographerFormDialog } from "./PhotographerFormDialog";

export function PhotographersMenu() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPhotographer, setEditingPhotographer] = useState<Photographer | null>(null);
  const queryClient = useQueryClient();

  const { data: photographers, isLoading } = useQuery({
    queryKey: ['photographers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photographers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Ensure the status property is of the correct type and process other fields
      return data.map(photographer => ({
        ...photographer,
        status: photographer.status === 'staff' || photographer.status === 'stringers' || photographer.status === 'staff_oc'
          ? (photographer.status as 'staff' | 'stringers' | 'staff_oc')
          : 'staff', // Default to 'staff' if status is not recognized
        camera_body: photographer.camera_body || null,
        serial_number: photographer.serial_number || null
      })) as Photographer[];
    },
  });

  const handleAddNew = () => {
    setEditingPhotographer(null);
    setIsFormOpen(true);
  };

  const handleEdit = (photographer: Photographer) => {
    setEditingPhotographer(photographer);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    // Invalidate the query to refresh the photographers list after adding/editing
    queryClient.invalidateQueries({ queryKey: ['photographers'] });
  };

  const handleDelete = async (id: string) => {
    try {
      // Check if photographer is assigned to any assignment
      const { data: assignments, error: fetchError } = await supabase
        .from('assignments')
        .select('id')
        .eq('photographer_id', id);
      
      if (fetchError) throw fetchError;
      
      if (assignments && assignments.length > 0) {
        toast.error("Cannot delete photographer with assigned assignments");
        return;
      }
      
      const { error } = await supabase
        .from('photographers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Photographer deleted successfully");
      // Invalidate the query to refresh the photographers list after deleting
      queryClient.invalidateQueries({ queryKey: ['photographers'] });
    } catch (error) {
      toast.error("Failed to delete photographer");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Photographers</h2>
        <Button onClick={handleAddNew} size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>
      
      <div className="grid gap-4">
        {photographers?.map((photographer) => (
          <PhotographerCard
            key={photographer.id}
            photographer={photographer}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <PhotographerFormDialog 
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        photographer={editingPhotographer}
      />
    </div>
  );
}
