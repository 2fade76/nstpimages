
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PhotographerPersonalInfoSectionProps {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  awards: string;
  setAwards: (value: string) => void;
}

export function PhotographerPersonalInfoSection({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  location,
  setLocation,
  awards,
  setAwards,
}: PhotographerPersonalInfoSectionProps) {
  return (
    <>
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
        <Label htmlFor="photographer-awards">Awards & Recognition</Label>
        <Textarea
          id="photographer-awards"
          name="awards"
          value={awards}
          onChange={(e) => setAwards(e.target.value)}
          placeholder="List any awards, certifications, or recognition"
          className="min-h-[100px]"
        />
      </div>
    </>
  );
}
