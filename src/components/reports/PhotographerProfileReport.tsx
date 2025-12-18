import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Camera, Award, TrendingUp, FileText } from "lucide-react";
import { format } from "date-fns";

interface PhotographerData {
  id: string;
  name: string;
  awards: string | null;
  assignmentCount: number;
  completedAssignments: number;
  openAssignments: number;
  cancelledAssignments: number;
  cameraSets: Array<{
    id: string;
    camera_body_model: string | null;
    camera_body_serial: string | null;
    lens_16_35_serial: string | null;
    lens_24_105_serial: string | null;
    lens_70_200_serial: string | null;
    battery_grip_serial: string | null;
    flash_serial: string | null;
    adapter_serial: string | null;
    status: string;
  }>;
  rank?: number;
}

interface PhotographerProfileReportProps {
  photographers: PhotographerData[];
  reportYear: number;
}

export function PhotographerProfileReport({ photographers, reportYear }: PhotographerProfileReportProps) {
  const currentDate = format(new Date(), "MMMM dd, yyyy");

  // Sort photographers by completed assignments to calculate rank
  const sortedPhotographers = [...photographers].sort(
    (a, b) => b.completedAssignments - a.completedAssignments
  );
  
  // Create rank map
  const rankMap = new Map<string, number>();
  sortedPhotographers.forEach((p, index) => {
    rankMap.set(p.id, index + 1);
  });

  const getAssetRows = (cameraSets: PhotographerData['cameraSets']) => {
    const rows: { assetType: string; model: string; serial: string }[] = [];
    
    cameraSets.forEach((set) => {
      if (set.camera_body_model || set.camera_body_serial) {
        rows.push({
          assetType: 'Camera Body',
          model: set.camera_body_model || '-',
          serial: set.camera_body_serial || '-'
        });
      }
      if (set.lens_16_35_serial) {
        rows.push({
          assetType: 'Lens',
          model: 'Canon RF 16-35mm',
          serial: set.lens_16_35_serial
        });
      }
      if (set.lens_70_200_serial) {
        rows.push({
          assetType: 'Lens',
          model: 'Canon RF 70-200mm',
          serial: set.lens_70_200_serial
        });
      }
      if (set.lens_24_105_serial) {
        rows.push({
          assetType: 'Lens',
          model: 'Canon RF 24-105mm',
          serial: set.lens_24_105_serial
        });
      }
      if (set.adapter_serial) {
        rows.push({
          assetType: 'Adapter',
          model: 'EF-RF Mount Adapter',
          serial: set.adapter_serial
        });
      }
      if (set.battery_grip_serial) {
        rows.push({
          assetType: 'Battery Grip',
          model: '-',
          serial: set.battery_grip_serial
        });
      }
      if (set.flash_serial) {
        rows.push({
          assetType: 'Flash',
          model: '-',
          serial: set.flash_serial
        });
      }
    });
    
    return rows;
  };

  const parseAwards = (awards: string | null): string[] => {
    if (!awards) return [];
    return awards.split(/[,;\n]/).map(a => a.trim()).filter(a => a.length > 0);
  };

  const generateSummary = (photographer: PhotographerData, rank: number): string => {
    const awardCount = parseAwards(photographer.awards).length;
    const hasAwards = awardCount > 0;
    
    let summary = `The photographer has demonstrated consistent performance throughout ${reportYear}, completing ${photographer.completedAssignments} assignments`;
    
    if (hasAwards) {
      summary += `. The recognition through ${awardCount > 1 ? 'multiple awards' : 'an award'} highlights both technical skill and storytelling excellence.`;
    } else {
      summary += `. Ranked #${rank} among active photographers based on completed assignments.`;
    }
    
    return summary;
  };

  if (photographers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No photographers found matching the selected filters.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {photographers.map((photographer) => {
        const rank = rankMap.get(photographer.id) || 0;
        const assetRows = getAssetRows(photographer.cameraSets);
        const awards = parseAwards(photographer.awards);

        return (
          <Card key={photographer.id} className="print:break-after-page">
            {/* Report Header */}
            <CardHeader className="border-b">
              <div className="flex flex-col gap-2">
                <CardTitle className="text-2xl font-bold text-primary">
                  Photographers Yearly Reports {reportYear}
                </CardTitle>
                <div className="flex flex-col sm:flex-row sm:gap-8 text-sm text-muted-foreground">
                  <span><strong>Agency:</strong> NSTP</span>
                  <span><strong>Date Generated:</strong> {currentDate}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Photographer Info */}
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold">
                  Photographer Name: {photographer.name}
                </h2>
                <p className="text-muted-foreground">
                  <strong>Designation:</strong> Staff Photographer
                </p>
              </div>

              {/* Section 1: Photo Asset */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">1. Photo Asset</h3>
                </div>
                {assetRows.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Asset Type</TableHead>
                          <TableHead className="font-semibold">Model/Description</TableHead>
                          <TableHead className="font-semibold">Serial No</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assetRows.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{row.assetType}</TableCell>
                            <TableCell>{row.model}</TableCell>
                            <TableCell className="font-mono text-sm">{row.serial}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No assets assigned</p>
                )}
              </div>

              {/* Section 2: Performance Summary */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">2. Performance Summary</h3>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Metrics</TableHead>
                        <TableHead className="font-semibold text-right">Total ({reportYear})</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Completed Assignments</TableCell>
                        <TableCell className="text-right font-semibold text-stat-complete">
                          {photographer.completedAssignments}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Photographers Ranking (Completed Assignments)</TableCell>
                        <TableCell className="text-right font-semibold">
                          #{rank}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Open Assignments</TableCell>
                        <TableCell className="text-right font-semibold text-stat-open">
                          {photographer.openAssignments}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Assignments</TableCell>
                        <TableCell className="text-right font-semibold text-stat-total">
                          {photographer.assignmentCount}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Awards Received</TableCell>
                        <TableCell className="text-right font-semibold">
                          {awards.length}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Section 3: Awards and Recognition */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">3. Awards and Recognition</h3>
                </div>
                {awards.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    {awards.map((award, index) => (
                      <li key={index} className="text-foreground">
                        {award}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">No awards recorded</p>
                )}
              </div>

              {/* Section 4: Summary */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">4. Summary</h3>
                </div>
                <p className="text-foreground leading-relaxed">
                  {generateSummary(photographer, rank)}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
