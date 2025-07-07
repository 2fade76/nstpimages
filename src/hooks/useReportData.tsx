
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
            status,
            date_received
          )
        `);

      // Apply photographer filter
      if (filters.photographerIds.length > 0) {
        photographersQuery = photographersQuery.in('id', filters.photographerIds);
      }

      const { data: photographers, error: photographersError } = await photographersQuery;
      if (photographersError) throw photographersError;

      // Fetch assignments with photographer info
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
      if (filters.photographerIds.length > 0) {
        assignmentsQuery = assignmentsQuery.in('photographer_id', filters.photographerIds);
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

      const { data: assignments, error: assignmentsError } = await assignmentsQuery;
      if (assignmentsError) throw assignmentsError;

      // Fetch camera sets with photographer info
      let cameraSetsQuery = supabase
        .from('camera_sets')
        .select(`
          id,
          camera_body_model,
          camera_body_serial,
          status,
          date_received,
          photographers (
            id,
            name
          )
        `);

      // Apply camera set filters
      if (filters.photographerIds.length > 0) {
        cameraSetsQuery = cameraSetsQuery.in('photographer_id', filters.photographerIds);
      }

      if (filters.cameraModels.length > 0) {
        cameraSetsQuery = cameraSetsQuery.in('camera_body_model', filters.cameraModels);
      }

      const { data: cameraSets, error: cameraSetsError } = await cameraSetsQuery;
      if (cameraSetsError) throw cameraSetsError;

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

      const processedAssignments = assignments?.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        location: assignment.location,
        date: assignment.date,
        status: assignment.status,
        photographer_name: assignment.photographers?.name || 'Unknown'
      })) || [];

      const processedCameraSets = cameraSets?.map(cameraSet => ({
        id: cameraSet.id,
        camera_body_model: cameraSet.camera_body_model || 'Unknown',
        camera_body_serial: cameraSet.camera_body_serial || 'N/A',
        photographer_name: cameraSet.photographers?.name || 'Unknown',
        status: cameraSet.status,
        date_received: cameraSet.date_received || ''
      })) || [];

      // Calculate summary
      const summary = {
        totalPhotographers: processedPhotographers.length,
        totalAssignments: processedAssignments.length,
        totalCameraSets: processedCameraSets.length,
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
