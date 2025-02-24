
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, MapPin, User } from "lucide-react";
import { useState } from "react";
import { PhotographerInfoDialog } from "./PhotographerInfoDialog";

const mockAssignments = [
  {
    id: 1,
    title: "Product Launch Photos",
    location: "Studio A, New York",
    date: "2024-03-15",
    photographer: "John Smith",
    status: "open",
  },
  {
    id: 2,
    title: "Corporate Event Coverage",
    location: "Convention Center",
    date: "2024-03-16",
    photographer: "Emily Johnson",
    status: "progress",
  },
  {
    id: 3,
    title: "Architecture Series",
    location: "Downtown District",
    date: "2024-03-17",
    photographer: "Michael Brown",
    status: "hold",
  },
  {
    id: 4,
    title: "Fashion Editorial",
    location: "Beach Location",
    date: "2024-03-18",
    photographer: "Sarah Wilson",
    status: "complete",
  },
];

const statusColors = {
  open: "bg-status-open",
  progress: "bg-status-progress",
  hold: "bg-status-hold",
  complete: "bg-status-complete",
};

export const AssignmentsList = () => {
  const [selectedPhotographer, setSelectedPhotographer] = useState<string | null>(null);

  const getPhotographerAssignments = (photographerName: string) => {
    return mockAssignments.filter(
      (assignment) => assignment.photographer === photographerName
    ).length;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAssignments.map((assignment) => (
          <Card key={assignment.id} className="animate-fadeIn">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                {assignment.title}
              </CardTitle>
              <span
                className={`h-3 w-3 rounded-full ${
                  statusColors[assignment.status as keyof typeof statusColors]
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
                onClick={() => setSelectedPhotographer(assignment.photographer)}
              >
                <User className="mr-2 h-4 w-4" />
                {assignment.photographer}
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
          assignments={getPhotographerAssignments(selectedPhotographer)}
        />
      )}
    </>
  );
};
