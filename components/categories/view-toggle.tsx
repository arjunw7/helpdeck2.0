import { LayoutGrid, List } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ViewToggleProps {
  view: "tile" | "table";
  onViewChange: (view: "tile" | "table") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 border rounded-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={view === "tile"}
              onPressedChange={() => onViewChange("tile")}
              size="sm"
              className="rounded-none data-[state=on]:bg-muted"
            >
              <LayoutGrid className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Tile View</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={view === "table"}
              onPressedChange={() => onViewChange("table")}
              size="sm"
              className="rounded-none data-[state=on]:bg-muted"
            >
              <List className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Table View</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}