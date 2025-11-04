import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { format } from "date-fns";

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
  const getCertificateTypeLabel = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Certificate Preview</DialogTitle>
        </DialogHeader>

        <div className="border-2 border-primary rounded-lg p-8 bg-background">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary mb-2">
              Republic of the Philippines
            </h2>
            <p className="text-lg font-semibold">BARANGAY OFFICE</p>
            <p className="text-sm text-muted-foreground mt-4">
              Certificate No: {certificate.certificate_number}
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold uppercase mb-4">
                {getCertificateTypeLabel(certificate.certificate_type)}
              </h3>
            </div>

            <div className="space-y-2 text-center">
              <p className="text-lg">TO WHOM IT MAY CONCERN:</p>
              <p className="mt-4">
                This is to certify that{" "}
                <span className="font-bold underline">
                  {certificate.residents
                    ? `${certificate.residents.first_name} ${certificate.residents.last_name}`
                    : "N/A"}
                </span>
              </p>
              <p className="mt-2">is a bonafide resident of this Barangay.</p>
            </div>

            {certificate.purpose && (
              <div className="mt-4">
                <p className="font-semibold">Purpose:</p>
                <p className="text-muted-foreground">{certificate.purpose}</p>
              </div>
            )}

            <div className="mt-8 space-y-2">
              <p>
                Issued this{" "}
                <span className="font-semibold">
                  {format(new Date(certificate.issued_date), "do")}
                </span>{" "}
                day of{" "}
                <span className="font-semibold">
                  {format(new Date(certificate.issued_date), "MMMM, yyyy")}
                </span>
                .
              </p>

              {certificate.valid_until && (
                <p className="text-sm text-muted-foreground">
                  Valid until:{" "}
                  {format(new Date(certificate.valid_until), "MMMM dd, yyyy")}
                </p>
              )}
            </div>

            <div className="mt-12 flex justify-end">
              <div className="text-center">
                <p className="font-bold border-t-2 border-foreground pt-1">
                  {certificate.issued_by || "BARANGAY CAPTAIN"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Punong Barangay
                </p>
              </div>
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
