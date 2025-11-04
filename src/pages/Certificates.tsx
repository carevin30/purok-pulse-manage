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
import { FileText, Search, Download, Eye } from "lucide-react";
import GenerateCertificateDialog from "@/components/certificates/GenerateCertificateDialog";
import ViewCertificateDialog from "@/components/certificates/ViewCertificateDialog";
import { format } from "date-fns";

type Certificate = {
  id: string;
  certificate_type: string;
  certificate_number: string;
  resident_id: string | null;
  purpose: string | null;
  issued_date: string;
  valid_until: string | null;
  issued_by: string | null;
  notes: string | null;
  status: string;
  residents: {
    first_name: string;
    last_name: string;
  } | null;
};

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("certificates")
      .select("*, residents(first_name, last_name)")
      .order("issued_date", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load certificates",
        variant: "destructive",
      });
    } else {
      setCertificates(data || []);
    }
    setLoading(false);
  };

  const filteredCertificates = certificates.filter((cert) => {
    const query = searchQuery.toLowerCase();
    const residentName = cert.residents
      ? `${cert.residents.first_name} ${cert.residents.last_name}`.toLowerCase()
      : "";
    return (
      cert.certificate_number.toLowerCase().includes(query) ||
      residentName.includes(query) ||
      cert.certificate_type.toLowerCase().includes(query)
    );
  });

  const getCertificateTypeLabel = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Active: "default",
      Expired: "secondary",
      Revoked: "destructive",
    } as const;
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Certificates</h1>
          <p className="text-muted-foreground mt-2">
            Generate and manage barangay certificates
          </p>
        </div>
        <GenerateCertificateDialog onSuccess={loadCertificates} />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by certificate number, resident name, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certificate No.</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Resident</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Issued Date</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading certificates...
                </TableCell>
              </TableRow>
            ) : filteredCertificates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No certificates found matching your search"
                      : "No certificates issued yet"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCertificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-mono text-sm">
                    {cert.certificate_number}
                  </TableCell>
                  <TableCell>
                    {getCertificateTypeLabel(cert.certificate_type)}
                  </TableCell>
                  <TableCell>
                    {cert.residents
                      ? `${cert.residents.first_name} ${cert.residents.last_name}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{cert.purpose || "-"}</TableCell>
                  <TableCell>
                    {format(new Date(cert.issued_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {cert.valid_until
                      ? format(new Date(cert.valid_until), "MMM dd, yyyy")
                      : "No expiry"}
                  </TableCell>
                  <TableCell>{getStatusBadge(cert.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <ViewCertificateDialog certificate={cert} />
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
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
