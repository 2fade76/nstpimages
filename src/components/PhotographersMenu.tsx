
import { useQuery } from "@tanstack/react-query";
import { PhotographerCard } from "./PhotographerCard";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Photographer } from "@/types/database";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

export function PhotographersMenu() {
  const [editingPhotographer, setEditingPhotographer] = useState<Photographer | null>(null);

  const { data: photographers, isLoading } = useQuery({
    queryKey: ['photographers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photographers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Ensure the status property is of the correct type
      return data.map(photographer => ({
        ...photographer,
        status: photographer.status === 'active' || photographer.status === 'onleave' 
          ? (photographer.status as 'active' | 'onleave')
          : 'active' // Default to 'active' if status is neither 'active' nor 'onleave'
      })) as Photographer[];
    },
  });

  const handleAddNew = () => {
    // TODO: Implement add new photographer functionality
    toast("Add photographer functionality coming soon!");
  };

  const handleEdit = (photographer: Photographer) => {
    setEditingPhotographer(photographer);
    // TODO: Implement edit photographer functionality
    toast("Edit photographer functionality coming soon!");
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('photographers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Photographer deleted successfully");
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
    </div>
  );
}
