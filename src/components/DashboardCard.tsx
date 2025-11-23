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
        "group relative cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.03] overflow-hidden",
        "border-3 border-border rounded-2xl",
        className
      )}
      onClick={onClick}
    >
      {/* Icon background with status color */}
      <div
        className={cn(
          "absolute top-0 right-0 w-40 h-40 -mr-10 -mt-10 rounded-full opacity-15 transition-opacity duration-300 group-hover:opacity-25 pointer-events-none",
          statusColors[status]
        )}
      />

      <div className="p-8 relative z-10">
        {/* Header with icon and badge */}
        <div className="flex items-start justify-between mb-6">
          <div
            className={cn(
              "p-5 rounded-2xl transition-colors duration-300 shadow-md",
              statusColors[status]
            )}
          >
            <Icon className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          {pendingCount !== undefined && pendingCount > 0 && (
            <Badge
              variant="destructive"
              className="text-lg font-bold px-4 py-2 min-w-[3rem] justify-center shadow-lg animate-pulse"
            >
              {pendingCount}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className="text-3xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors leading-tight">
            {title}
          </h3>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Bottom indicator */}
        <div className="mt-8 flex items-center text-base font-semibold text-muted-foreground group-hover:text-primary transition-colors">
          <span>Acessar</span>
          <svg
            className="w-6 h-6 ml-3 transition-transform duration-300 group-hover:translate-x-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Card>
  );
};
