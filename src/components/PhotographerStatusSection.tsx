
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PhotographerStatusSectionProps {
  status: "staff" | "stringers" | "staff_oc";
  setStatus: (value: "staff" | "stringers" | "staff_oc") => void;
}

export function PhotographerStatusSection({
  status,
  setStatus,
}: PhotographerStatusSectionProps) {
  return (
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
  );
}
