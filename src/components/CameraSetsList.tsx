
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { CameraSetCard } from "./CameraSetCard";
import { CameraSet } from "@/types/database";

interface CameraSetsListProps {
  cameraSets: CameraSet[] | undefined;
  isLoading: boolean;
  onAddNew: () => void;
  onEdit: (cameraSet: CameraSet) => void;
  onDelete: (id: string) => void;
}

export function CameraSetsList({ cameraSets, isLoading, onAddNew, onEdit, onDelete }: CameraSetsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Camera Equipment Sets</h3>
        <Button onClick={onAddNew} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Camera Set
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : cameraSets?.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No camera sets found. Add one to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {cameraSets?.map((set) => (
            <CameraSetCard
              key={set.id}
              cameraSet={set}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
