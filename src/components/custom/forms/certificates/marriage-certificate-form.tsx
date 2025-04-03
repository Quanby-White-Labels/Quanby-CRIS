"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMarriageCertificateForm } from "@/hooks/form-certificates-hooks/useMarriageCertificateForm";
import type { MarriageCertificateFormValues } from "@/lib/types/zod-form-certificate/marriage-certificate-form-schema";
import { FormType } from "@prisma/client";
import { useRef } from "react";

// Import form components
import ContractingPartiesCertificationCard from "./form-cards/marriage-cards/contracting-parties-certification-card";
import HusbandInfoCard from "./form-cards/marriage-cards/husband-info-card";
import HusbandParentsInfoCard from "./form-cards/marriage-cards/husband-parent-info-card";
import MarriageDetailsCard from "./form-cards/marriage-cards/marriage-details-card";
import SolemnizingOfficerCertification from "./form-cards/marriage-cards/solemnizing-officer-certification-card";
import WifeInfoCard from "./form-cards/marriage-cards/wife-info-card";
import WifeParentsInfoCard from "./form-cards/marriage-cards/wife-parent-info-card";
import { WitnessesCard } from "./form-cards/marriage-cards/witnesses-section-card";
import {
  PreparedByCard,
  ReceivedByCard,
  RegisteredAtOfficeCard,
} from "./form-cards/shared-components/processing-details-cards";
import RegistryInformationCard from "./form-cards/shared-components/registry-information-card";
import RemarksCard from "./form-cards/shared-components/remarks-card";
import { AffidavitOfSolemnizingOfficer } from "./form-cards/marriage-cards/affidavit-of-marriage";
import { AffidavitForDelayedMarriageRegistration } from "./form-cards/marriage-cards/affidavit-of-delayed-marriage-registration";
import PaginationInputs from "./form-cards/shared-components/pagination-inputs";
import { RegistryInformationCardForEdit } from "./form-cards/marriage-cards/registry";

export interface MarriageCertificateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  defaultValues?: Partial<MarriageCertificateFormValues>;
}

export default function MarriageCertificateForm({
  open,
  onOpenChange,
  onCancel,
  defaultValues,
}: MarriageCertificateFormProps) {
  // Reference to the scroll area for programmatic scrolling
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { formMethods, onSubmit, handleError, isSubmitting } =
    useMarriageCertificateForm({
      onOpenChange,
      defaultValues,
      scrollAreaRef, // Pass the ref to the hook
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[70vw] w-[70vw] h-[95vh] max-h-[95vh] p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Form {...formMethods}>
          <form
            onSubmit={formMethods.handleSubmit(onSubmit, handleError)}
            className="space-y-6"
            noValidate
          >
            <div className="h-full flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center py-4">
                  Certificate of Marriage
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-1 overflow-hidden">
                {/* Left Side - Form */}
                <div className="w-full">
                  {/* Add ref to the ScrollArea for programmatic scrolling */}
                  <ScrollArea
                    className="h-[calc(95vh-120px)]"
                    ref={scrollAreaRef}
                  >
                    <div className="p-6 space-y-4" id="form-content">
                      <div id="pagination-inputs">
                        <PaginationInputs />
                      </div>

                      {/* Registry Information Section */}
                      <div id="registry-information-card">
                        {defaultValues?.id ? (
                          <RegistryInformationCardForEdit />
                        ) : (
                          <RegistryInformationCard
                            formType={FormType.MARRIAGE}
                            title="Marriage Registry Information"
                          />
                        )}
                      </div>

                      {/* Husband Information Section */}
                      <div id="husband-info-card">
                        <HusbandInfoCard />
                      </div>

                      <div id="husband-parents-info-card">
                        <HusbandParentsInfoCard />
                      </div>

                      {/* Wife Information Section */}
                      <div id="wife-info-card">
                        <WifeInfoCard />
                      </div>

                      <div id="wife-parents-info-card">
                        <WifeParentsInfoCard />
                      </div>

                      {/* Marriage Details Section */}
                      <div id="marriage-details-card">
                        <MarriageDetailsCard />
                      </div>

                      {/* Certification and Witnesses Section */}
                      <div id="contracting-parties-certification-card">
                        <ContractingPartiesCertificationCard />
                      </div>

                      <div id="solemnizing-officer-certification-card">
                        <SolemnizingOfficerCertification />
                      </div>

                      <div id="witnesses-section-card">
                        <WitnessesCard />
                      </div>

                      {/* Processing Details Section */}
                      {/* <div id="prepared-by-card">
                        <PreparedByCard />
                      </div> */}

                      <div id="received-by-card">
                        <ReceivedByCard cardTitle="Received by" />
                      </div>

                      <div id="registered-at-office-card">
                        <RegisteredAtOfficeCard
                          fieldPrefix="registeredByOffice"
                          cardTitle="Registered at the Office of Civil Registrar"
                        />
                      </div>

                      {/* Remarks Section */}
                      <div id="remarks-card">
                        <RemarksCard
                          fieldName="remarks"
                          cardTitle="Marriage Certificate Remarks"
                          label="Additional Remarks"
                          placeholder="Enter any additional remarks or annotations"
                        />
                      </div>

                      {/* Affidavit Sections */}
                      <div id="affidavit-of-solemnizing-officer">
                        <AffidavitOfSolemnizingOfficer />
                      </div>

                      <div id="affidavit-for-delayed-marriage-registration">
                        <AffidavitForDelayedMarriageRegistration />
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>

            <DialogFooter className="absolute bottom-2 right-2 gap-2 flex items-center">
              <Button
                type="button"
                variant="outline"
                className="py-2 w-32 bg-muted-foreground/80 hover:bg-muted-foreground hover:text-accent text-accent"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="py-2 w-32 bg-primary/80 hover:bg-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
