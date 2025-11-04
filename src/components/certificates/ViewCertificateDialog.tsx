import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Download } from "lucide-react";
import { format } from "date-fns";
import barangayLogo from "@/assets/barangay-logo.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";

type Certificate = {
  id: string;
  certificate_type: string;
  certificate_number: string;
  purpose: string | null;
  issued_date: string;
  valid_until: string | null;
  issued_by: string | null;
  notes: string | null;
  residents: {
    first_name: string;
    last_name: string;
  } | null;
};

type ViewCertificateDialogProps = {
  certificate: Certificate;
};

export default function ViewCertificateDialog({
  certificate,
}: ViewCertificateDialogProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const getCertificateTypeLabel = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
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

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );
      pdf.save(
        `${getCertificateTypeLabel(certificate.certificate_type)}_${certificate.certificate_number}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Certificate Preview</DialogTitle>
          <Button onClick={handleDownloadPDF} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </DialogHeader>

        <div ref={certificateRef} className="border-2 border-foreground rounded-lg p-8 bg-white">
          {/* Header with Logo */}
          <div className="flex items-start gap-4 mb-6">
            <img 
              src={barangayLogo} 
              alt="Barangay Logo" 
              className="w-32 h-32 object-contain"
            />
            <div className="flex-1 text-center">
              <p className="text-sm font-semibold">Republic of the Philippines</p>
              <p className="text-sm font-semibold">Province of Abra</p>
              <p className="text-sm font-semibold">Municipality of Lagangilang</p>
              <p className="text-sm font-semibold">Barangay Poblacion</p>
              <p className="text-xs font-bold mt-1">OFFICE OF THE PUNONG BARANGAY</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold uppercase text-green-600">
              {getCertificateTypeLabel(certificate.certificate_type)}
            </h3>
          </div>

          <div className="space-y-6 text-sm">
            {/* Body */}
            <div className="space-y-4">
              <p className="font-semibold">TO WHOM IT MAY CONCERN:</p>
              
              <p className="text-justify leading-relaxed">
                This is to CERTIFY that{" "}
                <span className="font-bold">
                  {certificate.residents
                    ? `${certificate.residents.first_name.toUpperCase()} ${certificate.residents.last_name.toUpperCase()}`
                    : "N/A"}
                </span>
                , years old, single, a bona fide resident of Purok 7, Barangay Poblacion, Lagangilang, Abra.
              </p>

              <p className="text-justify leading-relaxed">
                Certified further that the above named-person is belonging to an indigent family and highly recommended to avail any privileges.
              </p>

              {certificate.purpose && (
                <p className="text-justify leading-relaxed">
                  This Certification is hereby issued upon the personal request of the above named-person for {certificate.purpose}.
                </p>
              )}

              <p className="leading-relaxed">
                Issued this{" "}
                <span className="font-semibold">
                  {format(new Date(certificate.issued_date), "do")}
                </span>{" "}
                day of{" "}
                <span className="font-semibold">
                  {format(new Date(certificate.issued_date), "MMMM yyyy")}
                </span>{" "}
                at Barangay Poblacion, Lagangilang, Abra.
              </p>
            </div>

            {/* Affiant Section */}
            <div className="mt-8">
              <p className="font-bold">
                {certificate.residents
                  ? `${certificate.residents.first_name.toUpperCase()} ${certificate.residents.last_name.toUpperCase()}`
                  : "N/A"}
              </p>
              <p className="text-xs">Affiant</p>
            </div>

            {/* Footer Note */}
            <div className="mt-8">
              <p className="text-xs italic">Not valid without dry seal</p>
            </div>

            {/* Signature Section */}
            <div className="mt-12 flex justify-center">
              <div className="text-center">
                <p className="font-bold">
                  Hon. {certificate.issued_by || "ARMANDO D. DEVELOS"}
                </p>
                <p className="text-xs">Punong Barangay</p>
              </div>
            </div>

            {/* Certificate Number */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Certificate No: {certificate.certificate_number}
              </p>
            </div>

            {certificate.notes && (
              <div className="mt-4 p-3 bg-muted rounded">
                <p className="text-xs text-muted-foreground">
                  Note: {certificate.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
