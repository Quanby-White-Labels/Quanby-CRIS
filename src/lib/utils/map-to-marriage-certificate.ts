import { BaseRegistryFormWithRelations } from '@/hooks/civil-registry-action';
import { MarriageCertificateFormValues } from '../types/zod-form-certificate/marriage-certificate-form-schema';

// Define a type for the Marriage certificate form structure based on your Prisma model
interface MarriageCertificateFormData {
    id?: string;
    baseFormId?: string;
    husbandFirstName?: string;
    husbandMiddleName?: string;
    husbandLastName?: string;
    husbandDateOfBirth?: Date;
    husbandAge?: number;
    husbandPlaceOfBirth?: any;
    husbandSex?: string;
    husbandCitizenship?: string;
    husbandResidence?: string;
    husbandReligion?: string;
    husbandCivilStatus?: string;
    husbandFatherName?: any;
    husbandFatherCitizenship?: string;
    husbandMotherMaidenName?: any;
    husbandMotherCitizenship?: string;
    husbandConsentPerson?: any;

    wifeFirstName?: string;
    wifeMiddleName?: string;
    wifeLastName?: string;
    wifeDateOfBirth?: Date;
    wifeAge?: number;
    wifePlaceOfBirth?: any;
    wifeSex?: string;
    wifeCitizenship?: string;
    wifeResidence?: string;
    wifeReligion?: string;
    wifeCivilStatus?: string;
    wifeFatherName?: any;
    wifeFatherCitizenship?: string;
    wifeMotherMaidenName?: any;
    wifeMotherCitizenship?: string;
    wifeConsentPerson?: any;
    remarks?: string;

    placeOfMarriage?: any;
    dateOfMarriage?: Date;
    timeOfMarriage?: Date;
    contractDay?: Date;

    marriageSettlement?: boolean;
    husbandContractParty?: any;
    wifeContractParty?: any;
    marriageLicenseDetails?: any;
    marriageArticle?: any;
    executiveOrderApplied?: boolean;
    solemnizingOfficer?: any;
    witnesses?: any[];

    registeredByOffice?: any;
    receivedByOffice?: any;
    preparedByOffice?: any;


    affidavitOfSolemnizingOfficer?: any;
    affidavitOfdelayedRegistration?: any;
    baseForm?: any;
}

// Helper function to map BaseRegistryFormWithRelations to MarriageCertificateFormValues
// Helper function to map BaseRegistryFormWithRelations to MarriageCertificateFormValues
export const mapToMarriageCertificateValues = (
    form: BaseRegistryFormWithRelations
): Partial<MarriageCertificateFormValues> => {
    // Extract the Marriage certificate form data with proper typing
    const marriageForm =
        (form.marriageCertificateForm as MarriageCertificateFormData) || {};

    // Helper for parsing dates safely
    const parseDateSafely = (
        dateValue: Date | string | null | undefined
    ): Date | undefined => {
        if (!dateValue) return undefined;
        try {
            return new Date(dateValue);
        } catch (error) {
            console.error('Error parsing date:', error);
            return undefined;
        }
    };

    // Helper to ensure non-null string values
    const ensureString = (value: any): string => {
        if (value === null || value === undefined) return '';
        return String(value);
    };

    // Helper to validate civil status values - adjusted to match expected schema types
    const validateCivilStatus = (
        status: any
    ): 'Single' | 'Widowed' | 'Divorced' | undefined => {
        // Map old values to new expected values
        const statusMap: Record<string, 'Single' | 'Widowed' | 'Divorced' | undefined> = {
            'Single': 'Single',
            'Married': 'Single', // Map Married to Single as it's not allowed in the schema
            'Widow': 'Widowed',
            'Widower': 'Widowed',
            'Annulled': 'Divorced', // Map Annulled to Divorced as it's similar
            'Divorced': 'Divorced'
        };

        if (status && statusMap[status]) {
            return statusMap[status];
        }

        return undefined;
    };

    // For husband, we allow Male only
    const validateHusbandSex = (sex: any): 'Male' | undefined => {
        return sex === 'Male' ? 'Male' : undefined;
    };

    // For wife, we allow Female only
    const validateWifeSex = (sex: any): 'Female' | undefined => {
        return sex === 'Female' ? 'Female' : undefined;
    };

    // Validate delayed registration value to ensure it's "Yes" or "No"
    const validateDelayedRegistration = (value: any): 'Yes' | 'No' => {
        // If the value is truthy (including 'Yes', true, 1, etc.) and not explicitly 'No'
        if (value && value !== 'No') {
            return 'Yes';
        }
        return 'No';
    };

    const validateSector = (sector: any):
        | 'religious-ceremony'
        | 'civil-ceremony'
        | 'Muslim-rites'
        | 'tribal-rites' | undefined => {
        const validSectors = [
            'religious-ceremony',
            'civil-ceremony',
            'Muslim-rites',
            'tribal-rites',
        ];

        if (validSectors.includes(sector)) {
            return sector as
                | 'religious-ceremony'
                | 'civil-ceremony'
                | 'Muslim-rites'
                | 'tribal-rites';
        }

        return undefined;
    };

    // Create empty objects for nested structures if they don't exist
    const createNameObject = (nameObj: any) => {
        if (!nameObj) return { first: '', middle: '', last: '' };
        return {
            first: ensureString(nameObj.first),
            middle: ensureString(nameObj.middle),
            last: ensureString(nameObj.last)
        };
    };

    const createAddressObject = (addressObj?: any) => {
        if (!addressObj || typeof addressObj !== 'object') {
            return { cityMunicipality: '', province: '', barangay: '', houseNo: '', street: '', st: '', country: '' };
        }

        const ensureString = (value: any) => (typeof value === 'string' ? value : value?.toString() ?? '');

        return {
            province: addressObj.province
                ? ensureString(addressObj.province?.value ?? addressObj.province)
                : '', // Always a string
            barangay: addressObj.barangay
                ? ensureString(addressObj.barangay?.value ?? addressObj.barangay)
                : '',
            cityMunicipality: addressObj.cityMunicipality
                ? ensureString(addressObj.cityMunicipality?.value ?? addressObj.cityMunicipality)
                : '', // Always a string
            houseNo: addressObj.houseNo
                ? ensureString(addressObj.houseNo?.value ?? addressObj.houseNo)
                : '',
            street: addressObj.street
                ? ensureString(addressObj.street?.value ?? addressObj.street)
                : '',
            st: addressObj.st
                ? ensureString(addressObj.st?.value ?? addressObj.st)
                : '',
            country: addressObj.country
                ? ensureString(addressObj.country?.value ?? addressObj.country)
                : '',
            address: addressObj.address
                ? ensureString(addressObj.address?.value ?? addressObj.address)
                : '',
            internationalAddress: addressObj.internationalAddress
                ? ensureString(addressObj.internationalAddress?.value ?? addressObj.internationalAddress)
                : '',
            residence: addressObj.residence
                ? ensureString(addressObj.residence?.value ?? addressObj.residence)
                : ''

        };
    };

    // Create a properly structured result object that matches the expected schema
    const result: Partial<MarriageCertificateFormValues> = {
        // ID information
        id: ensureString(form.id),

        // Registry information
        registryNumber: ensureString(form.registryNumber),
        province: ensureString(form.province),
        cityMunicipality: ensureString(form.cityMunicipality),
        pagination: {
            pageNumber: ensureString(form.pageNumber),
            bookNumber: ensureString(form.bookNumber),
        },
        remarks: ensureString(marriageForm.remarks || form.remarks),

        // Husband information
        husbandName: {
            first: typeof marriageForm.husbandFirstName === 'object' && marriageForm.husbandFirstName
                ? ensureString(marriageForm.husbandFirstName)
                : ensureString(marriageForm.husbandFirstName),
            middle: typeof marriageForm.husbandMiddleName === 'object' && marriageForm.husbandMiddleName
                ? ensureString(marriageForm.husbandMiddleName)
                : ensureString(marriageForm.husbandMiddleName),
            last: typeof marriageForm.husbandLastName === 'object' && marriageForm.husbandLastName
                ? ensureString(marriageForm.husbandLastName)
                : ensureString(marriageForm.husbandLastName),
        },
        husbandAge: marriageForm.husbandAge || 0,
        husbandBirth: parseDateSafely(marriageForm.husbandDateOfBirth),
        husbandPlaceOfBirth: createAddressObject(marriageForm.husbandPlaceOfBirth),
        husbandSex: validateHusbandSex(marriageForm?.husbandSex) || 'Male',
        husbandCitizenship: ensureString(marriageForm.husbandCitizenship),
        husbandResidence: ensureString(marriageForm.husbandResidence),
        husbandReligion: ensureString(marriageForm.husbandReligion),
        husbandCivilStatus: validateCivilStatus(marriageForm.husbandCivilStatus) || 'Single',
        husbandParents: {
            fatherName: createNameObject(marriageForm.husbandFatherName),
            fatherCitizenship: ensureString(marriageForm.husbandFatherCitizenship),
            motherName: createNameObject(marriageForm.husbandMotherMaidenName),
            motherCitizenship: ensureString(marriageForm.husbandMotherCitizenship)
        },
        husbandConsentPerson: {
            name: createNameObject(marriageForm.husbandConsentPerson?.name),
            relationship: ensureString(marriageForm.husbandConsentPerson?.relationship),
            residence: createAddressObject(marriageForm.husbandConsentPerson?.residence)
        },

        // Wife information
        wifeName: {
            first: typeof marriageForm.wifeFirstName === 'object' && marriageForm.wifeFirstName
                ? ensureString(marriageForm.wifeFirstName)
                : ensureString(marriageForm.wifeFirstName),
            middle: typeof marriageForm.wifeMiddleName === 'object' && marriageForm.wifeMiddleName
                ? ensureString(marriageForm.wifeMiddleName)
                : ensureString(marriageForm.wifeMiddleName),
            last: typeof marriageForm.wifeLastName === 'object' && marriageForm.wifeLastName
                ? ensureString(marriageForm.wifeLastName)
                : ensureString(marriageForm.wifeLastName),
        },
        wifeAge: marriageForm.wifeAge || 0,
        wifeBirth: parseDateSafely(marriageForm.wifeDateOfBirth),
        wifePlaceOfBirth: createAddressObject(marriageForm.wifePlaceOfBirth),
        wifeSex: validateWifeSex(marriageForm?.wifeSex) || 'Female',
        wifeCitizenship: ensureString(marriageForm.wifeCitizenship),
        wifeResidence: ensureString(marriageForm.wifeResidence),
        wifeReligion: ensureString(marriageForm.wifeReligion),
        wifeCivilStatus: validateCivilStatus(marriageForm.wifeCivilStatus) || 'Single',
        wifeParents: {
            fatherName: createNameObject(marriageForm.wifeFatherName),
            fatherCitizenship: ensureString(marriageForm.wifeFatherCitizenship),
            motherName: createNameObject(marriageForm.wifeMotherMaidenName),
            motherCitizenship: ensureString(marriageForm.wifeMotherCitizenship)
        },
        wifeConsentPerson: {
            name: createNameObject(marriageForm.wifeConsentPerson?.name),
            relationship: ensureString(marriageForm.wifeConsentPerson?.relationship),
            residence: createAddressObject(marriageForm.wifeConsentPerson?.residence)
        },

        // Marriage details
        placeOfMarriage: createAddressObject(marriageForm.placeOfMarriage),
        dateOfMarriage: parseDateSafely(marriageForm.dateOfMarriage),
        timeOfMarriage: parseDateSafely(marriageForm.timeOfMarriage),
        contractDay: parseDateSafely(marriageForm.contractDay),
        marriageSettlement: marriageForm.marriageSettlement || false,
        husbandContractParty: {
            // signature: ensureString(marriageForm.husbandContractParty?.signature),
            agreement: Boolean(marriageForm.husbandContractParty?.agreement)
        },
        wifeContractParty: {
            // signature: ensureString(marriageForm.wifeContractParty?.signature),
            agreement: Boolean(marriageForm.wifeContractParty?.agreement)
        },

        // License details
        marriageLicenseDetails: {
            dateIssued: parseDateSafely(marriageForm.marriageLicenseDetails?.dateIssued),
            placeIssued: ensureString(marriageForm.marriageLicenseDetails?.placeIssued),
            licenseNumber: ensureString(marriageForm.marriageLicenseDetails?.licenseNumber),
            marriageAgreement: marriageForm.marriageLicenseDetails?.marriageAgreement || false
        },
        marriageArticle: {
            article: ensureString(marriageForm.marriageArticle?.article),
            marriageArticle: marriageForm.marriageArticle?.marriageArticle || false
        },

        // Solemnizing officer
        solemnizingOfficer: {
            name: ensureString(marriageForm.solemnizingOfficer?.name),
            position: ensureString(marriageForm.solemnizingOfficer?.position),
            //signature: ensureString(marriageForm.solemnizingOfficer?.signature),
            registryNoExpiryDate: ensureString(marriageForm.solemnizingOfficer?.registryNoExpiryDate)
        },

        // Witness information
        husbandWitnesses: Array.isArray(marriageForm.witnesses) && marriageForm.witnesses.length > 0
            ? marriageForm.witnesses.slice(0, 2).map(w => ({
                name: ensureString(w.name),
                signature: ensureString(w.signature)
            }))
            : [{ name: '', signature: '' }, { name: '', signature: '' }],
        wifeWitnesses: Array.isArray(marriageForm.witnesses) && marriageForm.witnesses.length > 2
            ? marriageForm.witnesses.slice(2, 4).map(w => ({
                name: ensureString(w.name),
                signature: ensureString(w.signature)
            }))
            : [{ name: '', signature: '' }, { name: '', signature: '' }],

        // preparedBy: {
        //     // signature: ensureString(marriageForm.preparedByOffice?.signature),
        //     nameInPrint: ensureString(form.preparedByName),
        //     titleOrPosition: ensureString(form.preparedByPosition),
        //     date: parseDateSafely(form.preparedByDate),
        // },

        receivedBy: {
            // signature: ensureString(marriageForm.receivedByOffice?.signature),
            nameInPrint: ensureString(form.receivedBy),
            titleOrPosition: ensureString(form.receivedByPosition),
            date: parseDateSafely(form.receivedByDate),
        },

        registeredByOffice: {
            // signature: ensureString(marriageForm.registeredByOffice?.signature),
            nameInPrint: ensureString(marriageForm.registeredByOffice?.nameInPrint),
            titleOrPosition: ensureString(marriageForm.registeredByOffice?.titleOrPosition),
            date: parseDateSafely(marriageForm.registeredByOffice?.date),
        },

        // Affidavit information
        affidavitOfSolemnizingOfficer: {
            solemnizingOfficerInformation: {
                officeName: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.solemnizingOfficerInformation?.officeName),
                officerName: createNameObject(marriageForm.affidavitOfSolemnizingOfficer?.solemnizingOfficerInformation?.officerName),
                //signature: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.solemnizingOfficerInformation?.signature),
                address: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.solemnizingOfficerInformation?.address),
            },
            administeringOfficerInformation: {
                adminName: createNameObject(marriageForm.affidavitOfSolemnizingOfficer?.administeringOfficerInformation?.adminName),
                position: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.administeringOfficerInformation?.position),
                address: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.administeringOfficerInformation?.address),
                //signature: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.administeringOfficerInformation?.signature?.signature),
            },
            a: {
                nameOfHusband: createNameObject(marriageForm.affidavitOfSolemnizingOfficer?.a?.nameOfHusband),
                nameOfWife: createNameObject(marriageForm.affidavitOfSolemnizingOfficer?.a?.nameOfWife)
            },
            b: {
                a: marriageForm.affidavitOfSolemnizingOfficer?.b?.a || false,
                b: marriageForm.affidavitOfSolemnizingOfficer?.b?.b || false,
                c: marriageForm.affidavitOfSolemnizingOfficer?.b?.c || false,
                d: marriageForm.affidavitOfSolemnizingOfficer?.b?.d || false,
                e: marriageForm.affidavitOfSolemnizingOfficer?.b?.e || false
            },
            c: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.c),
            d: {
                dayOf: parseDateSafely(marriageForm.affidavitOfSolemnizingOfficer?.d?.dayOf),
                atPlaceExecute: createAddressObject(marriageForm.affidavitOfSolemnizingOfficer?.d?.atPlaceExecute)
            },
            dateSworn: {
                dayOf: parseDateSafely(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.dayOf),
                atPlaceOfSworn: createAddressObject(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.atPlaceOfSworn),
                ctcInfo: {
                    number: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.ctcInfo?.number),
                    dateIssued: parseDateSafely(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.ctcInfo?.dateIssued),
                    placeIssued: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.ctcInfo?.placeIssued)
                }
            }
        }
    };

    // Add delayed registration if available - with proper type handling
    if (marriageForm.affidavitOfdelayedRegistration.delayedRegistration === 'Yes') {
        result.affidavitForDelayed = {
            // Ensure this is 'Yes' or 'No' as required by the schema
            delayedRegistration: validateDelayedRegistration(
                marriageForm.affidavitOfdelayedRegistration.delayedRegistration || 'Yes'
            ),
            administeringInformation: {
                //adminSignature: ensureString(marriageForm.affidavitOfdelayedRegistration.administeringInformation?.adminSignature),
                adminName: ensureString(marriageForm.affidavitOfdelayedRegistration.administeringInformation?.adminName),
                position: ensureString(marriageForm.affidavitOfdelayedRegistration.administeringInformation?.position),
                adminAddress: ensureString(marriageForm.affidavitOfdelayedRegistration.administeringInformation?.adminAddress),
            },
            applicantInformation: {
                //signatureOfApplicant: ensureString(marriageForm.affidavitOfdelayedRegistration.applicantInformation?.signatureOfApplicant),
                nameOfApplicant: ensureString(marriageForm.affidavitOfdelayedRegistration.applicantInformation?.nameOfApplicant),
                postalCode: ensureString(marriageForm.affidavitOfdelayedRegistration.applicantInformation?.postalCode),
                applicantAddress: createAddressObject(marriageForm.affidavitOfdelayedRegistration.applicantInformation?.applicantAddress),
            },
            a: {
                a: {
                    agreement: marriageForm.affidavitOfdelayedRegistration.a?.a?.agreement || false,
                    nameOfPartner: {
                        first: ensureString(marriageForm.affidavitOfdelayedRegistration.a?.a?.nameOfPartner?.first),
                        middle: ensureString(marriageForm.affidavitOfdelayedRegistration.a?.a?.nameOfPartner?.middle),
                        last: ensureString(marriageForm.affidavitOfdelayedRegistration.a?.a?.nameOfPartner?.last),
                    },
                    placeOfMarriage: '',
                    dateOfMarriage: undefined
                },
                b: {
                    agreement: marriageForm.affidavitOfdelayedRegistration.a?.b?.agreement || false,
                    nameOfHusband: {
                        first: ensureString(marriageForm.affidavitOfdelayedRegistration.a?.b?.nameOfHusband?.first),
                        middle: ensureString(marriageForm.affidavitOfdelayedRegistration.a?.b?.nameOfHusband?.middle),
                        last: ensureString(marriageForm.affidavitOfdelayedRegistration.a?.b?.nameOfHusband?.last),
                    },
                    nameOfWife: {
                        first: ensureString(marriageForm.affidavitOfdelayedRegistration.a?.b?.nameOfWife?.first),
                        middle: ensureString(marriageForm.affidavitOfdelayedRegistration.a?.b?.nameOfWife?.middle),
                        last: ensureString(marriageForm.affidavitOfdelayedRegistration.a?.b?.nameOfWife?.last),
                    },
                    placeOfMarriage: ensureString(marriageForm.affidavitOfdelayedRegistration.a?.b?.placeOfMarriage),
                    dateOfMarriage: parseDateSafely(marriageForm.affidavitOfdelayedRegistration.a?.b?.dateOfMarriage),
                }
            },
            b: {
                solemnizedBy: ensureString(marriageForm.affidavitOfdelayedRegistration.b?.solemnizedBy),
                sector: validateSector(marriageForm.affidavitOfdelayedRegistration.b?.sector) || 'religious-ceremony',
            },
            c: {
                a: {
                    licenseNo: ensureString(marriageForm.affidavitOfdelayedRegistration.c?.a?.licenseNo),
                    dateIssued: parseDateSafely(marriageForm.affidavitOfdelayedRegistration.c?.a?.dateIssued),
                    placeOfSolemnizedMarriage: ensureString(marriageForm.affidavitOfdelayedRegistration.c?.a?.placeOfSolemnizedMarriage),
                },
                b: {
                    underArticle: ensureString(marriageForm.affidavitOfdelayedRegistration.c?.b?.underArticle),
                }
            },
            d: {
                husbandCitizenship: ensureString(marriageForm.affidavitOfdelayedRegistration.d?.husbandCitizenship),
                wifeCitizenship: ensureString(marriageForm.affidavitOfdelayedRegistration.d?.wifeCitizenship),
            },
            e: ensureString(marriageForm.affidavitOfdelayedRegistration.e),
            f: {
                date: parseDateSafely(marriageForm.affidavitOfdelayedRegistration.f?.date),
                place: createAddressObject(marriageForm.affidavitOfdelayedRegistration.f?.place),
            },
            dateSworn: {
                dayOf: parseDateSafely(marriageForm.affidavitOfdelayedRegistration.dateSworn?.dayOf),
                atPlaceOfSworn: createAddressObject(marriageForm.affidavitOfdelayedRegistration.dateSworn?.atPlaceOfSworn),
                ctcInfo: {
                    number: ensureString(marriageForm.affidavitOfdelayedRegistration.dateSworn?.ctcInfo?.number),
                    dateIssued: parseDateSafely(marriageForm.affidavitOfdelayedRegistration.dateSworn?.ctcInfo?.dateIssued),
                    placeIssued: ensureString(marriageForm.affidavitOfdelayedRegistration.dateSworn?.ctcInfo?.placeIssued),
                }
            }
        };
    } else {
        result.affidavitForDelayed = {
            delayedRegistration: 'No'
        };
    }

    return result;

};



