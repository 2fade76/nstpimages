import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Calendar, MapPin, User, Edit, Trash2, Search, Clock, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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
import { format, parseISO } from "date-fns";

interface AssignmentsListProps {
  onStatusUpdate?: () => void;
}

type SortField = 'date' | 'status' | 'title';
type SortDirection = 'asc' | 'desc';

export const AssignmentsList = ({ onStatusUpdate }: AssignmentsListProps) => {
  const [selectedPhotographerId, setSelectedPhotographerId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<(Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editForm, setEditForm] = useState({
    title: "",
    location: "",
    date: "",
    time: "",
    photographer_id: "",
    status: "" as Assignment['status'],
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: assignments, isLoading, refetch } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      console.log("Fetching assignments data");
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
      
      if (error) {
        console.error("Error fetching assignments:", error);
        throw error;
      }
      console.log("Assignments data fetched:", data?.length || 0, "records");
      
      return data as (Assignment & { photographers: Pick<Photographer, 'id' | 'name'> })[];
    },
  });

  const sortedAssignments = useMemo(() => {
    if (!assignments) return [];
    
    console.log(`Sorting assignments by ${sortField} in ${sortDirection} order`);
    
    return [...assignments].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        comparison = dateA - dateB;
      } 
      else if (sortField === 'status') {
        const statusOrder = { 'open': 0, 'progress': 1, 'complete': 2, 'cancel': 3 };
        comparison = (statusOrder[a.status as keyof typeof statusOrder] || 0) - 
                    (statusOrder[b.status as keyof typeof statusOrder] || 0);
      }
      else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [assignments, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    
    console.log(`Sorting changed to ${field} in ${sortDirection === 'asc' ? 'desc' : 'asc'} order`);
  };

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

  useEffect(() => {
    console.log("Setting up real-time subscription in AssignmentsList");
    const channel = supabase
      .channel('assignments-list-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        (payload) => {
          console.log("Received real-time update in AssignmentsList:", payload);
          console.log("Invalidating and refetching assignments query");
          
          queryClient.invalidateQueries({ queryKey: ['assignments'] });
          queryClient.refetchQueries({ queryKey: ['assignments'] });
          
          refetch();
        }
      )
      .subscribe();

    console.log("Subscribed to real-time updates for assignments");

    return () => {
      console.log("Unsubscribing from assignments-list-changes channel");
      supabase.removeChannel(channel);
    };
  }, [queryClient, refetch]);

  const updateAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: Partial<Assignment>) => {
      console.log("Updating assignment with data:", assignmentData);
      
      if (assignmentData.status && !['open', 'progress', 'cancel', 'complete'].includes(assignmentData.status)) {
        throw new Error(`Invalid status: ${assignmentData.status}`);
      }
      
      if (!currentAssignment?.id) {
        throw new Error("No valid assignment ID for update");
      }
      
      console.log(`Updating assignment ID: ${currentAssignment.id} with status: ${assignmentData.status}`);
      
      const { data, error } = await supabase
        .from('assignments')
        .update(assignmentData)
        .eq('id', currentAssignment.id)
        .select();
      
      if (error) {
        console.error("Update error from Supabase:", error);
        throw error;
      }
      
      console.log("Assignment updated successfully in database:", data);
      
      return data;
    },
    onSuccess: (data) => {
      console.log("Assignment updated successfully, invalidating queries");
      console.log("Updated data returned from server:", data);
      
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.refetchQueries({ 
        queryKey: ['assignments'],
        type: 'active',
        exact: false
      });
      
      queryClient.invalidateQueries({ queryKey: ['assignments-last-7-days'] });
      queryClient.invalidateQueries({ queryKey: ['completed-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['photographer-completed-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['total-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['open-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['completed-assignments-by-date'] });
      
      if (onStatusUpdate) {
        console.log("Calling onStatusUpdate callback");
        onStatusUpdate();
      }
      
      setIsEditDialogOpen(false);
      toast({
        title: "Assignment updated",
        description: "The assignment has been updated successfully.",
        duration: 5000,
      });
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: `Failed to update assignment: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting assignment with ID:", id);
      const { data, error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Delete error from Supabase:", error);
        throw error;
      }
      
      console.log("Delete response:", data);
      return id;
    },
    onSuccess: (id) => {
      console.log("Assignment deleted successfully, ID:", id);
      console.log("Invalidating and refetching queries");
      
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.refetchQueries({ queryKey: ['assignments'] });
      
      queryClient.invalidateQueries({ queryKey: ['assignments-last-7-days'] });
      queryClient.invalidateQueries({ queryKey: ['completed-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['photographer-completed-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['total-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['open-assignments'] });
      
      setIsDeleteDialogOpen(false);
      toast({
        title: "Assignment deleted",
        description: "The assignment has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: `Failed to delete assignment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEditClick = (assignment: Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) => {
    setCurrentAssignment(assignment);
    
    let dateValue = assignment.date;
    let timeValue = "12:00";
    
    if (assignment.date.includes('T')) {
      const [datePart, timePart] = assignment.date.split('T');
      dateValue = datePart;
      if (timePart) {
        timeValue = timePart.substring(0, 5);
      }
    }
    
    setEditForm({
      title: assignment.title,
      location: assignment.location,
      date: dateValue,
      time: timeValue,
      photographer_id: assignment.photographer_id,
      status: assignment.status,
    });
    
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (assignment: Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) => {
    console.log("Opening delete dialog for assignment:", assignment.id);
    setCurrentAssignment(assignment);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form with data:", editForm);
    
    const combinedDate = `${editForm.date}T${editForm.time}:00`;
    console.log("Combined date and time:", combinedDate);
    
    const updatedAssignment: Partial<Assignment> = {
      title: editForm.title,
      location: editForm.location,
      date: combinedDate,
      photographer_id: editForm.photographer_id,
      status: editForm.status as Assignment['status']
    };
    
    console.log("Sending updated assignment to mutation:", updatedAssignment);
    updateAssignmentMutation.mutate(updatedAssignment);
  };

  const handleDeleteAssignment = () => {
    if (currentAssignment) {
      console.log("Confirming delete for assignment ID:", currentAssignment.id);
      deleteAssignmentMutation.mutate(currentAssignment.id);
    } else {
      console.error("No assignment selected for deletion");
      toast({
        title: "Error",
        description: "No assignment selected for deletion.",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      if (dateString.includes('T')) {
        const date = parseISO(dateString);
        return format(date, 'MMM d, yyyy');
      } else {
        return dateString;
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString || !dateString.includes('T')) return '';
    
    try {
      const date = parseISO(dateString);
      return format(date, 'h:mm a');
    } catch (error) {
      console.error("Error formatting time:", error);
      return '';
    }
  };

  const statusColors = {
    open: "bg-status-open",
    progress: "bg-status-progress",
    cancel: "bg-status-hold",
    complete: "bg-status-complete",
  };

  const statusTextColors = {
    open: "text-status-open",
    progress: "text-status-progress",
    cancel: "text-status-hold",
    complete: "text-status-complete",
  };

  const statusLabels = {
    open: "Open",
    progress: "In Progress",
    cancel: "Cancelled",
    complete: "Complete",
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading assignments...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            {sortedAssignments.length} total assignments
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('title')}
              className="flex items-center gap-1"
            >
              Title
              {sortField === 'title' && (
                sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
              )}
              {sortField !== 'title' && <ArrowUpDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('status')}
              className="flex items-center gap-1"
            >
              Status
              {sortField === 'status' && (
                sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
              )}
              {sortField !== 'status' && <ArrowUpDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('date')}
              className="flex items-center gap-1"
            >
              Date
              {sortField === 'date' && (
                sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
              )}
              {sortField !== 'date' && <ArrowUpDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {sortedAssignments?.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/10">
            No assignments found. Create a new assignment to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {sortedAssignments?.map((assignment) => (
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
                        {formatDateTime(assignment.date)}
                      </div>
                      {assignment.date.includes('T') && (
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {formatTime(assignment.date)}
                        </div>
                      )}
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
                    <SelectItem value="progress">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-status-progress" />
                        In Progress
                      </span>
                    </SelectItem>
                    <SelectItem value="cancel">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-status-hold" />
                        Cancelled
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
          assignments={sortedAssignments?.filter(a => a.photographers.id === selectedPhotographerId).length || 0}
        />
      )}
    </>
  );
};
