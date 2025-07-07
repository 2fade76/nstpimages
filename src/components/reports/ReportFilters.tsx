
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportFilters as ReportFiltersType } from "@/pages/Reports";

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: ReportFiltersType) => void;
}

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
  // Fetch photographers for filter options
  const { data: photographers } = useQuery({
    queryKey: ['photographers-for-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photographers')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch unique camera models for filter options
  const { data: cameraModels } = useQuery({
    queryKey: ['camera-models-for-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('camera_sets')
        .select('camera_body_model')
        .not('camera_body_model', 'is', null);
      if (error) throw error;
      
      const uniqueModels = [...new Set(data.map(item => item.camera_body_model).filter(Boolean))];
      return uniqueModels;
    },
  });

  const handlePhotographerChange = (photographerId: string, checked: boolean) => {
    const updatedIds = checked 
      ? [...filters.photographerIds, photographerId]
      : filters.photographerIds.filter(id => id !== photographerId);
    
    onFiltersChange({
      ...filters,
      photographerIds: updatedIds
    });
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const updatedStatuses = checked 
      ? [...filters.assignmentStatuses, status]
      : filters.assignmentStatuses.filter(s => s !== status);
    
    onFiltersChange({
      ...filters,
      assignmentStatuses: updatedStatuses
    });
  };

  const handleCameraModelChange = (model: string, checked: boolean) => {
    const updatedModels = checked 
      ? [...filters.cameraModels, model]
      : filters.cameraModels.filter(m => m !== model);
    
    onFiltersChange({
      ...filters,
      cameraModels: updatedModels
    });
  };

  const handleDateRangeChange = (field: 'from' | 'to', date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: date
      }
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      photographerIds: [],
      assignmentStatuses: [],
      cameraModels: [],
      dateRange: {}
    });
  };

  const assignmentStatuses = ['open', 'complete', 'cancelled'];

  return (
    <div className="space-y-6">
      {/* Photographers Filter */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Photographers</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {photographers?.map((photographer) => (
            <div key={photographer.id} className="flex items-center space-x-2">
              <Checkbox
                id={`photographer-${photographer.id}`}
                checked={filters.photographerIds.includes(photographer.id)}
                onCheckedChange={(checked) => 
                  handlePhotographerChange(photographer.id, checked as boolean)
                }
              />
              <Label 
                htmlFor={`photographer-${photographer.id}`}
                className="text-sm cursor-pointer"
              >
                {photographer.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Assignment Status Filter */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Assignment Status</Label>
        <div className="space-y-2">
          {assignmentStatuses.map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status}`}
                checked={filters.assignmentStatuses.includes(status)}
                onCheckedChange={(checked) => 
                  handleStatusChange(status, checked as boolean)
                }
              />
              <Label 
                htmlFor={`status-${status}`}
                className="text-sm cursor-pointer capitalize"
              >
                {status}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Camera Models Filter */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Camera Models</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {cameraModels?.map((model) => (
            <div key={model} className="flex items-center space-x-2">
              <Checkbox
                id={`model-${model}`}
                checked={filters.cameraModels.includes(model)}
                onCheckedChange={(checked) => 
                  handleCameraModelChange(model, checked as boolean)
                }
              />
              <Label 
                htmlFor={`model-${model}`}
                className="text-sm cursor-pointer"
              >
                {model}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Date Range</Label>
        <div className="space-y-2">
          <div>
            <Label className="text-xs text-muted-foreground">From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.from}
                  onSelect={(date) => handleDateRangeChange('from', date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.to}
                  onSelect={(date) => handleDateRangeChange('to', date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <Button onClick={clearFilters} variant="outline" className="w-full">
        <X className="mr-2 h-4 w-4" />
        Clear All Filters
      </Button>
    </div>
  );
}
