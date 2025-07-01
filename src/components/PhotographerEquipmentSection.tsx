
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PhotographerEquipmentSectionProps {
  cameraBody: string;
  setCameraBody: (value: string) => void;
  bodySerialNo: string;
  setBodySerialNo: (value: string) => void;
  adapter: string;
  setAdapter: (value: string) => void;
  lens1635: string;
  setLens1635: (value: string) => void;
  lens70200: string;
  setLens70200: (value: string) => void;
  batteryGrip: string;
  setBatteryGrip: (value: string) => void;
  flash: string;
  setFlash: (value: string) => void;
}

export function PhotographerEquipmentSection({
  cameraBody,
  setCameraBody,
  bodySerialNo,
  setBodySerialNo,
  adapter,
  setAdapter,
  lens1635,
  setLens1635,
  lens70200,
  setLens70200,
  batteryGrip,
  setBatteryGrip,
  flash,
  setFlash,
}: PhotographerEquipmentSectionProps) {
  return (
    <>
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
        <Label htmlFor="photographer-lens-1635">Lens 16-35mm</Label>
        <Input
          id="photographer-lens-1635"
          name="lens_16_35"
          value={lens1635}
          onChange={(e) => setLens1635(e.target.value)}
          placeholder="16-35mm lens details"
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
    </>
  );
}
