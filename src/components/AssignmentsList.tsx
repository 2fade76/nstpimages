
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, MapPin, User } from "lucide-react";
import { useState } from "react";
import { PhotographerInfoDialog } from "./PhotographerInfoDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Assignment, Photographer } from "@/types/database";

export const AssignmentsList = () => {
  const [selectedPhotographer, setSelectedPhotographer] = useState<string | null>(null);

  const { data: assignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          photographers (
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Assignment & { photographers: Pick<Photographer, 'name'> })[];
    }
  });

  const getPhotographerAssignments = async (photographerName: string) => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('photographers.name', photographerName)
      .select(`
        *,
        photographers!inner (
          name
        )
      `);
    
    if (error) throw error;
    return data?.length || 0;
  };

  const statusColors = {
    open: "bg-status-open",
    progress: "bg-status-progress",
    hold: "bg-status-hold",
    complete: "bg-status-complete",
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments?.map((assignment) => (
          <Card key={assignment.id} className="animate-fadeIn">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                {assignment.title}
              </CardTitle>
              <span
                className={`h-3 w-3 rounded-full ${
                  statusColors[assignment.status]
                }`}
              />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                {assignment.location}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                {assignment.date}
              </div>
              <div 
                className="flex items-center text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                onClick={() => setSelectedPhotographer(assignment.photographers.name)}
              >
                <User className="mr-2 h-4 w-4" />
                {assignment.photographers.name}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPhotographer && (
        <PhotographerInfoDialog
          isOpen={true}
          onClose={() => setSelectedPhotographer(null)}
          photographer={selectedPhotographer}
          assignments={assignments?.filter(a => a.photographers.name === selectedPhotographer).length || 0}
        />
      )}
    </>
  );
};
