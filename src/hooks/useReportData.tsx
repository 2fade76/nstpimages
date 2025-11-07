
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportFilters } from "@/pages/Reports";
import { format } from "date-fns";

export function useReportData(filters: ReportFilters) {
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report-data', filters],
    queryFn: async () => {
      // Fetch photographers with assignments and camera sets
      let photographersQuery = supabase
        .from('photographers')
        .select(`
          id,
          name,
          assignments (
            id,
            title,
            location,
            date,
            status
          ),
          camera_sets (
            id,
            camera_body_model,
            camera_body_serial,
            lens_16_35_serial,
            lens_24_105_serial,
            lens_70_200_serial,
            battery_grip_serial,
            flash_serial,
            adapter_serial,
            camera_year_make,
            status,
            ownership,
            date_received,
            notes
          )
        `);

      // Apply photographer filter
      if (filters.photographerId) {
        photographersQuery = photographersQuery.eq('id', filters.photographerId);
      }

      const { data: photographers, error: photographersError } = await photographersQuery;
      if (photographersError) throw photographersError;

      // Fetch assignments with photographer info (only if includeAssignmentDetails is true and scope includes assignments)
      let assignments = [];
      if (filters.includeAssignmentDetails && (filters.reportScope === 'assignments' || filters.reportScope === 'both')) {
        let assignmentsQuery = supabase
          .from('assignments')
          .select(`
            id,
            title,
            location,
            date,
            status,
            photographers (
              id,
              name
            )
          `);

        // Apply assignment filters
        if (filters.photographerId) {
          assignmentsQuery = assignmentsQuery.eq('photographer_id', filters.photographerId);
        }

        if (filters.assignmentStatuses.length > 0) {
          assignmentsQuery = assignmentsQuery.in('status', filters.assignmentStatuses);
        }

        if (filters.dateRange.from) {
          assignmentsQuery = assignmentsQuery.gte('date', format(filters.dateRange.from, 'yyyy-MM-dd'));
        }

        if (filters.dateRange.to) {
          assignmentsQuery = assignmentsQuery.lte('date', format(filters.dateRange.to, 'yyyy-MM-dd'));
        }

        // Add ordering by date ascending
        assignmentsQuery = assignmentsQuery.order('date', { ascending: true });

        const { data: assignmentsData, error: assignmentsError } = await assignmentsQuery;
        if (assignmentsError) throw assignmentsError;
        assignments = assignmentsData || [];
      }

      // Fetch camera sets with photographer info (only if scope includes cameras)
      let cameraSets = [];
      if (filters.reportScope === 'cameras' || filters.reportScope === 'both') {
        let cameraSetsQuery = supabase
          .from('camera_sets')
          .select(`
            id,
            camera_body_model,
            camera_body_serial,
            lens_16_35_serial,
            lens_24_105_serial,
            lens_70_200_serial,
            battery_grip_serial,
            flash_serial,
            adapter_serial,
            camera_year_make,
            status,
            ownership,
            date_received,
            notes,
            photographers (
              id,
              name
            )
          `);

        // Apply camera set filters
        if (filters.photographerId) {
          cameraSetsQuery = cameraSetsQuery.eq('photographer_id', filters.photographerId);
        }

        if (filters.cameraModels.length > 0) {
          cameraSetsQuery = cameraSetsQuery.in('camera_body_model', filters.cameraModels);
        }

        const { data: cameraSetsData, error: cameraSetsError } = await cameraSetsQuery;
        if (cameraSetsError) throw cameraSetsError;
        cameraSets = cameraSetsData || [];
      }

      // Process the data
      const processedPhotographers = photographers?.map(photographer => {
        const photographerAssignments = photographer.assignments || [];
        return {
          id: photographer.id,
          name: photographer.name,
          assignmentCount: photographerAssignments.length,
          completedAssignments: photographerAssignments.filter(a => a.status === 'complete').length,
          openAssignments: photographerAssignments.filter(a => a.status === 'open').length,
          cancelledAssignments: photographerAssignments.filter(a => a.status === 'cancelled').length,
          cameraSets: photographer.camera_sets || []
        };
      }) || [];

      const processedAssignments = (assignments?.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        location: assignment.location,
        date: assignment.date,
        status: assignment.status,
        photographer_name: assignment.photographers?.name || 'Unknown'
      })) || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const processedCameraSets = cameraSets?.map(cameraSet => ({
        id: cameraSet.id,
        camera_body_model: cameraSet.camera_body_model || 'Unknown',
        camera_body_serial: cameraSet.camera_body_serial || 'N/A',
        lens_16_35_serial: cameraSet.lens_16_35_serial || 'N/A',
        lens_24_105_serial: cameraSet.lens_24_105_serial || 'N/A',
        lens_70_200_serial: cameraSet.lens_70_200_serial || 'N/A',
        battery_grip_serial: cameraSet.battery_grip_serial || 'N/A',
        flash_serial: cameraSet.flash_serial || 'N/A',
        adapter_serial: cameraSet.adapter_serial || 'N/A',
        camera_year_make: cameraSet.camera_year_make || 'N/A',
        lens_16_35_year_make: 'N/A', // Not available in database
        lens_70_200_year_make: 'N/A', // Not available in database
        battery_grip_year_make: 'N/A', // Not available in database
        flash_year_make: 'N/A', // Not available in database
        adapter_year_make: 'N/A', // Not available in database
        photographer_name: cameraSet.photographers?.name || 'Unknown',
        status: cameraSet.status,
        ownership: cameraSet.ownership,
        date_received: cameraSet.date_received || '',
        notes: cameraSet.notes || ''
      })) || [];

      // Calculate summary
      const summary = {
        totalPhotographers: processedPhotographers.length,
        totalAssignments: processedAssignments.length,
        totalCameraSets: processedCameraSets.length,
        loanSets: processedCameraSets.filter(cs => cs.ownership === 'loan').length,
        ownSets: processedCameraSets.filter(cs => cs.ownership === 'own').length,
        completedAssignments: processedAssignments.filter(a => a.status === 'complete').length,
        openAssignments: processedAssignments.filter(a => a.status === 'open').length,
        cancelledAssignments: processedAssignments.filter(a => a.status === 'cancelled').length,
      };

      return {
        photographers: processedPhotographers,
        assignments: processedAssignments,
        cameraSets: processedCameraSets,
        summary
      };
    },
  });

  return {
    reportData,
    isLoading
  };
}
