
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
    photographer_name: string;
    status: string;
    date_received: string;
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
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
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
              font-size: 12px;
            }
            .status-complete { background-color: #22c55e; }
            .status-open { background-color: #3b82f6; }
            .status-cancelled { background-color: #ef4444; }
            .status-active { background-color: #22c55e; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
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

          <div class="section-title">Camera Equipment Details</div>
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Serial Number</th>
                <th>Photographer</th>
                <th>Status</th>
                <th>Date Received</th>
              </tr>
            </thead>
            <tbody>
              ${data.cameraSets.map(c => `
                <tr>
                  <td>${c.camera_body_model}</td>
                  <td>${c.camera_body_serial || '-'}</td>
                  <td>${c.photographer_name}</td>
                  <td><span class="status-badge status-${c.status}">${c.status}</span></td>
                  <td>${c.date_received ? format(new Date(c.date_received), 'PPP') : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
  };

  const generateFilterSummary = (filters: ReportFilters) => {
    const parts = [];
    
    if (filters.photographerIds.length > 0) {
      parts.push(`Photographers: ${filters.photographerIds.length} selected`);
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
