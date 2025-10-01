import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, FileText } from "lucide-react";

const residents = [
  { id: 1, name: "Juan dela Cruz", age: 42, household: "HH-001", status: "Active", special: "None" },
  { id: 2, name: "Maria Santos", age: 67, household: "HH-002", status: "Active", special: "Senior" },
  { id: 3, name: "Pedro Reyes", age: 35, household: "HH-003", status: "Active", special: "PWD" },
  { id: 4, name: "Ana Garcia", age: 28, household: "HH-004", status: "Active", special: "None" },
  { id: 5, name: "Carlos Martinez", age: 73, household: "HH-005", status: "Active", special: "Senior" },
];

export default function Residents() {
  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search residents..." 
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
            <UserPlus className="h-4 w-4" />
            Add Resident
          </Button>
        </div>
      </div>

      {/* Residents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resident Registry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Age</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Household</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Special Status</th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((resident) => (
                  <tr key={resident.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-4 text-sm font-medium text-foreground">{resident.name}</td>
                    <td className="py-4 text-sm text-muted-foreground">{resident.age}</td>
                    <td className="py-4 text-sm text-muted-foreground">{resident.household}</td>
                    <td className="py-4">
                      <Badge variant="outline" className="border-accent text-accent">
                        {resident.status}
                      </Badge>
                    </td>
                    <td className="py-4">
                      {resident.special !== "None" ? (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                          {resident.special}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
