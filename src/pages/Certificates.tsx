import { useState, useEffect, useRef } from "react";
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
import { FileText, Search, Download, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import GenerateCertificateDialog from "@/components/certificates/GenerateCertificateDialog";
import ViewCertificateDialog from "@/components/certificates/ViewCertificateDialog";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import barangayLogo from "@/assets/barangay-logo.png";

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
  const [downloadingCert, setDownloadingCert] = useState<string | null>(null);
  const { toast } = useToast();
  const hiddenCertRef = useRef<HTMLDivElement>(null);

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

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("certificates")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete certificate",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Certificate deleted successfully",
      });
      loadCertificates();
    }
  };

  const handleDirectDownload = async (cert: Certificate) => {
    setDownloadingCert(cert.id);
    
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.width = "800px";
    tempDiv.innerHTML = `
      <div style="border: 2px solid #000; border-radius: 8px; padding: 40px; background: white; font-family: Arial, sans-serif;">
        <div style="display: flex; gap: 16px; margin-bottom: 24px; align-items: flex-start;">
          <img src="${barangayLogo}" alt="Logo" style="width: 128px; height: 128px; object-fit: contain;" />
          <div style="flex: 1; text-align: center;">
            <p style="font-size: 14px; font-weight: 600; margin: 4px 0;">Republic of the Philippines</p>
            <p style="font-size: 14px; font-weight: 600; margin: 4px 0;">Province of Abra</p>
            <p style="font-size: 14px; font-weight: 600; margin: 4px 0;">Municipality of Lagangilang</p>
            <p style="font-size: 14px; font-weight: 600; margin: 4px 0;">Barangay Poblacion</p>
            <p style="font-size: 12px; font-weight: bold; margin-top: 8px;">OFFICE OF THE PUNONG BARANGAY</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 32px;">
          <h3 style="font-size: 24px; font-weight: bold; text-transform: uppercase; color: #16a34a; margin: 0;">
            ${getCertificateTypeLabel(cert.certificate_type)}
          </h3>
        </div>
        
        <div style="font-size: 14px; line-height: 1.8;">
          <p style="font-weight: 600; margin-bottom: 16px;">TO WHOM IT MAY CONCERN:</p>
          
          <p style="text-align: justify; margin-bottom: 16px;">
            This is to CERTIFY that <strong>${cert.residents ? `${cert.residents.first_name.toUpperCase()} ${cert.residents.last_name.toUpperCase()}` : "N/A"}</strong>, years old, single, a bona fide resident of Purok 7, Barangay Poblacion, Lagangilang, Abra.
          </p>
          
          <p style="text-align: justify; margin-bottom: 16px;">
            Certified further that the above named-person is belonging to an indigent family and highly recommended to avail any privileges.
          </p>
          
          ${cert.purpose ? `<p style="text-align: justify; margin-bottom: 16px;">This Certification is hereby issued upon the personal request of the above named-person for ${cert.purpose}.</p>` : ""}
          
          <p style="margin-bottom: 32px;">
            Issued this <strong>${format(new Date(cert.issued_date), "do")}</strong> day of <strong>${format(new Date(cert.issued_date), "MMMM yyyy")}</strong> at Barangay Poblacion, Lagangilang, Abra.
          </p>
          
          <div style="margin-top: 32px;">
            <p style="font-weight: bold;">${cert.residents ? `${cert.residents.first_name.toUpperCase()} ${cert.residents.last_name.toUpperCase()}` : "N/A"}</p>
            <p style="font-size: 12px;">Affiant</p>
          </div>
          
          <div style="margin-top: 32px;">
            <p style="font-size: 12px; font-style: italic;">Not valid without dry seal</p>
          </div>
          
          <div style="margin-top: 48px; text-align: center;">
            <p style="font-weight: bold;">Hon. ${cert.issued_by || "ARMANDO D. DEVELOS"}</p>
            <p style="font-size: 12px;">Punong Barangay</p>
          </div>
          
          <div style="margin-top: 24px; text-align: center;">
            <p style="font-size: 12px; color: #666;">Certificate No: ${cert.certificate_number}</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(tempDiv);
    
    try {
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${getCertificateTypeLabel(cert.certificate_type)}_${cert.certificate_number}.pdf`);
      
      toast({
        title: "Success",
        description: "Certificate downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to download certificate",
        variant: "destructive",
      });
    } finally {
      document.body.removeChild(tempDiv);
      setDownloadingCert(null);
    }
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDirectDownload(cert)}
                        disabled={downloadingCert === cert.id}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Certificate</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this certificate? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(cert.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
