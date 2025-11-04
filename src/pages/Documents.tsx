import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Search,
  Download,
  Eye,
  Trash2,
  Archive,
} from "lucide-react";
import UploadDocumentDialog from "@/components/documents/UploadDocumentDialog";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Document = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  document_number: string | null;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  version: number;
  is_archived: boolean;
  created_at: string;
};

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  };

  const handleDownload = async (document: Document) => {
    const { data, error } = await supabase.storage
      .from("documents")
      .download(document.file_name);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(data);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = document.file_name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string, fileName: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([fileName]);

    if (storageError) {
      toast({
        title: "Error",
        description: "Failed to delete file from storage",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("documents").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete document record",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
      loadDocuments();
    }
  };

  const toggleArchive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("documents")
      .update({ is_archived: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: currentStatus ? "Document unarchived" : "Document archived",
      });
      loadDocuments();
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      doc.title.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query) ||
      doc.document_number?.toLowerCase().includes(query);
    const matchesCategory =
      categoryFilter === "all" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: string) => {
    const colors = {
      resolution: "default",
      memorandum: "secondary",
      ordinance: "outline",
      report: "default",
      financial: "destructive",
      legal: "outline",
      correspondence: "secondary",
      other: "outline",
    } as const;

    return (
      <Badge variant={colors[category as keyof typeof colors] || "outline"}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return mb < 1
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-2">
            Store and manage official barangay documents
          </p>
        </div>
        <UploadDocumentDialog onSuccess={loadDocuments} />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="resolution">Resolution</SelectItem>
            <SelectItem value="memorandum">Memorandum</SelectItem>
            <SelectItem value="ordinance">Ordinance</SelectItem>
            <SelectItem value="report">Report</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="legal">Legal</SelectItem>
            <SelectItem value="correspondence">Correspondence</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Document No.</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading documents...
                </TableCell>
              </TableRow>
            ) : filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchQuery || categoryFilter !== "all"
                      ? "No documents found matching your filters"
                      : "No documents uploaded yet"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow
                  key={doc.id}
                  className={doc.is_archived ? "opacity-50" : ""}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(doc.category)}</TableCell>
                  <TableCell>{doc.document_number || "-"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {doc.file_name}
                  </TableCell>
                  <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                  <TableCell>v{doc.version}</TableCell>
                  <TableCell>
                    {format(new Date(doc.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleArchive(doc.id, doc.is_archived)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id, doc.file_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
