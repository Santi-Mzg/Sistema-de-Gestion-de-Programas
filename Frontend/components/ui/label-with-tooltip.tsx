import { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface LabelWithTooltipProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  tooltip?: ReactNode;
  className?: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
}

export function LabelWithTooltip({
  label,
  htmlFor,
  required = false,
  tooltip,
  className,
  tooltipSide = "top",
}: LabelWithTooltipProps) {
  return (
    <Label
      htmlFor={htmlFor}
      className={cn(
        "flex items-center gap-1.5 text-sm font-semibold",
        className
      )}
    >
      <span>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>

      {tooltip && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                tabIndex={-1}
                className="cursor-help"
              >
                <Info
                  size={15}
                  className="text-muted-foreground/70 hover:text-primary transition-colors"
                />
              </button>
            </TooltipTrigger>

            <TooltipContent
              side={tooltipSide}
              className="max-w-xs text-sm"
            >
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </Label>
  );
}