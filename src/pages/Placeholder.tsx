import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function Placeholder() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
          <div className="rounded-full bg-secondary p-6">
            <Construction className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Under Development</h2>
            <p className="mt-2 text-muted-foreground">
              This module is coming soon. Stay tuned!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
