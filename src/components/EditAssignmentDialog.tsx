
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Assignment, Photographer } from "@/types/database";

interface EditAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment & { photographers: Pick<Photographer, 'id' | 'name'> } | null;
  photographers?: Photographer[];
  editForm: {
    title: string;
    location: string;
    date: string;
    time: string;
    photographer_id: string;
    status: Assignment['status'];
    category: Assignment['category'];
  };
  onFormChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const EditAssignmentDialog = ({
  isOpen,
  onClose,
  assignment,
  photographers,
  editForm,
  onFormChange,
  onSubmit,
  isSubmitting
}: EditAssignmentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
          <DialogDescription>
            Update the assignment information below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                name="title"
                value={editForm.title}
                onChange={(e) => onFormChange('title', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                name="location"
                value={editForm.location}
                onChange={(e) => onFormChange('location', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                name="date"
                type="date"
                value={editForm.date}
                onChange={(e) => onFormChange('date', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-time">Time (24hr format)</Label>
              <Input
                id="edit-time"
                name="time"
                type="time"
                value={editForm.time}
                onChange={(e) => onFormChange('time', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-photographer">Photographer</Label>
              <Select
                name="photographer_id"
                value={editForm.photographer_id}
                onValueChange={(value) => onFormChange('photographer_id', value)}
              >
                <SelectTrigger id="edit-photographer">
                  <SelectValue placeholder="Select a photographer" />
                </SelectTrigger>
                <SelectContent>
                  {photographers?.map((photographer) => (
                    <SelectItem key={photographer.id} value={photographer.id}>
                      {photographer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                name="status"
                value={editForm.status}
                onValueChange={(value) => {
                  console.log("Status changed to:", value);
                  onFormChange('status', value);
                }}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select a status" />
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
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                name="category"
                value={editForm.category}
                onValueChange={(value) => onFormChange('category', value)}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="News">News</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
