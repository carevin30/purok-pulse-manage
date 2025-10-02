import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil } from "lucide-react";

interface Ordinance {
  id: string;
  ordinance_number: string;
  title: string;
  description: string | null;
  date_enacted: string;
  status: string;
  content: string | null;
}

interface EditOrdinanceDialogProps {
  ordinance: Ordinance;
}

export default function EditOrdinanceDialog({ ordinance }: EditOrdinanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      ordinance_number: formData.get("ordinance_number") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      date_enacted: formData.get("date_enacted") as string,
      status: formData.get("status") as string,
      content: formData.get("content") as string,
    };

    const { error } = await supabase
      .from("ordinances")
      .update(data)
      .eq("id", ordinance.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Ordinance updated successfully",
      });
      setOpen(false);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Ordinance</DialogTitle>
          <DialogDescription>
            Update the details of the barangay ordinance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ordinance_number">Ordinance Number *</Label>
              <Input
                id="ordinance_number"
                name="ordinance_number"
                defaultValue={ordinance.ordinance_number}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={ordinance.title}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={ordinance.description || ""}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date_enacted">Date Enacted *</Label>
              <Input
                id="date_enacted"
                name="date_enacted"
                type="date"
                defaultValue={ordinance.date_enacted}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue={ordinance.status} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Repealed">Repealed</SelectItem>
                  <SelectItem value="Amended">Amended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Full Content</Label>
              <Textarea
                id="content"
                name="content"
                defaultValue={ordinance.content || ""}
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Ordinance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
