
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, Edit, Trash2, Clock } from "lucide-react";
import { Assignment, Photographer } from "@/types/database";
import { format } from "date-fns";

interface AssignmentCardProps {
  assignment: Assignment & { photographers: Pick<Photographer, 'id' | 'name'> };
  onEdit: (assignment: Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) => void;
  onDelete: (assignment: Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) => void;
  onPhotographerClick: (photographerId: string) => void;
}

export const AssignmentCard = ({ assignment, onEdit, onDelete, onPhotographerClick }: AssignmentCardProps) => {
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '12:00 PM';
    
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      
      return format(date, 'h:mm a');
    } catch (error) {
      console.error("Error formatting time:", error);
      return '12:00 PM';
    }
  };

  const statusColors = {
    open: "bg-status-open",
    complete: "bg-status-complete",
    cancelled: "bg-status-hold",
  };

  const statusTextColors = {
    open: "text-status-open",
    complete: "text-status-complete",
    cancelled: "text-status-hold",
  };

  const statusLabels = {
    open: "Open",
    complete: "Complete",
    cancelled: "Cancelled",
  };

  return (
    <Card className="animate-fadeIn">
      <div className="p-4 flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${statusTextColors[assignment.status]}`}>
              {assignment.title}
            </h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <span
                  className={`h-3 w-3 rounded-full mr-2 ${
                    statusColors[assignment.status]
                  }`}
                />
                <span className="text-sm">
                  {statusLabels[assignment.status]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              {assignment.location}
            </div>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {formatDateTime(assignment.date)}
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              {formatTime(assignment.time)}
            </div>
            <div 
              className="flex items-center cursor-pointer hover:text-primary transition-colors"
              onClick={() => onPhotographerClick(assignment.photographers.id)}
            >
              <User className="mr-2 h-4 w-4" />
              {assignment.photographers.name}
            </div>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(assignment)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(assignment)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
