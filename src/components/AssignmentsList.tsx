
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Calendar, MapPin, User, Edit, Trash2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { PhotographerInfoDialog } from "./PhotographerInfoDialog";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Assignment, Photographer } from "@/types/database";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export const AssignmentsList = () => {
  const [selectedPhotographerId, setSelectedPhotographerId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<(Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    location: "",
    date: "",
    photographer_id: "",
    status: "" as Assignment['status'], // Correctly typed
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          photographers (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Assignment & { photographers: Pick<Photographer, 'id' | 'name'> })[];
    },
  });

  const { data: photographers } = useQuery({
    queryKey: ['photographers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photographers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Photographer[];
    },
  });

  // Subscribe to changes in the assignments table
  useEffect(() => {
    const channel = supabase
      .channel('assignments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        () => {
          console.log("Received real-time update, invalidating assignments query");
          queryClient.invalidateQueries({ queryKey: ['assignments'] });
        }
      )
      .subscribe();

    console.log("Subscribed to real-time updates for assignments");

    return () => {
      console.log("Unsubscribing from assignments-changes channel");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Mutation for updating an assignment
  const updateAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: Partial<Assignment>) => {
      console.log("Updating assignment with data:", assignmentData);
      
      // Make sure status is one of the allowed values
      if (assignmentData.status && !['open', 'progress', 'hold', 'complete'].includes(assignmentData.status)) {
        throw new Error(`Invalid status: ${assignmentData.status}`);
      }
      
      const { data, error } = await supabase
        .from('assignments')
        .update(assignmentData)
        .eq('id', currentAssignment?.id)
        .select();
      
      if (error) {
        console.error("Update error from Supabase:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      console.log("Assignment updated successfully, invalidating queries");
      // Force immediate refetch
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.refetchQueries({ queryKey: ['assignments'] });
      
      setIsEditDialogOpen(false);
      toast({
        title: "Assignment updated",
        description: "The assignment has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: `Failed to update assignment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting an assignment
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Assignment deleted",
        description: "The assignment has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete assignment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEditClick = (assignment: Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) => {
    setCurrentAssignment(assignment);
    
    // Format the date for the edit form
    let dateValue = assignment.date;
    if (assignment.date.includes('T')) {
      dateValue = assignment.date.split('T')[0]; // Keep only the date part
    }
    
    setEditForm({
      title: assignment.title,
      location: assignment.location,
      date: dateValue,
      photographer_id: assignment.photographer_id,
      status: assignment.status,
    });
    
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (assignment: Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) => {
    setCurrentAssignment(assignment);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form with data:", editForm);
    
    // Make sure to preserve time part if it exists in the original assignment
    let updatedDate = editForm.date;
    if (currentAssignment?.date.includes('T')) {
      const timePart = currentAssignment.date.split('T')[1];
      updatedDate = `${editForm.date}T${timePart}`;
    }
    
    // Explicitly cast status to ensure type safety
    const updatedAssignment: Partial<Assignment> = {
      title: editForm.title,
      location: editForm.location,
      date: updatedDate,
      photographer_id: editForm.photographer_id,
      status: editForm.status as Assignment['status']
    };
    
    console.log("Sending updated assignment to mutation:", updatedAssignment);
    updateAssignmentMutation.mutate(updatedAssignment);
  };

  const handleDeleteAssignment = () => {
    if (currentAssignment) {
      deleteAssignmentMutation.mutate(currentAssignment.id);
    }
  };

  const statusColors = {
    open: "bg-status-open",
    progress: "bg-status-progress",
    hold: "bg-status-hold",
    complete: "bg-status-complete",
  };

  const statusTextColors = {
    open: "text-status-open",
    progress: "text-status-progress",
    hold: "text-status-hold",
    complete: "text-status-complete",
  };

  const statusLabels = {
    open: "Open",
    progress: "In Progress",
    hold: "On Hold",
    complete: "Complete",
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading assignments...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        {assignments?.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/10">
            No assignments found. Create a new assignment to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {assignments?.map((assignment) => (
              <Card key={assignment.id} className="animate-fadeIn">
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
                        {/* Display formatted date and time if available */}
                        {assignment.date.includes('T') 
                          ? new Date(assignment.date).toLocaleString()
                          : assignment.date
                        }
                      </div>
                      <div 
                        className="flex items-center cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setSelectedPhotographerId(assignment.photographers.id)}
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
                      onClick={() => handleEditClick(assignment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(assignment)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Assignment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Update the assignment information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateAssignment}>
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
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={updateAssignmentMutation.isPending}
              >
                {updateAssignmentMutation.isPending ? "Updating..." : "Update Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this assignment?</p>
            <p className="font-medium mt-2">{currentAssignment?.title}</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAssignment}
              disabled={deleteAssignmentMutation.isPending}
            >
              {deleteAssignmentMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedPhotographerId && (
        <PhotographerInfoDialog
          isOpen={true}
          onClose={() => setSelectedPhotographerId(null)}
          photographerId={selectedPhotographerId}
          assignments={assignments?.filter(a => a.photographers.id === selectedPhotographerId).length || 0}
        />
      )}
    </>
  );
};
