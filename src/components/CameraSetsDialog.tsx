
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CameraSet {
  id: string;
  photographer_id: string;
  camera_body_model: string | null;
  camera_body_serial: string | null;
  lens_16_35_serial: string | null;
  lens_24_105_serial: string | null;
  lens_70_200_serial: string | null;
  battery_grip_serial: string | null;
  flash_serial: string | null;
  adapter_serial: string | null;
  camera_year_make: string | null;
  lens_16_35_year_make: string | null;
  lens_24_105_year_make: string | null;
  lens_70_200_year_make: string | null;
  battery_grip_year_make: string | null;
  flash_year_make: string | null;
  adapter_year_make: string | null;
  date_received: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface CameraSetsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  photographerId: string;
  photographerName: string;
}

export function CameraSetsDialog({
  isOpen,
  onClose,
  photographerId,
  photographerName,
}: CameraSetsDialogProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<CameraSet | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    camera_body_model: "",
    camera_body_serial: "",
    lens_16_35_serial: "",
    lens_24_105_serial: "",
    lens_70_200_serial: "",
    battery_grip_serial: "",
    flash_serial: "",
    adapter_serial: "",
    camera_year_make: "",
    lens_16_35_year_make: "",
    lens_24_105_year_make: "",
    lens_70_200_year_make: "",
    battery_grip_year_make: "",
    flash_year_make: "",
    adapter_year_make: "",
    date_received: "",
    status: "active",
    notes: "",
  });

  const { data: cameraSets, isLoading } = useQuery({
    queryKey: ['camera-sets', photographerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('camera_sets')
        .select('*')
        .eq('photographer_id', photographerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CameraSet[];
    },
    enabled: isOpen && !!photographerId,
  });

  const resetForm = () => {
    setFormData({
      camera_body_model: "",
      camera_body_serial: "",
      lens_16_35_serial: "",
      lens_24_105_serial: "",
      lens_70_200_serial: "",
      battery_grip_serial: "",
      flash_serial: "",
      adapter_serial: "",
      camera_year_make: "",
      lens_16_35_year_make: "",
      lens_24_105_year_make: "",
      lens_70_200_year_make: "",
      battery_grip_year_make: "",
      flash_year_make: "",
      adapter_year_make: "",
      date_received: "",
      status: "active",
      notes: "",
    });
    setEditingSet(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (cameraSet: CameraSet) => {
    setFormData({
      camera_body_model: cameraSet.camera_body_model || "",
      camera_body_serial: cameraSet.camera_body_serial || "",
      lens_16_35_serial: cameraSet.lens_16_35_serial || "",
      lens_24_105_serial: cameraSet.lens_24_105_serial || "",
      lens_70_200_serial: cameraSet.lens_70_200_serial || "",
      battery_grip_serial: cameraSet.battery_grip_serial || "",
      flash_serial: cameraSet.flash_serial || "",
      adapter_serial: cameraSet.adapter_serial || "",
      camera_year_make: cameraSet.camera_year_make || "",
      lens_16_35_year_make: cameraSet.lens_16_35_year_make || "",
      lens_24_105_year_make: cameraSet.lens_24_105_year_make || "",
      lens_70_200_year_make: cameraSet.lens_70_200_year_make || "",
      battery_grip_year_make: cameraSet.battery_grip_year_make || "",
      flash_year_make: cameraSet.flash_year_make || "",
      adapter_year_make: cameraSet.adapter_year_make || "",
      date_received: cameraSet.date_received || "",
      status: cameraSet.status,
      notes: cameraSet.notes || "",
    });
    setEditingSet(cameraSet);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        photographer_id: photographerId,
        // Convert empty strings to null
        camera_body_model: formData.camera_body_model || null,
        camera_body_serial: formData.camera_body_serial || null,
        lens_16_35_serial: formData.lens_16_35_serial || null,
        lens_24_105_serial: formData.lens_24_105_serial || null,
        lens_70_200_serial: formData.lens_70_200_serial || null,
        battery_grip_serial: formData.battery_grip_serial || null,
        flash_serial: formData.flash_serial || null,
        adapter_serial: formData.adapter_serial || null,
        camera_year_make: formData.camera_year_make || null,
        lens_16_35_year_make: formData.lens_16_35_year_make || null,
        lens_24_105_year_make: formData.lens_24_105_year_make || null,
        lens_70_200_year_make: formData.lens_70_200_year_make || null,
        battery_grip_year_make: formData.battery_grip_year_make || null,
        flash_year_make: formData.flash_year_make || null,
        adapter_year_make: formData.adapter_year_make || null,
        date_received: formData.date_received || null,
        notes: formData.notes || null,
      };

      if (editingSet) {
        const { error } = await supabase
          .from('camera_sets')
          .update(dataToSubmit)
          .eq('id', editingSet.id);
        
        if (error) throw error;
        toast.success("Camera set updated successfully");
      } else {
        const { error } = await supabase
          .from('camera_sets')
          .insert([dataToSubmit]);
        
        if (error) throw error;
        toast.success("Camera set added successfully");
      }

      setIsFormOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['camera-sets', photographerId] });
    } catch (error) {
      console.error("Error saving camera set:", error);
      toast.error("Failed to save camera set");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('camera_sets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success("Camera set deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['camera-sets', photographerId] });
    } catch (error) {
      console.error("Error deleting camera set:", error);
      toast.error("Failed to delete camera set");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Camera Sets - {photographerName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Camera Equipment Sets</h3>
              <Button onClick={handleAddNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Camera Set
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : cameraSets?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No camera sets found. Add one to get started.
              </div>
            ) : (
              <div className="grid gap-4">
                {cameraSets?.map((set) => (
                  <Card key={set.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {set.camera_body_model || 'Camera Set'}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={set.status === 'active' ? 'default' : 'secondary'}>
                              {set.status}
                            </Badge>
                            {set.date_received && (
                              <span className="text-sm text-muted-foreground">
                                Received: {new Date(set.date_received).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(set)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(set.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {set.camera_body_serial && (
                          <div>
                            <span className="font-medium">Body Serial:</span> {set.camera_body_serial}
                          </div>
                        )}
                        {set.lens_16_35_serial && (
                          <div>
                            <span className="font-medium">16-35mm Lens:</span> {set.lens_16_35_serial}
                          </div>
                        )}
                        {set.lens_24_105_serial && (
                          <div>
                            <span className="font-medium">24-105mm Lens:</span> {set.lens_24_105_serial}
                          </div>
                        )}
                        {set.lens_70_200_serial && (
                          <div>
                            <span className="font-medium">70-200mm Lens:</span> {set.lens_70_200_serial}
                          </div>
                        )}
                        {set.flash_serial && (
                          <div>
                            <span className="font-medium">Flash:</span> {set.flash_serial}
                          </div>
                        )}
                      </div>
                      {set.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="font-medium text-sm">Notes:</span>
                          <p className="text-sm text-muted-foreground mt-1">{set.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSet ? "Edit Camera Set" : "Add Camera Set"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="camera_body_model">Camera Body Model</Label>
                <Input
                  id="camera_body_model"
                  value={formData.camera_body_model}
                  onChange={(e) => setFormData({ ...formData, camera_body_model: e.target.value })}
                  placeholder="e.g., Canon EOS R5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="camera_body_serial">Camera Body Serial</Label>
                <Input
                  id="camera_body_serial"
                  value={formData.camera_body_serial}
                  onChange={(e) => setFormData({ ...formData, camera_body_serial: e.target.value })}
                  placeholder="Serial number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lens_16_35_serial">16-35mm Lens Serial</Label>
                <Input
                  id="lens_16_35_serial"
                  value={formData.lens_16_35_serial}
                  onChange={(e) => setFormData({ ...formData, lens_16_35_serial: e.target.value })}
                  placeholder="Serial number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lens_24_105_serial">24-105mm Lens Serial</Label>
                <Input
                  id="lens_24_105_serial"
                  value={formData.lens_24_105_serial}
                  onChange={(e) => setFormData({ ...formData, lens_24_105_serial: e.target.value })}
                  placeholder="Serial number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lens_70_200_serial">70-200mm Lens Serial</Label>
                <Input
                  id="lens_70_200_serial"
                  value={formData.lens_70_200_serial}
                  onChange={(e) => setFormData({ ...formData, lens_70_200_serial: e.target.value })}
                  placeholder="Serial number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flash_serial">Flash Serial</Label>
                <Input
                  id="flash_serial"
                  value={formData.flash_serial}
                  onChange={(e) => setFormData({ ...formData, flash_serial: e.target.value })}
                  placeholder="Serial number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adapter_serial">Adapter Serial</Label>
                <Input
                  id="adapter_serial"
                  value={formData.adapter_serial}
                  onChange={(e) => setFormData({ ...formData, adapter_serial: e.target.value })}
                  placeholder="Serial number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_received">Date Received</Label>
                <Input
                  id="date_received"
                  type="date"
                  value={formData.date_received}
                  onChange={(e) => setFormData({ ...formData, date_received: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this camera set..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSet ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
