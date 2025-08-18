import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ClipboardPaste, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { usePhotographers } from "@/hooks/usePhotographers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ParsedAssignment {
  id: string;
  photographer_name: string;
  photographer_id: string | null;
  time: string;
  title: string;
  location: string;
  isValid: boolean;
}

export function WhatsAppAssignmentsImporter() {
  const [date, setDate] = useState<Date>(new Date());
  const [rawText, setRawText] = useState("");
  const [parsedAssignments, setParsedAssignments] = useState<ParsedAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { photographers } = usePhotographers();

  const parseTime = (timeStr: string): string => {
    // Remove extra spaces and normalize
    const normalized = timeStr.toLowerCase().replace(/\s+/g, '');
    
    // Match various time formats
    const patterns = [
      /^(\d{1,2})(?::(\d{2}))?(?:\.(\d{2}))?(?:am|a\.m\.)$/,  // 9am, 9:30am, 9.30am
      /^(\d{1,2})(?::(\d{2}))?(?:\.(\d{2}))?(?:pm|p\.m\.)$/,  // 9pm, 9:30pm, 9.30pm
      /^(\d{1,2})(?::(\d{2}))?$/,                              // 9, 9:30, 14:30
      /^(\d{2})(\d{2})$/                                       // 0900, 1430
    ];

    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2] || match[3] || '0');
        
        // Handle AM/PM
        if (timeStr.toLowerCase().includes('pm') && hours !== 12) {
          hours += 12;
        } else if (timeStr.toLowerCase().includes('am') && hours === 12) {
          hours = 0;
        }
        
        // Handle 4-digit format (0900 = 09:00)
        if (match[0].length === 4 && !match[2] && !match[3]) {
          hours = parseInt(match[1].substring(0, 2));
          const mins = parseInt(match[1].substring(2, 4));
          return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      }
    }
    
    return "12:00:00"; // Default fallback
  };

  const extractLocation = (text: string): string => {
    // Malay pattern: "di [location]"
    const malayPattern = /di\s+([^-.,]+?)(?:\s*[-.,]|$)/i;
    const malayMatch = text.match(malayPattern);
    if (malayMatch) {
      return malayMatch[1].trim();
    }

    // Court patterns
    const courtPatterns = [
      /mahkamah\s+[^-.,]+/i,
      /high\s+court[^-.,]*/i,
      /sessions?\s+court[^-.,]*/i,
      /magistrate\s+court[^-.,]*/i,
      /shah\s+alam[^-.,]*/i,
      /putrajaya[^-.,]*/i,
      /kuala\s+lumpur[^-.,]*/i
    ];

    for (const pattern of courtPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }

    return "TBD";
  };

  const parseWhatsAppText = () => {
    if (!rawText.trim()) {
      toast.error("Please paste some text to parse");
      return;
    }

    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line);
    const assignments: ParsedAssignment[] = [];
    let currentEntry: string[] = [];
    
    // Get photographer names for matching
    const photographerNames = photographers?.map(p => p.name.toLowerCase()) || [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for pattern: "Name - time" or "Name - time :"
      const entryPattern = /^(.+?)\s*-\s*(.+?)(?:\s*[:：](.*))?$/;
      const match = line.match(entryPattern);
      
      if (match) {
        // Save previous entry if exists
        if (currentEntry.length > 0) {
          processEntry(currentEntry, assignments, photographerNames);
        }
        
        // Start new entry
        currentEntry = [line];
      } else if (currentEntry.length > 0) {
        // Continue current entry
        currentEntry.push(line);
      }
    }
    
    // Process last entry
    if (currentEntry.length > 0) {
      processEntry(currentEntry, assignments, photographerNames);
    }

    setParsedAssignments(assignments);
    
    if (assignments.length === 0) {
      toast.error("No assignments could be parsed from the text");
    } else {
      const validCount = assignments.filter(a => a.isValid).length;
      toast.success(`Parsed ${assignments.length} assignments (${validCount} valid)`);
    }
  };

  const processEntry = (entryLines: string[], assignments: ParsedAssignment[], photographerNames: string[]) => {
    const fullText = entryLines.join(' ');
    
    // Extract photographer and time from first line
    const firstLine = entryLines[0];
    const entryPattern = /^(.+?)\s*-\s*(.+?)(?:\s*[:：](.*))?$/;
    const match = firstLine.match(entryPattern);
    
    if (!match) return;
    
    const photographerName = match[1].trim();
    const timeStr = match[2].trim();
    let titleText = match[3] || '';
    
    // Add remaining lines to title
    if (entryLines.length > 1) {
      titleText += ' ' + entryLines.slice(1).join(' ');
    }
    
    // Clean up title (remove trailing editor tags like "-Fatin", "Dawn")
    titleText = titleText.replace(/\s*-\s*\w+\s*$/, '').trim();
    
    // Find photographer ID
    const photographer = photographers?.find(p => 
      p.name.toLowerCase() === photographerName.toLowerCase()
    );
    
    const assignment: ParsedAssignment = {
      id: Math.random().toString(36).substr(2, 9),
      photographer_name: photographerName,
      photographer_id: photographer?.id || null,
      time: parseTime(timeStr),
      title: titleText || 'Assignment',
      location: extractLocation(fullText),
      isValid: !!(photographer?.id && titleText.trim())
    };
    
    assignments.push(assignment);
  };

  const updateAssignment = (id: string, field: string, value: string) => {
    setParsedAssignments(prev => 
      prev.map(assignment => {
        if (assignment.id === id) {
          const updated = { ...assignment, [field]: value };
          
          if (field === 'photographer_id') {
            const photographer = photographers?.find(p => p.id === value);
            updated.photographer_name = photographer?.name || '';
          }
          
          updated.isValid = !!(updated.photographer_id && updated.title.trim());
          return updated;
        }
        return assignment;
      })
    );
  };

  const removeAssignment = (id: string) => {
    setParsedAssignments(prev => prev.filter(a => a.id !== id));
  };

  const saveAssignments = async () => {
    const validAssignments = parsedAssignments.filter(a => a.isValid);
    
    if (validAssignments.length === 0) {
      toast.error("No valid assignments to save");
      return;
    }

    setIsLoading(true);
    
    try {
      const records = validAssignments.map(assignment => ({
        title: assignment.title,
        location: assignment.location,
        date: format(date, 'yyyy-MM-dd'),
        time: assignment.time,
        photographer_id: assignment.photographer_id!,
        status: 'open' as const
      }));

      const { error } = await supabase
        .from('assignments')
        .insert(records);

      if (error) {
        console.error('Save error:', error);
        toast.error(`Failed to save assignments: ${error.message}`);
        return;
      }

      toast.success(`Successfully saved ${validAssignments.length} assignments`);
      
      // Reset form
      setRawText("");
      setParsedAssignments([]);
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save assignments");
    } finally {
      setIsLoading(false);
    }
  };

  const validCount = parsedAssignments.filter(a => a.isValid).length;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Assignment Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label>WhatsApp Assignment Text</Label>
        <Textarea
          placeholder="Paste your WhatsApp assignment text here...&#10;&#10;Example:&#10;Fadli - 9am : Penyanyi Naim Daniel dijadual hadir bagi sebutan kes di Mahkamah Sesyen Putrajaya&#10;&#10;Asyraf - 9am - Pendengaran permohonan injunksi di Mahkamah NCvC 1"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          className="min-h-[150px]"
        />
      </div>

      <Button onClick={parseWhatsAppText} className="w-full md:w-auto">
        <ClipboardPaste className="mr-2 h-4 w-4" />
        Parse Assignments
      </Button>

      {/* Preview Section */}
      {parsedAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview & Edit</CardTitle>
            <div className="text-sm text-muted-foreground">
              {validCount} of {parsedAssignments.length} assignments are valid and ready to save
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photographer</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedAssignments.map((assignment) => (
                      <TableRow key={assignment.id} className={!assignment.isValid ? "bg-destructive/5" : ""}>
                        <TableCell>
                          <Select
                            value={assignment.photographer_id || ""}
                            onValueChange={(value) => updateAssignment(assignment.id, 'photographer_id', value)}
                          >
                            <SelectTrigger className={!assignment.photographer_id ? "border-destructive" : ""}>
                              <SelectValue placeholder="Select photographer" />
                            </SelectTrigger>
                            <SelectContent>
                              {photographers?.map((photographer) => (
                                <SelectItem key={photographer.id} value={photographer.id}>
                                  {photographer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!assignment.photographer_id && (
                            <div className="text-xs text-destructive mt-1">
                              "{assignment.photographer_name}" not found
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="time"
                            value={assignment.time.substring(0, 5)}
                            onChange={(e) => updateAssignment(assignment.id, 'time', e.target.value + ':00')}
                            className="w-32"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={assignment.title}
                            onChange={(e) => updateAssignment(assignment.id, 'title', e.target.value)}
                            placeholder="Assignment title"
                            className={!assignment.title.trim() ? "border-destructive" : ""}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={assignment.location}
                            onChange={(e) => updateAssignment(assignment.id, 'location', e.target.value)}
                            placeholder="Location"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAssignment(assignment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button
                onClick={saveAssignments}
                disabled={validCount === 0 || isLoading}
                className="w-full md:w-auto"
              >
                {isLoading ? "Saving..." : `Save ${validCount} Assignment${validCount !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}