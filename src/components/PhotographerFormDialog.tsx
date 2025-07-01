
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Photographer } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PhotographerPersonalInfoSection } from "./PhotographerPersonalInfoSection";
import { PhotographerEquipmentSection } from "./PhotographerEquipmentSection";
import { PhotographerStatusSection } from "./PhotographerStatusSection";

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
  const [lens1635, setLens1635] = useState("");
  const [lens70200, setLens70200] = useState("");
  const [batteryGrip, setBatteryGrip] = useState("");
  const [flash, setFlash] = useState("");
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
      setLens1635(photographer["Lens 16-35mm"] || "");
      setLens70200(photographer["Lens 70-200mm"] || "");
      setBatteryGrip(photographer["Battery Grip"] || "");
      setFlash(photographer.Flash || "");
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
      setLens1635("");
      setLens70200("");
      setBatteryGrip("");
      setFlash("");
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
            "Lens 16-35mm": lens1635 || null,
            "Lens 70-200mm": lens70200 || null,
            "Battery Grip": batteryGrip || null,
            Flash: flash || null,
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
          "Lens 16-35mm": lens1635 || null,
          "Lens 70-200mm": lens70200 || null,
          "Battery Grip": batteryGrip || null,
          Flash: flash || null,
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
            <PhotographerPersonalInfoSection
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              location={location}
              setLocation={setLocation}
            />

            <PhotographerEquipmentSection
              cameraBody={cameraBody}
              setCameraBody={setCameraBody}
              bodySerialNo={bodySerialNo}
              setBodySerialNo={setBodySerialNo}
              adapter={adapter}
              setAdapter={setAdapter}
              lens1635={lens1635}
              setLens1635={setLens1635}
              lens70200={lens70200}
              setLens70200={setLens70200}
              batteryGrip={batteryGrip}
              setBatteryGrip={setBatteryGrip}
              flash={flash}
              setFlash={setFlash}
            />

            <PhotographerStatusSection
              status={status}
              setStatus={setStatus}
            />
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
