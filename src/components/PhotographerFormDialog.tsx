
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
  const [bodySerialNo, setBodySerialNo] = useState("");
  const [adapter, setAdapter] = useState("");
  const [lens2470, setLens2470] = useState("");
  const [lens70200, setLens70200] = useState("");
  const [lens1675, setLens1675] = useState("");
  const [batteryGrip, setBatteryGrip] = useState("");
  const [flash, setFlash] = useState("");
  const [drones, setDrones] = useState("");
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
      setBodySerialNo(photographer.body_serialno || "");
      setAdapter(photographer.Adapter || "");
      setLens2470(photographer["Lens 24-105mm"] || "");
      setLens70200(photographer["Lens 70-200mm"] || "");
      setLens1675(photographer["Lens 16-75mm"] || "");
      setBatteryGrip(photographer["Battery Grip"] || "");
      setFlash(photographer.Flash || "");
      setDrones(photographer.Drones || "");
      setStatus(photographer.status);
    } else {
      // Reset form when adding new photographer
      setName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setCameraBody("");
      setBodySerialNo("");
      setAdapter("");
      setLens2470("");
      setLens70200("");
      setLens1675("");
      setBatteryGrip("");
      setFlash("");
      setDrones("");
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
            body_serialno: bodySerialNo || null,
            Adapter: adapter || null,
            "Lens 24-105mm": lens2470 || null,
            "Lens 70-200mm": lens70200 || null,
            "Lens 16-75mm": lens1675 || null,
            "Battery Grip": batteryGrip || null,
            Flash: flash || null,
            Drones: drones || null,
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
          body_serialno: bodySerialNo || null,
          Adapter: adapter || null,
          "Lens 24-105mm": lens2470 || null,
          "Lens 70-200mm": lens70200 || null,
          "Lens 16-75mm": lens1675 || null,
          "Battery Grip": batteryGrip || null,
          Flash: flash || null,
          Drones: drones || null,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Photographer" : "Add New Photographer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="photographer-body-serialno">Body Serial Number</Label>
              <Input
                id="photographer-body-serialno"
                name="body_serialno"
                value={bodySerialNo}
                onChange={(e) => setBodySerialNo(e.target.value)}
                placeholder="Camera body serial number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photographer-adapter">Adapter</Label>
              <Input
                id="photographer-adapter"
                name="adapter"
                value={adapter}
                onChange={(e) => setAdapter(e.target.value)}
                placeholder="Lens adapter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photographer-lens-2470">Lens 24-105mm</Label>
              <Input
                id="photographer-lens-2470"
                name="lens_24_105"
                value={lens2470}
                onChange={(e) => setLens2470(e.target.value)}
                placeholder="24-105mm lens details"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photographer-lens-70200">Lens 70-200mm</Label>
              <Input
                id="photographer-lens-70200"
                name="lens_70_200"
                value={lens70200}
                onChange={(e) => setLens70200(e.target.value)}
                placeholder="70-200mm lens details"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photographer-lens-1675">Lens 16-75mm</Label>
              <Input
                id="photographer-lens-1675"
                name="lens_16_75"
                value={lens1675}
                onChange={(e) => setLens1675(e.target.value)}
                placeholder="16-75mm lens details"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photographer-battery-grip">Battery Grip</Label>
              <Input
                id="photographer-battery-grip"
                name="battery_grip"
                value={batteryGrip}
                onChange={(e) => setBatteryGrip(e.target.value)}
                placeholder="Battery grip model"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photographer-flash">Flash</Label>
              <Input
                id="photographer-flash"
                name="flash"
                value={flash}
                onChange={(e) => setFlash(e.target.value)}
                placeholder="Flash unit details"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photographer-drones">Drones</Label>
              <Input
                id="photographer-drones"
                name="drones"
                value={drones}
                onChange={(e) => setDrones(e.target.value)}
                placeholder="Drone equipment"
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
