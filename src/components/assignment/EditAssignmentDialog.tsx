
import React from "react";
import { Assignment, Photographer } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface EditAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentAssignment: (Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) | null;
  editForm: {
    title: string;
    location: string;
    date: string;
    time: string;
    photographer_id: string;
    status: Assignment['status'];
  };
  setEditForm: React.Dispatch<React.SetStateAction<{
    title: string;
    location: string;
    date: string;
    time: string;
    photographer_id: string;
    status: Assignment['status'];
  }>>;
  photographers: Photographer[] | undefined;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export const EditAssignmentDialog = ({
  isOpen,
  onOpenChange,
  currentAssignment,
  editForm,
  setEditForm,
  photographers,
  onSubmit,
  isPending,
}: EditAssignmentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time (24hr format)</Label>
              <Input
                id="time"
                type="time"
                value={editForm.time}
                onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="photographer">Photographer</Label>
              <Select
                value={editForm.photographer_id}
                onValueChange={(value) => setEditForm({ ...editForm, photographer_id: value })}
              >
                <SelectTrigger>
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => {
                  console.log("Status changed to:", value);
                  setEditForm({ ...editForm, status: value as Assignment['status'] });
                }}
              >
                <SelectTrigger>
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
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isPending}
            >
              {isPending ? "Updating..." : "Update Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
