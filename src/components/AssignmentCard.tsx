
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <div className="p-3 md:p-4 flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              <h3 className={`text-base md:text-lg font-semibold ${statusTextColors[assignment.status]} leading-tight`}>
                {assignment.title}
              </h3>
              <Badge variant="outline" className="text-xs w-fit">
                {assignment.category}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="flex items-center">
                <span
                  className={`h-2.5 w-2.5 md:h-3 md:w-3 rounded-full mr-1.5 md:mr-2 ${
                    statusColors[assignment.status]
                  }`}
                />
                <span className="text-xs md:text-sm whitespace-nowrap">
                  {statusLabels[assignment.status]}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">{assignment.location}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{formatDateTime(assignment.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{formatTime(assignment.time)}</span>
            </div>
            <div 
              className="flex items-center cursor-pointer hover:text-primary transition-colors touch-manipulation"
              onClick={() => onPhotographerClick(assignment.photographers.id)}
            >
              <User className="mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">{assignment.photographers.name}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2 justify-end md:justify-start md:ml-4 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(assignment)}
            className="h-8 w-8 md:h-10 md:w-10 touch-manipulation"
          >
            <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(assignment)}
            className="h-8 w-8 md:h-10 md:w-10 touch-manipulation"
          >
            <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
