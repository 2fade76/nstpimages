
import { useState } from "react";
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
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export const AssignmentForm = () => {
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Assignment Created",
      description: "The photo assignment has been successfully created.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <label className="text-sm font-medium">Assignment Title</label>
        <Input
          placeholder="Enter assignment title"
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Location</label>
        <Input
          placeholder="Enter location"
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Date and Time</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
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
        <label className="text-sm font-medium">Photographer</label>
        <Input
          placeholder="Enter photographer name"
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-status-open" />
                Open
              </span>
            </SelectItem>
            <SelectItem value="progress">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-status-progress" />
                In Progress
              </span>
            </SelectItem>
            <SelectItem value="hold">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-status-hold" />
                On Hold
              </span>
            </SelectItem>
            <SelectItem value="complete">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-status-complete" />
                Complete
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        Create Assignment
      </Button>
    </form>
  );
};
