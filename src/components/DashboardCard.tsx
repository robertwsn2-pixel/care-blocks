import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  pendingCount?: number;
  status?: "success" | "warning" | "urgent" | "default";
  onClick?: () => void;
  className?: string;
}

export const DashboardCard = ({
  title,
  description,
  icon: Icon,
  pendingCount,
  status = "default",
  onClick,
  className,
}: DashboardCardProps) => {
  const statusColors = {
    success: "bg-success hover:bg-success-hover",
    warning: "bg-warning hover:bg-warning-hover",
    urgent: "bg-urgent hover:bg-urgent-hover",
    default: "bg-primary hover:bg-primary-hover",
  };

  return (
    <Card
      className={cn(
        "group relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] overflow-hidden",
        "border-2 border-border",
        className
      )}
      onClick={onClick}
    >
      {/* Icon background with status color */}
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 transition-opacity duration-300 group-hover:opacity-20",
          statusColors[status]
        )}
      />

      <div className="p-6 relative z-10">
        {/* Header with icon and badge */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "p-4 rounded-xl transition-colors duration-300",
              statusColors[status]
            )}
          >
            <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          {pendingCount !== undefined && pendingCount > 0 && (
            <Badge
              variant="destructive"
              className="text-base font-bold px-3 py-1 min-w-[2.5rem] justify-center"
            >
              {pendingCount}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Bottom indicator */}
        <div className="mt-6 flex items-center text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
          <span>Acessar</span>
          <svg
            className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Card>
  );
};
