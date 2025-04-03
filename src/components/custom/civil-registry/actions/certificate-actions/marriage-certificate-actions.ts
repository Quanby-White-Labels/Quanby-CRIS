// src/app/actions/certificate-actions/marriage-certificate-actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import {
  marriageCertificateSchema,
  MarriageCertificateFormValues,
} from '@/lib/types/zod-form-certificate/marriage-certificate-form-schema';
import { fileToBase64 } from '@/lib/utils/fileToBase64';
import { DocumentStatus, FormType, Prisma } from '@prisma/client';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { first } from 'lodash';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function submitMarriageCertificateForm(
  formData: MarriageCertificateFormValues
) {
  try {
    if (!formData) {
      throw new Error('No form data provided');
    }

    // Validate the form data against the Zod schema
    try {
      marriageCertificateSchema.parse(formData);
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
          where: { name: formData.receivedBy.nameInPrint },
        });
        const registeredByUser = await tx.user.findFirst({
          where: { name: formData.registeredByOffice.nameInPrint },
        });
        // Instead of throwing an error, assign null if a user is not found.
        const receivedById = receivedByUser ? receivedByUser.id : null;
        const registeredById = registeredByUser ? registeredByUser.id : null;

        // Use pagination details from the form data.
        const pageNumber = formData.pagination?.pageNumber || '';
        const bookNumber = formData.pagination?.bookNumber || '';

        // Determine if the registration is late.
        const isLateRegistered = Boolean(
          formData.affidavitForDelayed?.delayedRegistration
        );

        // Create the base registry form record.
        const baseForm = await tx.baseRegistryForm.create({
          data: {
            formNumber: '103', // Marriage certificate form number.
            formType: FormType.MARRIAGE,
            registryNumber: formData.registryNumber,
            province: formData.province,
            cityMunicipality: formData.cityMunicipality,
            pageNumber,
            bookNumber,
            dateOfRegistration: new Date(),
            isLateRegistered,
            status: DocumentStatus.PENDING,
            preparedById: null,
            verifiedById: null,
            preparedByName: null,
            preparedByPosition: null,
            preparedByDate: null,
            verifiedByName: null,
            receivedById: receivedById,
            receivedBy: formData.receivedBy.nameInPrint,
            receivedByPosition: formData.receivedBy.titleOrPosition,
            receivedByDate: formData.receivedBy.date!,
            registeredById: registeredById,
            registeredBy: formData.registeredByOffice.nameInPrint,
            registeredByPosition: formData.registeredByOffice.titleOrPosition,
            registeredByDate: formData.registeredByOffice.date!,
            remarks: formData.remarks,
          },
        });

        const safelyConvertDateToJSON = (date: Date | undefined | null) => {
          return date instanceof Date ? date.toISOString() : null;
        };
        // Helper function to convert Date to ISO string.
        const dateToJSON = (date: Date) => date.toISOString();

        // Create the MarriageCertificateForm record
        await tx.marriageCertificateForm.create({
          data: {
            baseFormId: baseForm.id,
            // Husband Information
            husbandFirstName: formData?.husbandName?.first || '',
            husbandMiddleName: formData?.husbandName?.middle,
            husbandLastName: formData?.husbandName?.last || '',
            husbandAge: formData.husbandAge,
            husbandDateOfBirth: dateToJSON(formData.husbandBirth || new Date()),
            husbandSex: formData.husbandSex,
            husbandCitizenship: formData.husbandCitizenship,
            husbandResidence: formData.husbandResidence,
            husbandReligion: formData.husbandReligion || null,
            husbandCivilStatus: formData?.husbandCivilStatus || '',
            husbandPlaceOfBirth: formData.husbandPlaceOfBirth as Prisma.JsonObject,

            // Husband Parents Information
            husbandFatherName: formData.husbandParents.fatherName as Prisma.JsonObject,
            husbandFatherCitizenship: formData.husbandParents.fatherCitizenship,
            husbandMotherMaidenName: formData.husbandParents.motherName as Prisma.JsonObject,
            husbandMotherCitizenship: formData.husbandParents.motherCitizenship,

            // Husband Consent Person
            husbandConsentPerson: {
              ...formData.husbandConsentPerson,
              name: formData.husbandConsentPerson.name
                ? {
                  first: formData.husbandConsentPerson.name.first,
                  middle: formData.husbandConsentPerson.name.middle,
                  last: formData.husbandConsentPerson.name.last
                } as Prisma.JsonObject
                : null,
              relationship: formData.husbandConsentPerson.relationship,
              residence: formData.husbandConsentPerson.residence as Prisma.JsonObject,
            } as Prisma.JsonObject,

            // Wife Information
            wifeFirstName: formData?.wifeName?.first || '',
            wifeMiddleName: formData.wifeName?.middle,
            wifeLastName: formData?.wifeName?.last || '',
            wifeAge: formData.wifeAge,
            wifeDateOfBirth: dateToJSON(formData.wifeBirth || new Date()),
            wifeSex: formData.wifeSex,
            wifeCitizenship: formData.wifeCitizenship,
            wifeResidence: formData.wifeResidence,
            wifeReligion: formData.wifeReligion || null,
            wifeCivilStatus: formData.wifeCivilStatus || '',
            wifePlaceOfBirth: formData.wifePlaceOfBirth as Prisma.JsonObject,

            // Wife Parents Information
            wifeFatherName: formData.wifeParents.fatherName as Prisma.JsonObject,
            wifeFatherCitizenship: formData.wifeParents.fatherCitizenship,
            wifeMotherMaidenName: formData.wifeParents.motherName as Prisma.JsonObject,
            wifeMotherCitizenship: formData.wifeParents.motherCitizenship,

            // Wife Consent Person
            wifeConsentPerson: {
              ...formData.wifeConsentPerson,
              name: formData.wifeConsentPerson.name as Prisma.JsonObject,
              relationship: formData.wifeConsentPerson.relationship,
              residence: formData.wifeConsentPerson.residence as Prisma.JsonObject,
            } as Prisma.JsonObject,

            // Contract Party
            contractDay: formData.contractDay || new Date(),

            husbandContractParty: {
              ...formData.husbandContractParty,
              agreement: formData.husbandContractParty.agreement,
            } as Prisma.JsonObject,
            wifeContractParty: {
              ...formData.wifeContractParty,
              agreement: formData.wifeContractParty.agreement,
            } as Prisma.JsonObject,

            // Marriage Details
            placeOfMarriage: formData.placeOfMarriage as Prisma.JsonObject,
            dateOfMarriage: dateToJSON(formData.dateOfMarriage || new Date()),
            timeOfMarriage: dateToJSON(formData.timeOfMarriage || new Date()),

            // Witnesses
            witnesses: formData.husbandWitnesses as InputJsonValue[],

            // Solemnizing Officer
            solemnizingOfficer: formData.solemnizingOfficer as Prisma.JsonObject,

            // Marriage License Details
            marriageLicenseDetails: {
              ...formData.marriageLicenseDetails,
              licenseNumber: formData.marriageLicenseDetails.licenseNumber,
              dateIssued: safelyConvertDateToJSON(formData.marriageLicenseDetails.dateIssued || new Date()),
              placeIssued: formData.marriageLicenseDetails.placeIssued,
              marriageAgreement: formData.marriageLicenseDetails.marriageAgreement,
            } as Prisma.JsonObject,

            // Marriage Article
            marriageArticle: {
              ...formData.marriageArticle,
              marriageArticle: formData.marriageArticle.marriageArticle,
              article: formData.marriageArticle.article,
            } as Prisma.JsonObject,

            marriageSettlement: formData.marriageSettlement,

            // Registered At Civil Registrar
            registeredByOffice: {
              ...formData.registeredByOffice,
              date: formData.registeredByOffice.date,
              nameInPrint: formData.registeredByOffice.nameInPrint,
              title: formData.registeredByOffice.titleOrPosition,
            } as Prisma.JsonObject,

            remarks: formData.remarks,

            // Affidavit of Solemnizing Officer
            affidavitOfSolemnizingOfficer: {
              solemnizingOfficerInformation: {
                officeName: formData.affidavitOfSolemnizingOfficer.solemnizingOfficerInformation.officeName,
                officerName: formData.affidavitOfSolemnizingOfficer.solemnizingOfficerInformation.officerName as Prisma.JsonObject,
                address: formData.affidavitOfSolemnizingOfficer.solemnizingOfficerInformation.address,
              } as Prisma.JsonObject,
              administeringOfficerInformation: {
                adminName: formData.affidavitOfSolemnizingOfficer.administeringOfficerInformation.adminName as Prisma.JsonObject,
                address: formData.affidavitOfSolemnizingOfficer.administeringOfficerInformation.address,
                position: formData.affidavitOfSolemnizingOfficer.administeringOfficerInformation.position,
              } as Prisma.JsonObject,
              a: {
                nameOfHusband: formData.affidavitOfSolemnizingOfficer.a?.nameOfHusband as Prisma.JsonObject,
                nameOfWife: formData.affidavitOfSolemnizingOfficer.a?.nameOfWife as Prisma.JsonObject,
              } as Prisma.JsonObject,
              b: {
                a: formData.affidavitOfSolemnizingOfficer.b.a,
                b: formData.affidavitOfSolemnizingOfficer.b.b,
                c: formData.affidavitOfSolemnizingOfficer.b.c,
                d: formData.affidavitOfSolemnizingOfficer.b.d,
                e: formData.affidavitOfSolemnizingOfficer.b.e,
              } as Prisma.JsonObject,
              c: formData.affidavitOfSolemnizingOfficer.c,
              d: {
                dayOf: safelyConvertDateToJSON(formData.affidavitOfSolemnizingOfficer.d.dayOf || new Date()),
                atPlaceExecute: {
                  st: formData.affidavitOfSolemnizingOfficer.d.atPlaceExecute.street,
                  barangay: formData.affidavitOfSolemnizingOfficer.d.atPlaceExecute.barangay,
                  cityMunicipality: formData.affidavitOfSolemnizingOfficer.d.atPlaceExecute.cityMunicipality,
                  province: formData.affidavitOfSolemnizingOfficer.d.atPlaceExecute.province,
                  country: formData.affidavitOfSolemnizingOfficer.d.atPlaceExecute.country,
                } as Prisma.JsonObject,
              } as Prisma.JsonObject,
              dateSworn: {
                dayOf: safelyConvertDateToJSON(formData.affidavitOfSolemnizingOfficer.dateSworn.dayOf || new Date()),
                atPlaceOfSworn: {
                  st: formData.affidavitOfSolemnizingOfficer.dateSworn.atPlaceOfSworn.street,
                  barangay: formData.affidavitOfSolemnizingOfficer.dateSworn.atPlaceOfSworn.barangay,
                  cityMunicipality: formData.affidavitOfSolemnizingOfficer.dateSworn.atPlaceOfSworn.cityMunicipality,
                  province: formData.affidavitOfSolemnizingOfficer.dateSworn.atPlaceOfSworn.province,
                  country: formData.affidavitOfSolemnizingOfficer.dateSworn.atPlaceOfSworn.country,
                } as Prisma.JsonObject,
                ctcInfo: {
                  number: formData.affidavitOfSolemnizingOfficer.dateSworn.ctcInfo.number,
                  dateIssued: safelyConvertDateToJSON(formData.affidavitOfSolemnizingOfficer.dateSworn.ctcInfo.dateIssued || new Date()),
                  placeIssued: formData.affidavitOfSolemnizingOfficer.dateSworn.ctcInfo.placeIssued,
                } as Prisma.JsonObject,
              } as Prisma.JsonObject,
            } as Prisma.JsonObject,

            // Affidavit of Delayed Registration
            affidavitOfdelayedRegistration: formData.affidavitForDelayed?.delayedRegistration === 'Yes'
              ? ({
                ...formData.affidavitForDelayed,
                delayedRegistration: 'Yes',
                administeringInformation: {
                  adminName: formData.affidavitForDelayed.administeringInformation?.adminName,
                  position: formData.affidavitForDelayed.administeringInformation?.position,
                  adminAddress: formData.affidavitForDelayed.administeringInformation?.adminAddress
                } as Prisma.JsonObject,
                applicantInformation: {
                  nameOfApplicant: formData.affidavitForDelayed?.applicantInformation?.nameOfApplicant,
                  postalCode: formData.affidavitForDelayed?.applicantInformation?.postalCode,
                  applicantAddress: {
                    cityMunicipality: formData.affidavitForDelayed?.applicantInformation?.applicantAddress?.cityMunicipality,
                    province: formData.affidavitForDelayed?.applicantInformation?.applicantAddress?.province,
                    country: formData.affidavitForDelayed?.applicantInformation?.applicantAddress?.country,
                    st: formData.affidavitForDelayed?.applicantInformation?.applicantAddress?.st,
                    barangay: formData.affidavitForDelayed?.applicantInformation?.applicantAddress?.barangay,
                  } as Prisma.JsonObject,
                } as Prisma.JsonObject,
                a: {
                  a: {
                    placeOfMarriage: formData.affidavitForDelayed?.a?.a?.placeOfMarriage,
                    dateOfMarriage: formData.affidavitForDelayed?.a?.a?.dateOfMarriage,
                    agreement: formData.affidavitForDelayed?.a?.a?.agreement,
                    nameOfPartner: formData.affidavitForDelayed?.a?.a?.nameOfPartner as Prisma.JsonObject,
                  } as Prisma.JsonObject,
                  b: {
                    placeOfMarriage: formData.affidavitForDelayed?.a?.b?.placeOfMarriage,
                    dateOfMarriage: formData.affidavitForDelayed?.a?.b?.dateOfMarriage,
                    agreement: formData.affidavitForDelayed?.a?.b?.agreement,
                    nameOfHusband: formData.affidavitForDelayed?.a?.b?.nameOfHusband as Prisma.JsonObject,
                    nameOfWife: formData.affidavitForDelayed?.a?.b?.nameOfWife as Prisma.JsonObject,
                  } as Prisma.JsonObject
                } as Prisma.JsonObject,
                b: {
                  solemnizedBy: formData.affidavitForDelayed?.b?.solemnizedBy,
                  sector: formData.affidavitForDelayed?.b?.sector,
                } as Prisma.JsonObject,
                c: {
                  a: {
                    licenseNo: formData.affidavitForDelayed?.c?.a?.licenseNo,
                    dateIssued: safelyConvertDateToJSON(formData.affidavitForDelayed?.c?.a?.dateIssued || new Date()),
                    placeOfSolemnizedMarriage: formData.affidavitForDelayed?.c?.a?.placeOfSolemnizedMarriage,
                  } as Prisma.JsonObject,
                  b: {
                    underArticle: formData.affidavitForDelayed?.c?.b?.underArticle,
                  } as Prisma.JsonObject,
                } as Prisma.JsonObject,
                d: {
                  husbandCitizenship: formData.affidavitForDelayed?.d?.husbandCitizenship,
                  wifeCitizenship: formData.affidavitForDelayed?.d?.wifeCitizenship,
                } as Prisma.JsonObject,
                e: formData.affidavitForDelayed?.e,
                f: {
                  date: formData.affidavitForDelayed?.f?.date
                    ? safelyConvertDateToJSON(formData.affidavitForDelayed?.f?.date || new Date())
                    : null,
                  place: {
                    cityMunicipality: formData.affidavitForDelayed?.f?.place?.cityMunicipality,
                    province: formData.affidavitForDelayed?.f?.place?.province,
                    country: formData.affidavitForDelayed?.f?.place?.country,
                    barangay: formData.affidavitForDelayed?.f?.place?.barangay,
                    st: formData.affidavitForDelayed?.f?.place?.st,
                  } as Prisma.JsonObject,
                } as Prisma.JsonObject,
                dateSworn: {
                  dayOf: safelyConvertDateToJSON(formData.affidavitForDelayed?.dateSworn?.dayOf || new Date()),
                  atPlaceOfSworn: {
                    cityMunicipality: formData.affidavitForDelayed?.dateSworn?.atPlaceOfSworn?.cityMunicipality,
                    province: formData.affidavitForDelayed?.dateSworn?.atPlaceOfSworn?.province,
                    country: formData.affidavitForDelayed?.dateSworn?.atPlaceOfSworn?.country,
                    barangay: formData.affidavitForDelayed?.dateSworn?.atPlaceOfSworn?.barangay,
                    st: formData.affidavitForDelayed?.dateSworn?.atPlaceOfSworn?.st,
                  } as Prisma.JsonObject,
                  ctcInfo: {
                    number: formData.affidavitForDelayed?.dateSworn?.ctcInfo?.number,
                    dateIssued: safelyConvertDateToJSON(formData.affidavitForDelayed?.dateSworn?.ctcInfo?.dateIssued || new Date()),
                    placeIssued: formData.affidavitForDelayed?.dateSworn?.ctcInfo?.placeIssued,
                  } as Prisma.JsonObject,
                } as Prisma.JsonObject,
              } as Prisma.JsonObject)
              : { delayedRegistration: 'No' },
          },
        });

        // Revalidate the path for updated content
        revalidatePath('/marriage-certificates');

        return {
          success: true,
          message: 'Marriage certificate submitted successfully',
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
          : 'Failed to submit marriage certificate form',
    };
  }
}
