
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Photographer } from "@/types/database";
import { Loader2, CheckCircle, CircleSlash } from "lucide-react";

interface PhotographerInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  photographerId: string;
  assignments: number;
}

export const PhotographerInfoDialog = ({
  isOpen,
  onClose,
  photographerId,
  assignments,
}: PhotographerInfoDialogProps) => {
  const { data: photographer, isLoading } = useQuery({
    queryKey: ["photographer", photographerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photographers")
        .select()
        .eq("id", photographerId)
        .single();

      if (error) throw error;
      return data as Photographer;
    },
    enabled: isOpen && !!photographerId,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {photographer?.name}
                {photographer?.status === "active" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <CircleSlash className="h-4 w-4 text-yellow-500" />
                )}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary mb-2">
                    {assignments}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Assignments</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {photographer?.email && (
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {photographer.email}
                </p>
              )}
              {photographer?.phone && (
                <p className="text-sm">
                  <span className="font-medium">Phone:</span> {photographer.phone}
                </p>
              )}
              <p className="text-sm">
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={
                    photographer?.status === "active"
                      ? "text-green-500"
                      : "text-yellow-500"
                  }
                >
                  {photographer?.status === "active" ? "Active" : "On Leave"}
                </span>
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

