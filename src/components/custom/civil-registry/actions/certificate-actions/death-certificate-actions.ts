'use server';
import { prisma } from '@/lib/prisma';
import {
  deathCertificateFormSchema,
  DeathCertificateFormValues,
} from '@/lib/types/zod-form-certificate/death-certificate-form-schema';
import { fileToBase64 } from '@/lib/utils/fileToBase64';
import { DocumentStatus, FormType, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function submitDeathCertificateForm(
  formData: DeathCertificateFormValues
) {
  try {
    if (!formData) {
      throw new Error('No form data provided');
    }

    // Validate the form data using Zod.
    // If it passes, we assume that all required fields are defined.
    try {
      deathCertificateFormSchema.parse(formData);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return {
          success: false,
          error: `Validation failed: ${validationError.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', ')}`,
        };
      }
      throw validationError;
    }

    return await prisma.$transaction(
      async (tx) => {
        // Find users by name.
        const receivedByUser = await tx.user.findFirst({
          where: { name: formData?.receivedBy?.nameInPrint },
        });
        const registeredByUser = await tx.user.findFirst({
          where: { name: formData.registeredByOffice?.nameInPrint },
        });

        // Instead of throwing an error, set the corresponding user IDs to null if not found.
        const receivedById = receivedByUser ? receivedByUser.id : null;
        const registeredById = registeredByUser ? registeredByUser.id : null;

        // Use pagination details from the form data.
        const pageNumber = formData.pagination?.pageNumber || '';
        const bookNumber = formData.pagination?.bookNumber || '';

        // Determine if the registration is late.
        const isLateRegistered = Boolean(formData.delayedRegistration);

        // Create the base registry form record.
        const baseForm = await tx.baseRegistryForm.create({
          data: {
            formNumber: '103', // Death certificate form number.
            formType: FormType.DEATH,
            registryNumber: formData.registryNumber || '',
            province: formData?.province || '',
            cityMunicipality: formData?.cityMunicipality || '',
            pageNumber,
            bookNumber,
            dateOfRegistration: new Date(),
            isLateRegistered,
            status: DocumentStatus.PENDING,
            preparedById: null,
            verifiedById: null,
            preparedByName: formData.preparedBy?.nameInPrint,
            preparedByPosition: formData.preparedBy?.titleOrPosition,
            preparedByDate: formData.preparedBy?.date!,
            verifiedByName: null,
            receivedById: receivedById,
            receivedBy: formData.receivedBy?.nameInPrint,
            receivedByPosition: formData.receivedBy?.titleOrPosition,
            receivedByDate: formData.receivedBy?.date!,
            registeredById: registeredById,
            registeredBy: formData.registeredByOffice?.nameInPrint,
            registeredByPosition: formData.registeredByOffice?.titleOrPosition,
            registeredByDate: formData.registeredByOffice?.date!,
            remarks: formData.remarks,
          },
        });

        const safelyConvertDateToJSON = (date: Date | undefined | null) => {
          return date instanceof Date ? date.toISOString() : null;
        };

        // Create the death certificate form record.
        await tx.deathCertificateForm.create({
          data: {
            baseFormId: baseForm.id,

            // Deceased Information.
            deceasedName: formData.name as Prisma.JsonObject,
            sex: formData.sex!,
            dateOfDeath: formData.dateOfDeath!,
            timeOfDeath: formData?.timeOfDeath!, // Non-null assertion.
            dateOfBirth: formData?.dateOfBirth!, // Non-null assertion.
            ageAtDeath: formData.ageAtDeath as Prisma.JsonObject,
            placeOfDeath: {
              province: formData.placeOfDeath?.province,
              cityMunicipality: formData.placeOfDeath?.cityMunicipality,
              houseNo: formData.placeOfDeath?.houseNo,
              st: formData.placeOfDeath?.st,
              barangay: formData.placeOfDeath?.barangay,
              hospitalInstitution: formData.placeOfDeath?.hospitalInstitution,
            },
            civilStatus: formData.civilStatus!,
            religion: formData.religion || '',
            citizenship: formData?.citizenship || '',
            residence: {
              province: formData.residence?.province,
              cityMunicipality: formData.residence?.cityMunicipality,
              houseNo: formData.residence?.houseNo,
              st: formData.residence?.st,
              barangay: formData.residence?.barangay,
              country: formData.residence?.country,
            },
            occupation: formData.occupation || '',

            // Parent Information.
            parentInfo: formData.parents ?
              {
                ...formData.parents,
                fatherName: {
                  first: formData.parents.fatherName.first,
                  middle: formData.parents.fatherName.middle,
                  last: formData.parents.fatherName.last,
                },
                motherName: {
                  first: formData.parents.motherName.first,
                  middle: formData.parents.motherName.middle,
                  last: formData.parents.motherName.last,
                }
              } as Prisma.JsonObject
              : Prisma.JsonNull,

            // Birth Information (if applicable).
            birthInformation: formData.birthInformation
              ? (formData.birthInformation as Prisma.JsonObject)
              : Prisma.JsonNull,

            // Medical Certificate.
            medicalCertificate: {
              causesOfDeath: formData.medicalCertificate?.causesOfDeath,
              maternalCondition:
                formData.medicalCertificate?.maternalCondition || null,
              externalCauses: formData.medicalCertificate?.externalCauses,
              attendant: formData.medicalCertificate?.attendant
                ? {
                  ...formData.medicalCertificate?.attendant,
                  duration: formData.medicalCertificate.attendant.duration
                    ? {
                      from: formData?.medicalCertificate?.attendant
                        ?.duration?.from!,
                      to: formData?.medicalCertificate?.attendant
                        ?.duration?.to!,
                    }
                    : null,
                  certification: formData.medicalCertificate.attendant
                    .certification
                    ? {
                      ...formData.medicalCertificate.attendant
                        .certification,
                      time: formData?.medicalCertificate?.attendant
                        ?.certification?.time!,
                      date: formData?.medicalCertificate?.attendant
                        ?.certification?.date!,
                      name: formData.medicalCertificate.attendant.certification
                        .name,
                      title: formData.medicalCertificate.attendant.certification
                        .title,
                      address: formData.medicalCertificate.attendant.certification
                    }
                    : null,
                }
                : null,
              autopsy: formData.medicalCertificate?.autopsy,
            } as Prisma.JsonObject,

            // Causes of Death (specific sections).
            causesOfDeath19a: formData.causesOfDeath19a as Prisma.JsonObject,
            causesOfDeath19b: formData.causesOfDeath19b as Prisma.JsonObject,

            // Certification of Death.
            certificationOfDeath: {
              hasAttended: formData.certificationOfDeath?.hasAttended,
              nameInPrint: formData.certificationOfDeath?.nameInPrint,
              titleOfPosition: formData.certificationOfDeath?.titleOfPosition,
              address: formData.certificationOfDeath?.address,
              date: safelyConvertDateToJSON(formData.certificationOfDeath?.date),
              healthOfficerNameInPrint:
                formData.certificationOfDeath?.nameInPrint,
            } as Prisma.JsonObject,

            // Review Information.
            reviewedBy: safelyConvertDateToJSON(formData?.reviewedBy?.date),

            // Optional Certificates.
            postmortemCertificate: formData.postmortemCertificate
              ? ({
                ...formData.postmortemCertificate,
                date: safelyConvertDateToJSON(
                  formData?.postmortemCertificate?.date
                ),
              } as Prisma.JsonObject)
              : Prisma.JsonNull,

            embalmerCertification: {
              nameInPrint: formData.embalmerCertification?.nameInPrint,
              nameOfDeceased: formData.embalmerCertification?.nameOfDeceased,
              licenseNo: formData.embalmerCertification?.licenseNo,
              issuedOn: formData?.embalmerCertification?.issuedOn,
              issuedAt: formData.embalmerCertification?.issuedAt,
              expiryDate: formData?.embalmerCertification?.expiryDate,
              address: formData.embalmerCertification?.address,
              titleDesignation: formData.embalmerCertification?.titleDesignation,
            } as Prisma.JsonObject,

            delayedRegistration: formData.delayedRegistration?.isDelayed
              ? ({
                isDelayed: formData.delayedRegistration.isDelayed,
                affiant: {
                  name: formData.delayedRegistration?.affiant?.name,
                  civilStatus:
                    formData.delayedRegistration?.affiant?.civilStatus,
                  residenceAddress:
                    formData.delayedRegistration?.affiant?.residenceAddress,
                  age: formData.delayedRegistration?.affiant?.age,
                } as Prisma.JsonObject,
                deceased: {
                  name: formData.delayedRegistration?.deceased?.name,
                  dateOfDeath: safelyConvertDateToJSON(
                    formData?.delayedRegistration?.deceased?.dateOfDeath
                  ),
                  diedOn: safelyConvertDateToJSON(
                    formData.delayedRegistration?.deceased?.diedOn
                  ),
                  placeOfDeath: formData?.delayedRegistration?.deceased
                    ?.placeOfDeath,
                  burialInfo: {
                    date: safelyConvertDateToJSON(
                      formData.delayedRegistration?.deceased?.burialInfo?.date
                    ),
                    place: formData.delayedRegistration?.deceased?.burialInfo
                      ?.place,
                    method:
                      formData.delayedRegistration?.deceased?.burialInfo
                        ?.method,
                  },
                } as Prisma.JsonObject,
                attendance: {
                  wasAttended:
                    formData.delayedRegistration?.attendance?.wasAttended,
                  attendedBy:
                    formData.delayedRegistration?.attendance?.attendedBy,
                },
                causeOfDeath: formData.delayedRegistration?.causeOfDeath,
                reasonForDelay: formData.delayedRegistration?.reasonForDelay,
                affidavitDate: safelyConvertDateToJSON(
                  formData?.delayedRegistration?.affidavitDate
                ),
                affidavitDatePlace: formData.delayedRegistration
                  ?.affidavitDatePlace,
                adminOfficer: {
                  name: formData.delayedRegistration?.adminOfficer?.name,
                  address: formData.delayedRegistration?.adminOfficer?.address,
                  position: formData.delayedRegistration?.adminOfficer?.position,
                },
                ctcInfo: {
                  dayOf: formData.delayedRegistration?.ctcInfo?.dayOf,
                  placeAt: formData.delayedRegistration?.ctcInfo?.placeAt,
                  number: formData.delayedRegistration?.ctcInfo?.number,
                  issuedOn: safelyConvertDateToJSON(
                    formData.delayedRegistration?.ctcInfo?.issuedOn
                  ),
                  issuedAt: formData.delayedRegistration?.ctcInfo?.issuedAt,
                } as Prisma.JsonObject,
              } as Prisma.JsonObject)
              : {},

            // Disposal Information.
            corpseDisposal: formData.corpseDisposal || '',
            burialPermit: {
              number: formData.burialPermit?.number,
              dateIssued: safelyConvertDateToJSON(
                formData?.burialPermit?.dateIssued
              ),
            } as Prisma.JsonObject,

            transferPermit: formData.transferPermit
              ? ({
                number: formData.transferPermit.number,
                dateIssued: safelyConvertDateToJSON(
                  formData?.transferPermit.dateIssued
                ),
              } as Prisma.JsonObject)
              : Prisma.JsonNull,

            cemeteryOrCrematory: {
              name: formData.cemeteryOrCrematory?.name,
              address: formData.cemeteryOrCrematory?.address,
            } as Prisma.JsonObject,

            // Informant Information.
            informant: {
              nameInPrint: formData.informant?.nameInPrint,
              relationshipToDeceased: formData.informant?.relationshipToDeceased,
              address: formData.informant?.address,
              date: formData.informant?.date,
            } as Prisma.JsonObject,

            remarks: formData.remarks,
          },
        });

        revalidatePath('/civil-registry');

        return {
          success: true,
          message: 'Death certificate submitted successfully',
          data: {
            baseFormId: baseForm.id,
            bookNumber,
            pageNumber,
          },
        };
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to submit death certificate form',
    };
  }
}
