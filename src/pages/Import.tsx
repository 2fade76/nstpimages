import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WhatsAppAssignmentsImporter } from "@/components/import/WhatsAppAssignmentsImporter";

export default function Import() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quick Import (WhatsApp)</h1>
          <p className="text-muted-foreground mt-1">
            Paste assignment text from WhatsApp to quickly add multiple assignments
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Import Assignments</CardTitle>
            <CardDescription>
              Copy and paste assignment details from WhatsApp. The system will automatically parse photographer names, times, and locations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WhatsAppAssignmentsImporter />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}