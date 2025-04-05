import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Assignment } from "@/types/database";

interface AssignmentFormProps {
  onAssignmentCreated?: () => void;
}

export const AssignmentForm = ({ onAssignmentCreated }: AssignmentFormProps) => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("12:00");
  const [photographer, setPhotographer] = useState("");
  const [status, setStatus] = useState<Assignment['status']>("open");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: photographers, isLoading } = useQuery({
    queryKey: ['photographers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photographers')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !location || !date || !photographer || !status) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const dateTime = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      dateTime.setHours(hours, minutes);
      
      const formattedDateTime = format(dateTime, "yyyy-MM-dd'T'HH:mm:ss");
      
      console.log("Creating assignment with status:", status);
      console.log("Date and time:", formattedDateTime);
      
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          title,
          location,
          date: formattedDateTime,
          photographer_id: photographer,
          status
        })
        .select();

      if (error) {
        console.error("Error creating assignment:", error);
        toast({
          title: "Error",
          description: `Failed to create assignment: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Assignment Created",
        description: "The photo assignment has been successfully created.",
      });

      setTitle("");
      setLocation("");
      setDate(undefined);
      setTime("12:00");
      setPhotographer("");
      setStatus("open");
    } catch (error) {
      console.error("Exception creating assignment:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <label htmlFor="assignment-title" className="text-sm font-medium">Assignment Title</label>
        <Input
          id="assignment-title"
          name="assignment-title"
          placeholder="Enter assignment title"
          className="w-full"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="assignment-location" className="text-sm font-medium">Location</label>
        <Input
          id="assignment-location"
          name="assignment-location"
          placeholder="Enter location"
          className="w-full"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="assignment-date" className="text-sm font-medium">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="assignment-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label htmlFor="assignment-time" className="text-sm font-medium">Time (24hr)</label>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              id="assignment-time"
              name="assignment-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="assignment-photographer" className="text-sm font-medium">Photographer</label>
        <Select
          value={photographer}
          onValueChange={setPhotographer}
        >
          <SelectTrigger id="assignment-photographer">
            <SelectValue placeholder="Select a photographer" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading" disabled>
                Loading photographers...
              </SelectItem>
            ) : photographers && photographers.length > 0 ? (
              photographers.map((photog) => (
                <SelectItem key={photog.id} value={photog.id}>
                  {photog.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                No active photographers found
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="assignment-status" className="text-sm font-medium">Status</label>
        <Select 
          value={status}
          onValueChange={(value) => {
            console.log("Form status changing to:", value);
            setStatus(value as Assignment['status']);
          }}
        >
          <SelectTrigger id="assignment-status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-status-open" />
                Open
              </span>
            </SelectItem>
            <SelectItem value="complete">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-status-complete" />
                Complete
              </span>
            </SelectItem>
            <SelectItem value="cancelled">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-status-hold" />
                Cancelled
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Assignment"}
      </Button>
    </form>
  );
};
