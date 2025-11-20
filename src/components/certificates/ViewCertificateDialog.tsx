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
import barangayTangboLogo from "@/assets/barangay-tangbo-logo.png";
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
    house_number: string | null;
    purok: string | null;
    street_address: string | null;
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

  const renderIndigencyContent = () => (
    <>
      <p className="font-semibold">TO WHOM IT MAY CONCERN:</p>
      
      <p className="text-justify leading-relaxed">
        This is to CERTIFY that{" "}
        <span className="font-bold">
          {certificate.residents
            ? `${certificate.residents.first_name.toUpperCase()} ${certificate.residents.last_name.toUpperCase()}`
            : "N/A"}
        </span>
        , 29 years old, single, a bona fide resident of Purok 7, Barangay Sarayan, Matalam, Cotabato.
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
        at Barangay Sarayan, Matalam, Cotabato.
      </p>

      <div className="mt-8">
        <p className="font-bold">
          {certificate.residents
            ? `${certificate.residents.first_name.toUpperCase()} ${certificate.residents.last_name.toUpperCase()}`
            : "N/A"}
        </p>
        <p className="text-xs">Affiant</p>
      </div>

      <div className="mt-8">
        <p className="text-xs italic">Not valid without dry seal</p>
      </div>

      <div className="mt-12 flex justify-center">
        <div className="text-center">
          <p className="font-bold">
            Hon. {certificate.issued_by || "ARMANDO D. DEVELOS"}
          </p>
          <p className="text-xs">Punong Barangay</p>
        </div>
      </div>
    </>
  );

  const renderResidencyContent = () => {
    const residentAddress = certificate.residents?.house_number 
      ? `${certificate.residents.house_number}, Barangay Sarayan, Matalam, Cotabato`
      : "Barangay Sarayan, Matalam, Cotabato";
    
    return (
      <>
        <p className="font-semibold mb-6">TO WHOM IT MAY CONCERN:</p>
        
        <p className="text-justify leading-relaxed mb-6 indent-12">
          THIS IS TO CERTIFY that as per records available in this office, Mr./Ms.{" "}
          <u className="font-bold">
            {certificate.residents
              ? `${certificate.residents.first_name.toUpperCase()} ${certificate.residents.last_name.toUpperCase()}`
              : "_______________"}
          </u>
          , male/female, married/single, of legal age, Filipino citizen is a bonafide resident of {residentAddress}.
        </p>

        <p className="text-justify leading-relaxed mb-8 indent-12">
          CERTIFYING FURTHER, that above-named person, is a person of good moral character and has no derogatory and/or criminal records in the barangay.
        </p>

        <p className="leading-relaxed mb-24 indent-12">
          ISSUED this{" "}
          <u className="font-semibold px-8">
            {format(new Date(certificate.issued_date), "do")}
          </u>{" "}
          day of{" "}
          <u className="font-semibold px-8">
            {format(new Date(certificate.issued_date), "MMMM")}
          </u>{" "}
          {format(new Date(certificate.issued_date), "yyyy")} at Poblacion, Lagangilang, Abra.
        </p>

        <div className="flex justify-end">
          <div className="text-center">
            <p className="font-bold text-base border-b border-foreground inline-block px-12">
              {certificate.issued_by || "ARMANDO D. DEVELOS"}
            </p>
            <p className="text-sm mt-1">Punong Barangay</p>
          </div>
        </div>
      </>
    );
  };

  const renderBusinessPermitContent = () => (
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <img 
          src={barangayTangboLogo} 
          alt="Watermark" 
          className="w-96 h-96 object-contain"
        />
      </div>
      <div className="relative z-10">
        <p className="font-semibold text-center mb-4">TO WHOM IT MAY CONCERN:</p>
        
        <p className="text-justify leading-relaxed mb-4">
          This clearance is hereby granted to{" "}
          <span className="font-bold">
            {certificate.residents
              ? `${certificate.residents.first_name.toUpperCase()} ${certificate.residents.last_name.toUpperCase()}`
              : "_______________"}
          </span>{" "}
          with business address at Barangay Tangbo, Arteche Eastern Samar, to operate or engage in business trade or occupation in the vicinity of the Barangay for:
        </p>

        <div className="mb-4 pl-8">
          <p>Nature of Business:</p>
          <p className="font-semibold">{certificate.purpose || "NEW"}</p>
          <p className="font-semibold">RENEWAL</p>
        </div>

        <p className="text-justify leading-relaxed mb-4">
          As having been complied with the requirements of the Barangay.
        </p>

        <p className="text-justify leading-relaxed mb-6">
          This clearance is issued upon request of the herein interested party for whatever purpose it may serve.
        </p>

        <p className="mb-8">
          Issued this{" "}
          <span className="font-semibold">
            {format(new Date(certificate.issued_date), "do")}
          </span>{" "}
          day of{" "}
          <span className="font-semibold">
            {format(new Date(certificate.issued_date), "MMMM yyyy")}
          </span>.
        </p>

        <div className="flex justify-between items-end mt-12">
          <div>
            <p className="text-sm">Attested by:</p>
            <p className="font-bold mt-8 border-t border-foreground pt-1">MR. DEXTER GIL D. MONTANCES</p>
            <p className="text-xs italic">Barangay Secretary</p>
          </div>
          <div className="text-right">
            <p className="text-sm">Approved by:</p>
            <p className="font-bold mt-8 border-t border-foreground pt-1">
              {certificate.issued_by || "HON. ANTONIO M. MEJICA"}
            </p>
            <p className="text-xs italic">Barangay Chairman</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMayorsPermitContent = () => (
    <div className="space-y-6">
      <p className="text-justify leading-relaxed indent-12">
        Permit is hereby granted to{" "}
        <span className="font-bold">
          {certificate.purpose || "_______________"}
        </span>{" "}
        to operate as non-profit association providing farm machineries to farmers in which they can rent to a minimal amount for its maintenance.
      </p>

      <p className="text-justify leading-relaxed indent-12">
        This certifies that mayor's permit has been granted to operate subject to the existing laws, ordinances, rules, and regulations of Lagangilang, Abra pursuant to the provisions of Revenue Code of 2019 and provides further any violation therefore will be sufficient grounds for the revocation of the permit.
      </p>

      <p className="leading-relaxed indent-12 mb-24">
        Issued this{" "}
        <u className="font-semibold px-4">
          {format(new Date(certificate.issued_date), "do")}
        </u>{" "}
        day of{" "}
        <u className="font-semibold px-4">
          {format(new Date(certificate.issued_date), "MMMM")}
        </u>
        , {format(new Date(certificate.issued_date), "yyyy")} at Lagangilang, Abra, Philippines.
      </p>

      <div className="flex justify-end">
        <div className="text-center">
          <p className="font-bold text-base">
            {certificate.issued_by || "ROVELYNE VILLAMOR"}
          </p>
          <p className="text-sm italic">Municipal Mayor</p>
        </div>
      </div>

      <div className="mt-12 border-t pt-4">
        <div className="mb-4">
          <p className="text-sm">Requested by:</p>
          <p className="font-bold">
            {certificate.residents
              ? `${certificate.residents.first_name} ${certificate.residents.last_name}`
              : "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <p className="font-semibold">PERMIT FEE:</p>
            <p>Php 500.00</p>
          </div>
          <div>
            <p className="font-semibold">OFFICIAL RECEIPT #:</p>
            <p>{certificate.certificate_number}</p>
          </div>
          <div>
            <p className="font-semibold">DATE OF ISSUANCE:</p>
            <p>{format(new Date(certificate.issued_date), "MM-dd-yy")}</p>
          </div>
        </div>
      </div>
    </div>
  );

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
          {certificate.certificate_type === 'mayors_permit' ? (
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-8 mb-4">
                <img 
                  src={barangayLogo} 
                  alt="Municipality Logo" 
                  className="w-20 h-20 object-contain"
                />
                <div className="flex-1">
                  <p className="text-sm">Republic of the Philippines</p>
                  <p className="text-sm">Cordillera Administrative Region</p>
                  <p className="text-sm">Province of Abra</p>
                  <p className="text-base font-bold">MUNICIPALITY OF LAGANGILANG</p>
                </div>
                <img 
                  src={barangayLogo} 
                  alt="Mayor Photo" 
                  className="w-20 h-20 object-contain rounded-full"
                />
              </div>
            </div>
          ) : certificate.certificate_type === 'business_permit' ? (
            <div className="text-center mb-6">
              <img 
                src={barangayLogo} 
                alt="Barangay Logo" 
                className="w-24 h-24 object-contain mx-auto mb-2"
              />
              <p className="text-sm font-semibold">Republic of the Philippines</p>
              <p className="text-sm font-semibold">Province of Eastern Samar</p>
              <p className="text-sm font-semibold">Municipality of ARTECHE</p>
              <p className="text-base font-bold">BARANGAY TANGBO</p>
              <p className="text-sm font-bold mt-2">OFFICE OF THE BARANGAY CHAIRMAN</p>
            </div>
          ) : (
            <div className="flex items-start gap-4 mb-6">
              <img 
                src={barangayLogo} 
                alt="Barangay Logo" 
                className="w-32 h-32 object-contain"
              />
              <div className="flex-1 text-center">
                <p className="text-sm font-semibold">Republic of the Philippines</p>
                <p className="text-sm font-semibold">Province of Cotabato</p>
                <p className="text-sm font-semibold">Municipality of Matalam</p>
                <p className="text-sm font-semibold">Barangay Sarayan</p>
                <p className="text-xs font-bold mt-1">OFFICE OF THE PUNONG BARANGAY</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold uppercase" style={{ color: certificate.certificate_type === 'business_permit' || certificate.certificate_type === 'mayors_permit' ? '#000' : '#16a34a' }}>
              {certificate.certificate_type === 'business_permit' 
                ? 'BARANGAY BUSINESS CLEARANCE'
                : certificate.certificate_type === 'mayors_permit'
                ? "MAYOR'S PERMIT"
                : getCertificateTypeLabel(certificate.certificate_type)}
            </h3>
          </div>

          <div className="space-y-6 text-sm">
            {/* Body Content Based on Type */}
            <div className="space-y-4">
              {certificate.certificate_type === 'certificate_of_indigency' && renderIndigencyContent()}
              {(certificate.certificate_type === 'certificate_of_residency' || certificate.certificate_type === 'residency') && renderResidencyContent()}
              {certificate.certificate_type === 'business_permit' && renderBusinessPermitContent()}
              {certificate.certificate_type === 'mayors_permit' && renderMayorsPermitContent()}
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
