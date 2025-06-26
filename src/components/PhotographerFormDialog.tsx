
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Photographer } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PhotographerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  photographer?: Photographer | null;
}

export function PhotographerFormDialog({
  isOpen,
  onClose,
  photographer,
}: PhotographerFormDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [cameraBody, setCameraBody] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState<"staff" | "stringers" | "staff_oc">("staff");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!photographer;

  // Populate form when editing an existing photographer
  useEffect(() => {
    if (photographer) {
      setName(photographer.name);
      setEmail(photographer.email || "");
      setPhone(photographer.phone || "");
      setLocation(photographer.Location || "");
      setCameraBody(photographer.camera_body || "");
      setSerialNumber(photographer.serial_number || "");
      setStatus(photographer.status);
    } else {
      // Reset form when adding new photographer
      setName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setCameraBody("");
      setSerialNumber("");
      setStatus("staff");
    }
  }, [photographer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing && photographer) {
        // Update existing photographer
        const { error } = await supabase
          .from("photographers")
          .update({
            name,
            email: email || null,
            phone: phone || null,
            Location: location || null,
            camera_body: cameraBody || null,
            serial_number: serialNumber || null,
            status,
          })
          .eq("id", photographer.id);

        if (error) throw error;
        toast.success("Photographer updated successfully");
      } else {
        // Add new photographer
        const { error } = await supabase.from("photographers").insert({
          name,
          email: email || null,
          phone: phone || null,
          Location: location || null,
          camera_body: cameraBody || null,
          serial_number: serialNumber || null,
          status,
        });

        if (error) throw error;
        toast.success("Photographer added successfully");
      }

      onClose();
    } catch (error) {
      console.error("Error saving photographer:", error);
      toast.error(
        isEditing
          ? "Failed to update photographer"
          : "Failed to add photographer"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Photographer" : "Add New Photographer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="photographer-name">Name *</Label>
            <Input
              id="photographer-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photographer-email">Email</Label>
            <Input
              id="photographer-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photographer-phone">Phone</Label>
            <Input
              id="photographer-phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(123) 456-7890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photographer-location">Location</Label>
            <Input
              id="photographer-location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State or Region"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photographer-camera-body">Camera Body</Label>
            <Input
              id="photographer-camera-body"
              name="camera_body"
              value={cameraBody}
              onChange={(e) => setCameraBody(e.target.value)}
              placeholder="Canon EOS R5, Nikon D850, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photographer-serial-number">Serial Number</Label>
            <Input
              id="photographer-serial-number"
              name="serial_number"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Camera serial number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photographer-status">Status</Label>
            <Select
              name="status"
              value={status}
              onValueChange={(value: "staff" | "stringers" | "staff_oc") => setStatus(value)}
            >
              <SelectTrigger id="photographer-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff Photographer</SelectItem>
                <SelectItem value="stringers">Stringer Photographer</SelectItem>
                <SelectItem value="staff_oc">Staff OC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
