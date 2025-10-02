
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
import { Loader2 } from "lucide-react";
import { CameraSet } from "@/types/database";

interface CameraSetFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingSet: CameraSet | null;
  onSubmit: (formData: any, editingSet: CameraSet | null) => Promise<void>;
  isSubmitting: boolean;
}

export function CameraSetForm({ isOpen, onClose, editingSet, onSubmit, isSubmitting }: CameraSetFormProps) {
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
    date_received: "",
    status: "active",
    notes: "",
  });

  useEffect(() => {
    if (editingSet) {
      setFormData({
        camera_body_model: editingSet.camera_body_model || "",
        camera_body_serial: editingSet.camera_body_serial || "",
        lens_16_35_serial: editingSet.lens_16_35_serial || "",
        lens_24_105_serial: editingSet.lens_24_105_serial || "",
        lens_70_200_serial: editingSet.lens_70_200_serial || "",
        battery_grip_serial: editingSet.battery_grip_serial || "",
        flash_serial: editingSet.flash_serial || "",
        adapter_serial: editingSet.adapter_serial || "",
        camera_year_make: editingSet.camera_year_make || "",
        date_received: editingSet.date_received || "",
        status: editingSet.status,
        notes: editingSet.notes || "",
      });
    } else {
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
        date_received: "",
        status: "active",
        notes: "",
      });
    }
  }, [editingSet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data being submitted:', formData);
    await onSubmit(formData, editingSet);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              <Label htmlFor="battery_grip_serial">Battery Grip Serial</Label>
              <Input
                id="battery_grip_serial"
                value={formData.battery_grip_serial}
                onChange={(e) => setFormData({ ...formData, battery_grip_serial: e.target.value })}
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
              <Label htmlFor="camera_year_make">Camera Year/Make</Label>
              <Input
                id="camera_year_make"
                value={formData.camera_year_make}
                onChange={(e) => setFormData({ ...formData, camera_year_make: e.target.value })}
                placeholder="e.g., 2023 Canon"
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

            <div className="space-y-2 col-span-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="stored">Stored</SelectItem>
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
            <Button variant="outline" type="button" onClick={onClose}>
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
  );
}
