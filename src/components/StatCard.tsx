import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "accent";
}

export default function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-3xl font-bold text-foreground">{value}</h3>
            {trend && (
              <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
            )}
          </div>
          <div className={`rounded-xl p-3 ${
            variant === "accent" 
              ? "bg-accent-light" 
              : "bg-secondary"
          }`}>
            <Icon className={`h-6 w-6 ${
              variant === "accent" 
                ? "text-accent" 
                : "text-primary"
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
