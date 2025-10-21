import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface CameraEquipmentTableProps {
  cameraSets: Array<{
    id: string;
    camera_body_model: string;
    camera_body_serial: string;
    lens_16_35_serial: string;
    lens_24_105_serial: string;
    lens_70_200_serial: string;
    battery_grip_serial: string;
    flash_serial: string;
    adapter_serial: string;
    camera_year_make: string;
    lens_16_35_year_make: string;
    lens_70_200_year_make: string;
    battery_grip_year_make: string;
    flash_year_make: string;
    adapter_year_make: string;
    photographer_name: string;
    status: string;
    date_received: string;
    notes: string;
  }>;
}

export function CameraEquipmentTable({ cameraSets }: CameraEquipmentTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500';
      case 'open':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'active':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const toggleAllRows = () => {
    if (expandAll) {
      setExpandedRows(new Set());
    } else {
      setExpandedRows(new Set(cameraSets.map(cs => cs.id)));
    }
    setExpandAll(!expandAll);
  };

  return (
    <Card className="equipment-table-section">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Camera Equipment Details</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleAllRows}
            className="no-print"
          >
            {expandAll ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Expand All
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="equipment-table">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Photographer</TableHead>
                <TableHead>Camera Model</TableHead>
                <TableHead>Body Serial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cameraSets.map((cameraSet, index) => (
                <Collapsible
                  key={cameraSet.id}
                  open={expandedRows.has(cameraSet.id)}
                  onOpenChange={() => toggleRow(cameraSet.id)}
                  asChild
                >
                  <>
                    <TableRow 
                      className={`cursor-pointer hover:bg-muted/50 ${
                        index % 2 === 0 ? 'bg-muted/20' : ''
                      }`}
                    >
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            {expandedRows.has(cameraSet.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell className="font-medium">{cameraSet.photographer_name}</TableCell>
                      <TableCell>{cameraSet.camera_body_model}</TableCell>
                      <TableCell className="font-mono text-sm serial-number">
                        {cameraSet.camera_body_serial}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(cameraSet.status)} text-white`}>
                          {cameraSet.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cameraSet.date_received ? format(new Date(cameraSet.date_received), 'PPP') : '-'}
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <TableRow className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                        <TableCell colSpan={6} className="p-0">
                          <div className="p-4 bg-muted/30 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-muted-foreground">Camera Body:</span>
                                <div className="font-mono mt-1">{cameraSet.camera_body_serial}</div>
                                <div className="text-muted-foreground text-xs">{cameraSet.camera_year_make}</div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-muted-foreground">16-35mm Lens:</span>
                                <div className="font-mono mt-1">{cameraSet.lens_16_35_serial || '-'}</div>
                                <div className="text-muted-foreground text-xs">{cameraSet.lens_16_35_year_make || '-'}</div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-muted-foreground">24-105mm Lens:</span>
                                <div className="font-mono mt-1">{cameraSet.lens_24_105_serial || '-'}</div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-muted-foreground">70-200mm Lens:</span>
                                <div className="font-mono mt-1">{cameraSet.lens_70_200_serial || '-'}</div>
                                <div className="text-muted-foreground text-xs">{cameraSet.lens_70_200_year_make || '-'}</div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-muted-foreground">Battery Grip:</span>
                                <div className="font-mono mt-1">{cameraSet.battery_grip_serial || '-'}</div>
                                <div className="text-muted-foreground text-xs">{cameraSet.battery_grip_year_make || '-'}</div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-muted-foreground">Flash:</span>
                                <div className="font-mono mt-1">{cameraSet.flash_serial || '-'}</div>
                                <div className="text-muted-foreground text-xs">{cameraSet.flash_year_make || '-'}</div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-muted-foreground">Adapter:</span>
                                <div className="font-mono mt-1">{cameraSet.adapter_serial || '-'}</div>
                                <div className="text-muted-foreground text-xs">{cameraSet.adapter_year_make || '-'}</div>
                              </div>
                              
                              {cameraSet.notes && (
                                <div className="col-span-full">
                                  <span className="font-medium text-muted-foreground">Notes:</span>
                                  <div className="mt-1">{cameraSet.notes}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
