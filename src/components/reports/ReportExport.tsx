import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, Printer } from "lucide-react";
import { ReportFilters } from "@/pages/Reports";
import { format } from "date-fns";

interface ReportData {
  photographers: Array<{
    id: string;
    name: string;
    assignmentCount: number;
    completedAssignments: number;
    openAssignments: number;
    cancelledAssignments: number;
    cameraSets: Array<{
      id: string;
      camera_body_model: string;
      status: string;
    }>;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    location: string;
    date: string;
    status: string;
    photographer_name: string;
  }>;
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
  summary: {
    totalPhotographers: number;
    totalAssignments: number;
    totalCameraSets: number;
    completedAssignments: number;
    openAssignments: number;
    cancelledAssignments: number;
  };
}

interface ReportExportProps {
  reportData: ReportData | undefined;
  filters: ReportFilters;
}

export function ReportExport({ reportData, filters }: ReportExportProps) {
  const generatePDF = async () => {
    if (!reportData) return;

    // Create a new window for the PDF content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = generatePrintableHTML(reportData, filters);
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const generatePrintableHTML = (data: ReportData, filters: ReportFilters) => {
    const currentDate = format(new Date(), 'PPP');
    const filterSummary = generateFilterSummary(filters);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>NSTP Photo Unit - Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              border: 1px solid #ddd;
              padding: 15px;
              text-align: center;
              border-radius: 5px;
            }
            .summary-card h3 {
              margin: 0 0 10px 0;
              font-size: 14px;
              color: #666;
            }
            .summary-card .value {
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              font-size: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 6px;
              text-align: left;
              word-wrap: break-word;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin: 30px 0 15px 0;
              color: #333;
            }
            .filters {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .status-badge {
              padding: 4px 8px;
              border-radius: 3px;
              color: white;
              font-size: 10px;
            }
            .status-complete { background-color: #22c55e; }
            .status-open { background-color: #3b82f6; }
            .status-cancelled { background-color: #ef4444; }
            .status-active { background-color: #22c55e; }
            .equipment-table th {
              font-size: 9px;
              padding: 4px;
            }
            .equipment-table td {
              font-size: 9px;
              padding: 4px;
            }
            .serial-number {
              font-family: monospace;
              font-size: 8px;
            }
            @media print {
              body { margin: 0; font-size: 10px; }
              .no-print { display: none; }
              table { font-size: 8px; }
              .equipment-table th, .equipment-table td { 
                font-size: 7px; 
                padding: 2px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">NSTP PHOTO UNIT</div>
            <h1>Photography Assignment Report</h1>
            <p>Generated on ${currentDate}</p>
          </div>

          ${filterSummary ? `
            <div class="filters">
              <h3>Applied Filters:</h3>
              ${filterSummary}
            </div>
          ` : ''}

          <div class="summary-grid">
            <div class="summary-card">
              <h3>Total Photographers</h3>
              <div class="value">${data.summary.totalPhotographers}</div>
            </div>
            <div class="summary-card">
              <h3>Total Assignments</h3>
              <div class="value">${data.summary.totalAssignments}</div>
            </div>
            <div class="summary-card">
              <h3>Completed</h3>
              <div class="value" style="color: #22c55e;">${data.summary.completedAssignments}</div>
            </div>
            <div class="summary-card">
              <h3>Camera Sets</h3>
              <div class="value">${data.summary.totalCameraSets}</div>
            </div>
          </div>

          <div class="section-title">Photographer Summary</div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Total Assignments</th>
                <th>Completed</th>
                <th>Open</th>
                <th>Cancelled</th>
                <th>Camera Sets</th>
              </tr>
            </thead>
            <tbody>
              ${data.photographers.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.assignmentCount}</td>
                  <td>${p.completedAssignments}</td>
                  <td>${p.openAssignments}</td>
                  <td>${p.cancelledAssignments}</td>
                  <td>${p.cameraSets.length}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${filters.includeAssignmentDetails ? `
            <div class="section-title">Assignment Details</div>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Photographer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.assignments.map(a => `
                  <tr>
                    <td>${a.title}</td>
                    <td>${a.location}</td>
                    <td>${format(new Date(a.date), 'PPP')}</td>
                    <td>${a.photographer_name}</td>
                    <td><span class="status-badge status-${a.status}">${a.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          <div class="section-title">Camera Model Statistics</div>
          ${generateCameraModelStats(data.cameraSets)}

          <div class="section-title">Camera Equipment Details</div>
          <table class="equipment-table">
            <thead>
              <tr>
                <th>Photographer</th>
                <th>Camera Body</th>
                <th>Body S/N</th>
                <th>Body Year</th>
                <th>16-35mm S/N</th>
                <th>16-35 Year</th>
                <th>24-105mm S/N</th>
                <th>70-200mm S/N</th>
                <th>70-200 Year</th>
                <th>Battery Grip S/N</th>
                <th>BG Year</th>
                <th>Flash S/N</th>
                <th>Flash Year</th>
                <th>Adapter S/N</th>
                <th>Adapter Year</th>
                <th>Status</th>
                <th>Date Received</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${data.cameraSets.map(c => `
                <tr>
                  <td>${c.photographer_name}</td>
                  <td>${c.camera_body_model}</td>
                  <td class="serial-number">${c.camera_body_serial}</td>
                  <td>${c.camera_year_make}</td>
                  <td class="serial-number">${c.lens_16_35_serial}</td>
                  <td>${c.lens_16_35_year_make}</td>
                  <td class="serial-number">${c.lens_24_105_serial}</td>
                  <td class="serial-number">${c.lens_70_200_serial}</td>
                  <td>${c.lens_70_200_year_make}</td>
                  <td class="serial-number">${c.battery_grip_serial}</td>
                  <td>${c.battery_grip_year_make}</td>
                  <td class="serial-number">${c.flash_serial}</td>
                  <td>${c.flash_year_make}</td>
                  <td class="serial-number">${c.adapter_serial}</td>
                  <td>${c.adapter_year_make}</td>
                  <td><span class="status-badge status-${c.status}">${c.status}</span></td>
                  <td>${c.date_received ? format(new Date(c.date_received), 'PPP') : '-'}</td>
                  <td>${c.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
  };

  const generateCameraModelStats = (cameraSets: ReportData['cameraSets']) => {
    // Calculate stats by camera model
    const modelStats = cameraSets.reduce((acc, cameraSet) => {
      const model = cameraSet.camera_body_model || 'Unknown';
      if (!acc[model]) {
        acc[model] = {
          total: 0,
          active: 0,
          inactive: 0,
        };
      }
      acc[model].total++;
      if (cameraSet.status === 'active') {
        acc[model].active++;
      } else {
        acc[model].inactive++;
      }
      return acc;
    }, {} as Record<string, { total: number; active: number; inactive: number }>);

    const sortedModels = Object.entries(modelStats).sort(([, a], [, b]) => b.total - a.total);

    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
        ${sortedModels.map(([model, stats]) => `
          <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
            <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold;">${model}</h4>
            <div style="font-size: 10px;">
              <div>Total: <strong>${stats.total}</strong></div>
              <div>Active: <strong style="color: #22c55e;">${stats.active}</strong></div>
              <div>Inactive: <strong style="color: #ef4444;">${stats.inactive}</strong></div>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center; margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
        <div>
          <div style="font-size: 18px; font-weight: bold;">${cameraSets.length}</div>
          <div style="font-size: 10px; color: #666;">Total Camera Sets</div>
        </div>
        <div>
          <div style="font-size: 18px; font-weight: bold;">${Object.keys(modelStats).length}</div>
          <div style="font-size: 10px; color: #666;">Unique Models</div>
        </div>
        <div>
          <div style="font-size: 18px; font-weight: bold; color: #22c55e;">${cameraSets.filter(cs => cs.status === 'active').length}</div>
          <div style="font-size: 10px; color: #666;">Active Sets</div>
        </div>
        <div>
          <div style="font-size: 18px; font-weight: bold; color: #ef4444;">${cameraSets.filter(cs => cs.status !== 'active').length}</div>
          <div style="font-size: 10px; color: #666;">Inactive Sets</div>
        </div>
      </div>
    `;
  };

  const generateFilterSummary = (filters: ReportFilters) => {
    const parts = [];
    
    if (filters.photographerId) {
      parts.push(`Photographer: ${filters.photographerId}`);
    }
    
    if (filters.assignmentStatuses.length > 0) {
      parts.push(`Status: ${filters.assignmentStatuses.join(', ')}`);
    }
    
    if (filters.cameraModels.length > 0) {
      parts.push(`Camera Models: ${filters.cameraModels.join(', ')}`);
    }
    
    if (filters.dateRange.from && filters.dateRange.to) {
      parts.push(`Date Range: ${format(filters.dateRange.from, 'PPP')} - ${format(filters.dateRange.to, 'PPP')}`);
    } else if (filters.dateRange.from) {
      parts.push(`Date From: ${format(filters.dateRange.from, 'PPP')}`);
    } else if (filters.dateRange.to) {
      parts.push(`Date To: ${format(filters.dateRange.to, 'PPP')}`);
    }
    
    return parts.length > 0 ? parts.join('<br>') : '';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={generatePDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
