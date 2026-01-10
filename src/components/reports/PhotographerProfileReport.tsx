import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Camera, Award, TrendingUp, FileText, User, Calendar, Building2, Trophy, Target, CheckCircle2, Clock, BarChart3, PieChart, Newspaper, Gamepad2, Clapperboard } from "lucide-react";
import { format } from "date-fns";

interface CategoryBreakdown {
  News: number;
  Sports: number;
  Entertainment: number;
}

interface PhotographerData {
  id: string;
  name: string;
  designation: string;
  awards: string | null;
  ranking: number;
  assignmentCount: number;
  completedAssignments: number;
  humanInterestProjects: number;
  openAssignments: number;
  cancelledAssignments: number;
  narrativeSummary: string;
  categoryBreakdown?: CategoryBreakdown;
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
}

interface PhotographerProfileReportProps {
  photographers: PhotographerData[];
  reportYear: number;
}

export function PhotographerProfileReport({ photographers, reportYear }: PhotographerProfileReportProps) {
  const currentDate = format(new Date(), "MMMM dd, yyyy");

  const getAssetRows = (cameraSets: PhotographerData['cameraSets']) => {
    const rows: { assetType: string; model: string; serial: string; icon: string }[] = [];
    
    cameraSets.forEach((set) => {
      if (set.camera_body_model || set.camera_body_serial) {
        rows.push({
          assetType: 'Camera Body',
          model: set.camera_body_model || '-',
          serial: set.camera_body_serial || '-',
          icon: 'camera'
        });
      }
      if (set.lens_16_35_serial) {
        rows.push({
          assetType: 'Wide Angle Lens',
          model: 'Canon RF 16-35mm',
          serial: set.lens_16_35_serial,
          icon: 'lens'
        });
      }
      if (set.lens_70_200_serial) {
        rows.push({
          assetType: 'Telephoto Lens',
          model: 'Canon RF 70-200mm',
          serial: set.lens_70_200_serial,
          icon: 'lens'
        });
      }
      if (set.lens_24_105_serial) {
        rows.push({
          assetType: 'Standard Lens',
          model: 'Canon RF 24-105mm',
          serial: set.lens_24_105_serial,
          icon: 'lens'
        });
      }
      if (set.adapter_serial) {
        rows.push({
          assetType: 'Mount Adapter',
          model: 'EF-RF Mount Adapter',
          serial: set.adapter_serial,
          icon: 'adapter'
        });
      }
      if (set.battery_grip_serial) {
        rows.push({
          assetType: 'Battery Grip',
          model: 'Canon BG-R10',
          serial: set.battery_grip_serial,
          icon: 'battery'
        });
      }
      if (set.flash_serial) {
        rows.push({
          assetType: 'Speedlite Flash',
          model: 'Canon Speedlite',
          serial: set.flash_serial,
          icon: 'flash'
        });
      }
    });
    
    return rows;
  };

  const parseAwards = (awards: string | null): string[] => {
    if (!awards) return [];
    return awards.split(/[,;\n]/).map(a => a.trim()).filter(a => a.length > 0);
  };

  if (photographers.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No photographers found matching the selected filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {photographers.map((photographer, photographerIndex) => {
        const assetRows = getAssetRows(photographer.cameraSets);
        const awards = parseAwards(photographer.awards);
        const completionRate = photographer.assignmentCount > 0 
          ? Math.round((photographer.completedAssignments / photographer.assignmentCount) * 100) 
          : 0;

        return (
          <Card key={photographer.id} className="print:break-after-page overflow-hidden shadow-lg border-0 bg-card">
            {/* Report Header with Gradient */}
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-medium">
                      Report #{photographerIndex + 1}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {reportYear}
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Photographer Yearly Report
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    <span>NSTP</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{currentDate}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              {/* Photographer Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-secondary/50 to-transparent">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary shrink-0">
                  <User className="h-8 w-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-foreground truncate">
                    {photographer.name}
                  </h2>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Badge variant="secondary" className="font-normal">
                      {photographer.designation}
                    </Badge>
                    {photographer.ranking <= 3 && (
                      <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
                        <Trophy className="h-3 w-3 mr-1" />
                        Top {photographer.ranking}
                      </Badge>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:self-start">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">#{photographer.ranking}</p>
                    <p className="text-xs text-muted-foreground">Rank</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-stat-complete/10 border border-stat-complete/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-stat-complete" />
                    <span className="text-xs font-medium text-muted-foreground">Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-stat-complete">{photographer.completedAssignments}</p>
                </div>
                <div className="p-4 rounded-lg bg-stat-open/10 border border-stat-open/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-stat-open" />
                    <span className="text-xs font-medium text-muted-foreground">Open</span>
                  </div>
                  <p className="text-2xl font-bold text-stat-open">{photographer.openAssignments}</p>
                </div>
                <div className="p-4 rounded-lg bg-stat-total/10 border border-stat-total/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-stat-total" />
                    <span className="text-xs font-medium text-muted-foreground">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-stat-total">{photographer.assignmentCount}</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">Success Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{completionRate}%</p>
                </div>
              </div>

              {/* Category Breakdown Section */}
              {photographer.categoryBreakdown && photographer.completedAssignments > 0 && (
                <>
                  <Separator />
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                        <PieChart className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Assignment Categories</h3>
                        <p className="text-xs text-muted-foreground">Category distribution for completed assignments in {reportYear}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* News Category */}
                      <div className="p-4 rounded-lg border bg-blue-500/5 border-blue-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Newspaper className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">News</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-blue-500">
                              {photographer.completedAssignments > 0 
                                ? Math.round((photographer.categoryBreakdown.News / photographer.completedAssignments) * 100)
                                : 0}%
                            </span>
                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                              {photographer.categoryBreakdown.News} assignments
                            </Badge>
                          </div>
                          <Progress 
                            value={photographer.completedAssignments > 0 
                              ? (photographer.categoryBreakdown.News / photographer.completedAssignments) * 100
                              : 0} 
                            className="h-2 bg-blue-500/20" 
                          />
                        </div>
                      </div>

                      {/* Sports Category */}
                      <div className="p-4 rounded-lg border bg-green-500/5 border-green-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Gamepad2 className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Sports</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-green-500">
                              {photographer.completedAssignments > 0 
                                ? Math.round((photographer.categoryBreakdown.Sports / photographer.completedAssignments) * 100)
                                : 0}%
                            </span>
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                              {photographer.categoryBreakdown.Sports} assignments
                            </Badge>
                          </div>
                          <Progress 
                            value={photographer.completedAssignments > 0 
                              ? (photographer.categoryBreakdown.Sports / photographer.completedAssignments) * 100
                              : 0} 
                            className="h-2 bg-green-500/20" 
                          />
                        </div>
                      </div>

                      {/* Entertainment Category */}
                      <div className="p-4 rounded-lg border bg-purple-500/5 border-purple-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Clapperboard className="h-5 w-5 text-purple-500" />
                          <span className="font-medium">Entertainment</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-purple-500">
                              {photographer.completedAssignments > 0 
                                ? Math.round((photographer.categoryBreakdown.Entertainment / photographer.completedAssignments) * 100)
                                : 0}%
                            </span>
                            <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                              {photographer.categoryBreakdown.Entertainment} assignments
                            </Badge>
                          </div>
                          <Progress 
                            value={photographer.completedAssignments > 0 
                              ? (photographer.categoryBreakdown.Entertainment / photographer.completedAssignments) * 100
                              : 0} 
                            className="h-2 bg-purple-500/20" 
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}

              <Separator />

              {/* Section 1: Photo Asset */}
              <section className="space-y-4 photo-asset-section">
                <div className="flex items-center gap-3 print:mb-2">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary print:bg-gray-100">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold print:text-black">Photo Assets</h3>
                    <p className="text-xs text-muted-foreground print:hidden">Equipment assigned to photographer</p>
                  </div>
                </div>
                {assetRows.length > 0 ? (
                  <div className="rounded-xl border overflow-hidden photo-asset-table print:rounded-none print:border-2 print:border-black">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30 print:bg-gray-200">
                          <TableHead className="font-semibold text-foreground print:text-black print:border print:border-gray-400 print:py-3">Asset Type</TableHead>
                          <TableHead className="font-semibold text-foreground print:text-black print:border print:border-gray-400 print:py-3">Model / Description</TableHead>
                          <TableHead className="font-semibold text-foreground print:text-black print:border print:border-gray-400 print:py-3">Serial No</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assetRows.map((row, index) => (
                          <TableRow key={index} className="hover:bg-muted/20 print:border-b print:border-gray-300">
                            <TableCell className="print:border print:border-gray-300 print:py-3 print:font-medium">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary print:hidden" />
                                <span className="font-medium print:text-black">{row.assetType}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground print:text-black print:border print:border-gray-300 print:py-3">{row.model}</TableCell>
                            <TableCell className="print:border print:border-gray-300 print:py-3">
                              <code className="px-2 py-1 rounded bg-muted text-xs font-mono print:bg-transparent print:px-0 print:text-black print:text-sm">
                                {row.serial}
                              </code>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl border border-dashed bg-muted/20 print:border-2 print:border-gray-400">
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2 print:hidden" />
                    <p className="text-muted-foreground text-sm print:text-black">No assets currently assigned</p>
                  </div>
                )}
              </section>

              <Separator />

              {/* Section 2: Performance Summary */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Performance Summary</h3>
                    <p className="text-xs text-muted-foreground">Yearly performance metrics for {reportYear}</p>
                  </div>
                </div>
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="font-semibold text-foreground">Metric</TableHead>
                        <TableHead className="font-semibold text-foreground text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-muted/20">
                        <TableCell className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-stat-complete" />
                          Completed Assignments
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="font-bold text-stat-complete bg-stat-complete/10">
                            {photographer.completedAssignments}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/20">
                        <TableCell className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          Human Interest Photo Projects
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="font-bold">
                            {photographer.humanInterestProjects}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/20">
                        <TableCell className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          Photographer Ranking
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="font-bold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
                            #{photographer.ranking}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/20">
                        <TableCell className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-stat-open" />
                          Open Assignments
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="font-bold text-stat-open bg-stat-open/10">
                            {photographer.openAssignments}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/20">
                        <TableCell className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-stat-total" />
                          Total Assignments
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="font-bold text-stat-total bg-stat-total/10">
                            {photographer.assignmentCount}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/20">
                        <TableCell className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          Awards Received
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="font-bold">
                            {awards.length}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </section>

              <Separator />

              {/* Section 3: Awards and Recognition */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Awards & Recognition</h3>
                    <p className="text-xs text-muted-foreground">Achievements and honors received</p>
                  </div>
                </div>
                {awards.length > 0 ? (
                  <div className="grid gap-2">
                    {awards.map((award, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-colors"
                      >
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500/20 text-amber-600 shrink-0 mt-0.5">
                          <Trophy className="h-3 w-3" />
                        </div>
                        <span className="text-foreground">{award}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl border border-dashed bg-muted/20">
                    <Award className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-muted-foreground text-sm">No awards recorded for this period</p>
                  </div>
                )}
              </section>

              <Separator />

              {/* Section 4: Summary */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Summary</h3>
                    <p className="text-xs text-muted-foreground">Performance narrative and overview</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/30 to-transparent border">
                  <p className="text-foreground leading-relaxed">
                    {photographer.narrativeSummary}
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
