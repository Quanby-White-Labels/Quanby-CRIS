'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BaseRegistryFormWithRelations } from '@/hooks/civil-registry-action';
import { useBirthCertificateForm } from '@/hooks/form-certificates-hooks/useBirthCertificateForm';
import type { BirthCertificateFormValues } from '@/lib/types/zod-form-certificate/birth-certificate-form-schema';
import { FormType } from '@prisma/client';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import DelayedRegistrationForm from '../../../forms/certificates/form-cards/birth-cards/affidavit-for-delayed-registration';
import AffidavitOfPaternityForm from '../../../forms/certificates/form-cards/birth-cards/affidavit-of-paternity';
import AttendantInformationCard from '../../../forms/certificates/form-cards/birth-cards/attendant-information';
import CertificationOfInformantCard from '../../../forms/certificates/form-cards/birth-cards/certification-of-informant';
import ChildInformationCard from '../../../forms/certificates/form-cards/birth-cards/child-information-card';
import FatherInformationCard from '../../../forms/certificates/form-cards/birth-cards/father-information-card';
import MarriageInformationCard from '../../../forms/certificates/form-cards/birth-cards/marriage-parents-card';
import MotherInformationCard from '../../../forms/certificates/form-cards/birth-cards/mother-information-card';
import { PaginationInputs } from '../../../forms/certificates/form-cards/shared-components/pagination-inputs';
import {
  PreparedByCard,
  ReceivedByCard,
  RegisteredAtOfficeCard,
} from '../../../forms/certificates/form-cards/shared-components/processing-details-cards';
import RegistryInformationCard from '../../../forms/certificates/form-cards/shared-components/registry-information-card';
import RemarksCard from '../../../forms/certificates/form-cards/shared-components/remarks-card';
import { useState } from 'react';

interface EditCivilRegistryFormInlineProps {
  form: BaseRegistryFormWithRelations;
  onSaveAction: (updatedForm: BaseRegistryFormWithRelations) => Promise<void>;
  editType: 'BIRTH' | 'DEATH' | 'MARRIAGE';
  onCancel: () => void;
}

interface ChildName {
  first: string;
  middle: string;
  last: string;
}

interface MotherName {
  first: string;
  middle: string;
  last: string;
}

interface FatherName {
  first: string;
  middle: string;
  last: string;
}

interface PlaceOfBirth {
  houseNo: string;
  street: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  country: string;
  hospital: string;
}

interface MotherResidence {
  houseNo: string;
  street: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  country: string;
}

interface FatherResidence {
  houseNo: string;
  street: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  country: string;
}

interface MarriagePlace {
  houseNo: string;
  st: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  country: string;
}

interface ParentMarriage {
  date: Date | "Not Married" | "Forgotten";
  place: MarriagePlace;
}

export function EditBirthCivilRegistryFormInline({
  form,
  onSaveAction,
  editType,
  onCancel,
}: EditCivilRegistryFormInlineProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { t } = useTranslation();

  // Helper function to safely parse dates
  const parseDateSafely = (dateValue: Date | null): Date => {
    if (!dateValue) return new Date();
    return dateValue;
  };

  // Utility: parse raw residence if provided as JSON string
  const parseResidence = (rawResidence: unknown): any => {
    if (typeof rawResidence === 'string') {
      try {
        return JSON.parse(rawResidence);
      } catch {
        return {};
      }
    }
    return rawResidence;
  };

// Helper to conditionally merge original and updated residence objects.
const mergeResidence = (
  original: Record<string, string>,
  updated: Record<string, string> = {},
  streetField: 'street' | 'st' = 'st'
): Record<string, string> => {
  let mergedStreet = '';
  if (streetField === 'street') {
    // For addresses that may have either a "st" or "street" field.
    mergedStreet =
      updated.st?.trim() ||
      updated.street?.trim() ||
      original.street ||
      original.st ||
      '';
  } else {
    // For addresses that only use "st"
    mergedStreet = updated.st?.trim() || original.st || '';
  }

  return {
    houseNo: updated.houseNo?.trim() ? updated.houseNo : original.houseNo,
    [streetField]: mergedStreet,
    barangay: updated.barangay?.trim() ? updated.barangay : original.barangay,
    cityMunicipality: updated.cityMunicipality?.trim()
      ? updated.cityMunicipality
      : original.cityMunicipality,
    province: updated.province?.trim() ? updated.province : original.province,
    country: updated.country?.trim() ? updated.country : original.country,
  };
};

  

  // Map the form data to the certificate values with proper type guarding.
  const mapToBirthCertificateValues = (
    form: BaseRegistryFormWithRelations
  ): Partial<BirthCertificateFormValues> => {
    // Child name
    const rawChildName = form.birthCertificateForm?.childName;
    let childName: ChildName = { first: '', middle: '', last: '' };
    if (
      rawChildName &&
      typeof rawChildName === 'object' &&
      !Array.isArray(rawChildName) &&
      'first' in rawChildName &&
      'middle' in rawChildName &&
      'last' in rawChildName
    ) {
      childName = rawChildName as unknown as ChildName;
    }

    // Mother name
    const rawMotherName = form.birthCertificateForm?.motherMaidenName;
    let motherName: MotherName = { first: '', middle: '', last: '' };
    if (
      rawMotherName &&
      typeof rawMotherName === 'object' &&
      !Array.isArray(rawMotherName) &&
      'first' in rawMotherName &&
      'middle' in rawMotherName &&
      'last' in rawMotherName
    ) {
      motherName = rawMotherName as unknown as MotherName;
    }

    // Father name
    const rawFatherName = form.birthCertificateForm?.fatherName;
    let fatherName: FatherName = { first: '', middle: '', last: '' };
    if (
      rawFatherName &&
      typeof rawFatherName === 'object' &&
      !Array.isArray(rawFatherName) &&
      'first' in rawFatherName &&
      'middle' in rawFatherName &&
      'last' in rawFatherName
    ) {
      fatherName = rawFatherName as unknown as FatherName;
    }

    // Place of Birth mapping
    const rawPlaceOfBirth = form.birthCertificateForm?.placeOfBirth;
    let placeOfBirth: PlaceOfBirth = {
      houseNo: '',
      street: '',
      barangay: '',
      cityMunicipality: '',
      province: '',
      country: '',
      hospital: '',
    };
    if (
      rawPlaceOfBirth &&
      typeof rawPlaceOfBirth === 'object' &&
      !Array.isArray(rawPlaceOfBirth)
    ) {
      placeOfBirth = {
        houseNo:
          typeof rawPlaceOfBirth.houseNo === 'string'
            ? rawPlaceOfBirth.houseNo
            : '',
        street:
          typeof rawPlaceOfBirth.street === 'string'
            ? rawPlaceOfBirth.street
            : '',
        barangay:
          typeof rawPlaceOfBirth.barangay === 'string'
            ? rawPlaceOfBirth.barangay
            : '',
        cityMunicipality:
          typeof rawPlaceOfBirth.cityMunicipality === 'string'
            ? rawPlaceOfBirth.cityMunicipality
            : '',
        province:
          typeof rawPlaceOfBirth.province === 'string'
            ? rawPlaceOfBirth.province
            : '',
        country:
          typeof rawPlaceOfBirth.country === 'string'
            ? rawPlaceOfBirth.country
            : '',
        hospital:
          typeof rawPlaceOfBirth.hospital === 'string'
            ? rawPlaceOfBirth.hospital
            : '',
      };
    }

    // Sex
    const rawSex = form.birthCertificateForm?.sex;
    const sex: 'Male' | 'Female' =
      rawSex === 'Male' || rawSex === 'Female' ? rawSex : 'Male';

    // Date of birth
    const rawDateOfBirth = form.birthCertificateForm?.dateOfBirth;
    const dateOfBirth: Date = rawDateOfBirth ? new Date(rawDateOfBirth) : new Date();

    // Type of birth
    const rawTypeOfBirth = form.birthCertificateForm?.typeOfBirth;
    const typeOfBirth: 'Single' | 'Twin' | 'Triplet' | 'Others' =
      rawTypeOfBirth === 'Single' ||
        rawTypeOfBirth === 'Twin' ||
        rawTypeOfBirth === 'Triplet' ||
        rawTypeOfBirth === 'Others'
        ? rawTypeOfBirth
        : 'Single';

    // Weight at birth
    const rawWeightAtBirth = form.birthCertificateForm?.weightAtBirth;
    const weightAtBirth: string =
      typeof rawWeightAtBirth === 'number'
        ? rawWeightAtBirth.toString()
        : rawWeightAtBirth || '';

    // Mother residence mapping (support for both "street" and "st")
    let rawMotherResidence = form.birthCertificateForm?.motherResidence;
    rawMotherResidence = parseResidence(rawMotherResidence);
    let motherResidence: MotherResidence = {
      houseNo: '',
      street: '',
      barangay: '',
      cityMunicipality: '',
      province: '',
      country: '',
    };
    if (
      rawMotherResidence &&
      typeof rawMotherResidence === 'object' &&
      !Array.isArray(rawMotherResidence)
    ) {
      motherResidence = {
        houseNo:
          typeof rawMotherResidence.houseNo === 'string'
            ? rawMotherResidence.houseNo
            : '',
        street:
          typeof rawMotherResidence.street === 'string'
            ? rawMotherResidence.street
            : typeof rawMotherResidence.st === 'string'
              ? rawMotherResidence.st
              : '',
        barangay:
          typeof rawMotherResidence.barangay === 'string'
            ? rawMotherResidence.barangay
            : '',
        cityMunicipality:
          typeof rawMotherResidence.cityMunicipality === 'string'
            ? rawMotherResidence.cityMunicipality
            : '',
        province:
          typeof rawMotherResidence.province === 'string'
            ? rawMotherResidence.province
            : '',
        country:
          typeof rawMotherResidence.country === 'string'
            ? rawMotherResidence.country
            : '',
      };
    }

    // Father residence mapping (similar handling)
    let rawFatherResidence = form.birthCertificateForm?.fatherResidence;
    rawFatherResidence = parseResidence(rawFatherResidence);
    let fatherResidence: FatherResidence = {
      houseNo: '',
      street: '',
      barangay: '',
      cityMunicipality: '',
      province: '',
      country: '',
    };
    if (
      rawFatherResidence &&
      typeof rawFatherResidence === 'object' &&
      !Array.isArray(rawFatherResidence)
    ) {
      fatherResidence = {
        houseNo:
          typeof rawFatherResidence.houseNo === 'string'
            ? rawFatherResidence.houseNo
            : '',
        street:
          typeof rawFatherResidence.street === 'string'
            ? rawFatherResidence.street
            : typeof rawFatherResidence.st === 'string'
              ? rawFatherResidence.st
              : '',
        barangay:
          typeof rawFatherResidence.barangay === 'string'
            ? rawFatherResidence.barangay
            : '',
        cityMunicipality:
          typeof rawFatherResidence.cityMunicipality === 'string'
            ? rawFatherResidence.cityMunicipality
            : '',
        province:
          typeof rawFatherResidence.province === 'string'
            ? rawFatherResidence.province
            : '',
        country:
          typeof rawFatherResidence.country === 'string'
            ? rawFatherResidence.country
            : '',
      };
    }

    // Directly assign the value and ensure it's either string or undefined
    const multipleBirthOrder: string | undefined =
      form.birthCertificateForm?.multipleBirthOrder ?? undefined;

    // Parent marriage extraction.
    // Consolidated mapping that checks if the date is "Not Married" or "Forgotten"
    const rawParentMarriage = form.birthCertificateForm?.parentMarriage;
    let parentMarriage: ParentMarriage = {
      date: new Date(),
      place: {
        houseNo: '',
        st: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        country: '',
      },
    };
    if (
      rawParentMarriage &&
      typeof rawParentMarriage === 'object' &&
      !Array.isArray(rawParentMarriage) &&
      'date' in rawParentMarriage &&
      'place' in rawParentMarriage
    ) {
      const pm = rawParentMarriage as any;
      let pmDate: Date | "Not Married" | "Forgotten";
      if (typeof pm.date === 'string') {
        if (pm.date === 'Not Married' || pm.date === 'Forgotten') {
          pmDate = pm.date;
        } else {
          pmDate = new Date(pm.date);
        }
      } else {
        pmDate = pm.date ? new Date(pm.date) : new Date();
      }
      const rawPMPlace = pm.place;
      let pmPlace: MarriagePlace = {
        houseNo: '',
        st: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        country: '',
      };
      if (rawPMPlace && typeof rawPMPlace === 'object' && !Array.isArray(rawPMPlace)) {
        pmPlace = {
          houseNo: rawPMPlace.houseNo ?? '',
          st: rawPMPlace.st ?? rawPMPlace.street ?? '',
          barangay: rawPMPlace.barangay ?? '',
          cityMunicipality: rawPMPlace.cityMunicipality ?? '',
          province: rawPMPlace.province ?? '',
          country: rawPMPlace.country ?? '',
        };
      }
      parentMarriage = { date: pmDate, place: pmPlace };
    }

    // Attendant extraction
    const rawAttendant = form.birthCertificateForm?.attendant;
    let attendant: {
      type: 'Others' | 'Physician' | 'Nurse' | 'Midwife' | 'Hilot';
      certification: {
        date: Date;
        time: Date;
        signature: string | File;
        name: string;
        title: string;
        address: {
          houseNo: string;
          st: string;
          barangay: string;
          cityMunicipality: string;
          province: string;
          country: string;
        };
      };
    } = {
      type: 'Hilot',
      certification: {
        date: new Date(),
        time: new Date(),
        signature: '',
        name: '',
        title: 'MD',
        address: {
          houseNo: '',
          st: '',
          barangay: '',
          cityMunicipality: '',
          province: '',
          country: '',
        },
      },
    };

    if (
      rawAttendant &&
      typeof rawAttendant === 'object' &&
      !Array.isArray(rawAttendant) &&
      typeof rawAttendant.certification === 'object' &&
      rawAttendant.certification !== null
    ) {
      const raw = rawAttendant as any;
      const cert = raw.certification;
      let addrObj = {
        houseNo: '',
        st: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        country: '',
      };

      if (typeof cert.address === 'object' && cert.address !== null) {
        addrObj = {
          houseNo: cert.address.houseNo ?? '',
          st: cert.address.st ?? '',
          barangay: cert.address.barangay ?? '',
          cityMunicipality: cert.address.cityMunicipality ?? '',
          province: cert.address.province ?? '',
          country: cert.address.country ?? '',
        };
      }

      const parsedDate = cert.date ? new Date(cert.date) : new Date();
      const parsedTime = cert.time ? new Date(cert.time) : new Date();

      attendant = {
        type: raw.type as 'Others' | 'Physician' | 'Nurse' | 'Midwife' | 'Hilot',
        certification: {
          date: parsedDate,
          time: parsedTime,
          signature: cert.signature ?? '',
          name: cert.name ?? '',
          title: cert.title ?? '',
          address: addrObj,
        },
      };
    }

    // Informant extraction.
    const rawInformant = form.birthCertificateForm?.informant;
    let informant: {
      name: string;
      date: Date;
      signature: string;
      address: {
        province: string;
        cityMunicipality: string;
        country: string;
        houseNo?: string;
        st?: string;
        barangay?: string;
      };
      relationship: string;
    } = {
      name: '',
      date: new Date(),
      signature: '',
      address: {
        province: '',
        cityMunicipality: '',
        country: '',
        barangay: '',
        houseNo: '',
      },
      relationship: '',
    };
    if (
      rawInformant &&
      !Array.isArray(rawInformant) &&
      typeof rawInformant === 'object'
    ) {
      const inf = rawInformant as {
        date?: string;
        name?: string;
        address?:
        | string
        | {
          province: string;
          cityMunicipality: string;
          country: string;
          houseNo?: string;
          st?: string;
          barangay?: string;
        };
        signature?: string;
        relationship?: string;
      };
      informant = {
        date: inf.date ? new Date(inf.date) : new Date(),
        name: typeof inf.name === 'string' ? inf.name : '',
        signature: typeof inf.signature === 'string' ? inf.signature : '',
        address:
          typeof inf.address === 'string'
            ? {
              province: '',
              cityMunicipality: '',
              country: '',
              houseNo: inf.address,
            }
            : inf.address || {
              province: '',
              cityMunicipality: '',
              country: '',
            },
        relationship:
          typeof inf.relationship === 'string' ? inf.relationship : '',
      };
    }

    // Prepared By extraction.
    const rawPreparedBy = form.birthCertificateForm?.preparer;
    let preparedBy: {
      nameInPrint: string;
      date: Date;
      signature: string;
      titleOrPosition: string;
    } = {
      nameInPrint: '',
      date: parseDateSafely(form.preparedByDate),
      signature: '',
      titleOrPosition: '',
    };

    if (
      rawPreparedBy &&
      typeof rawPreparedBy === 'object' &&
      !Array.isArray(rawPreparedBy)
    ) {
      if (
        ('signature' in rawPreparedBy && typeof rawPreparedBy.signature === 'string') ||
        ('nameInPrint' in rawPreparedBy && typeof rawPreparedBy.nameInPrint === 'string') ||
        ('titleOrPosition' in rawPreparedBy && typeof rawPreparedBy.titleOrPosition === 'string') ||
        ('date' in rawPreparedBy && typeof rawPreparedBy.date === 'string')
      ) {
        preparedBy = {
          date:
            'date' in rawPreparedBy && typeof rawPreparedBy.date === 'string'
              ? new Date(rawPreparedBy.date)
              : parseDateSafely(form.preparedByDate),
          signature:
            'signature' in rawPreparedBy && typeof rawPreparedBy.signature === 'string'
              ? rawPreparedBy.signature
              : '',
          nameInPrint:
            'nameInPrint' in rawPreparedBy && typeof rawPreparedBy.nameInPrint === 'string'
              ? rawPreparedBy.nameInPrint
              : '',
          titleOrPosition:
            'titleOrPosition' in rawPreparedBy && typeof rawPreparedBy.titleOrPosition === 'string'
              ? rawPreparedBy.titleOrPosition
              : '',
        };
      } else if ('name' in rawPreparedBy && typeof rawPreparedBy.name === 'string') {
        preparedBy.nameInPrint = rawPreparedBy.name;
      }
    } else if (typeof rawPreparedBy === 'string') {
      preparedBy.nameInPrint = rawPreparedBy;
    }

    // Paternity
    let affidavitOfPaternityDetails = null;
    const rawAffidavit = form.birthCertificateForm?.affidavitOfPaternityDetails;
    if (rawAffidavit) {
      let parsedAffidavit = rawAffidavit;
      if (typeof rawAffidavit === 'string') {
        try {
          parsedAffidavit = JSON.parse(rawAffidavit);
        } catch {
          parsedAffidavit = {};
        }
      }
      if (parsedAffidavit && typeof parsedAffidavit === 'object') {
        const { ctcInfo, dateSworn, ...rest } = parsedAffidavit as any;
        let processedCtcInfo = ctcInfo;
        if (ctcInfo && typeof ctcInfo === 'object') {
          processedCtcInfo = {
            ...ctcInfo,
            dateIssued: ctcInfo.dateIssued ? new Date(ctcInfo.dateIssued) : undefined,
          };
        }
        affidavitOfPaternityDetails = {
          ...rest,
          ctcInfo: processedCtcInfo,
          dateSworn: dateSworn ? new Date(dateSworn) : undefined,
        };
      }
    }

    // DelayRegister
    let affidavitOfDelayedRegistration = null;
    const rawDelayedAffidavit = form.birthCertificateForm?.affidavitOfDelayedRegistration;
    if (rawDelayedAffidavit) {
      let parsedAffidavit = rawDelayedAffidavit;
      if (typeof rawDelayedAffidavit === 'string') {
        try {
          parsedAffidavit = JSON.parse(rawDelayedAffidavit);
        } catch {
          parsedAffidavit = {};
        }
      }
      if (parsedAffidavit && typeof parsedAffidavit === 'object') {
        const { ctcInfo, dateSworn, ...rest } = parsedAffidavit as any;
        let processedCtcInfo = ctcInfo;
        if (ctcInfo && typeof ctcInfo === 'object') {
          processedCtcInfo = {
            ...ctcInfo,
            dateIssued: ctcInfo.dateIssued ? new Date(ctcInfo.dateIssued) : undefined,
          };
        }
        affidavitOfDelayedRegistration = {
          ...rest,
          ctcInfo: processedCtcInfo,
          dateSworn: dateSworn ? new Date(dateSworn) : undefined,
        };
      }
    }

    return {
      registryNumber: form.registryNumber || '',
      province: form.province || '',
      cityMunicipality: form.cityMunicipality || '',
      pagination: {
        pageNumber: form.pageNumber || '',
        bookNumber: form.bookNumber || '',
      },
      remarks: form.remarks || '',

      // Child information
      childInfo: {
        firstName: childName.first,
        middleName: childName.middle,
        lastName: childName.last,
        sex,
        dateOfBirth,
        placeOfBirth,
        typeOfBirth,
        multipleBirthOrder,
        birthOrder: form.birthCertificateForm?.birthOrder || '',
        weightAtBirth,
      },

      // Mother information
      motherInfo: {
        firstName: motherName.first,
        middleName: motherName.middle,
        lastName: motherName.last,
        citizenship: form.birthCertificateForm?.motherCitizenship || '',
        religion: form.birthCertificateForm?.motherReligion || '',
        occupation: form.birthCertificateForm?.motherOccupation || '',
        age: String(form.birthCertificateForm?.motherAge || ''),
        totalChildrenBornAlive: String(form.birthCertificateForm?.totalChildrenBornAlive ?? 0),
        childrenStillLiving: String(form.birthCertificateForm?.childrenStillLiving ?? 0),
        childrenNowDead: String(form.birthCertificateForm?.childrenNowDead ?? 0),
        residence: {
          houseNo: motherResidence.houseNo,
          st: motherResidence.street,
          barangay: motherResidence.barangay,
          cityMunicipality: motherResidence.cityMunicipality,
          province: motherResidence.province,
          country: motherResidence.country,
        },
      },

      // Father information
      fatherInfo: {
        firstName: fatherName.first,
        middleName: fatherName.middle,
        lastName: fatherName.last,
        citizenship: form.birthCertificateForm?.fatherCitizenship || '',
        religion: form.birthCertificateForm?.fatherReligion || '',
        occupation: form.birthCertificateForm?.fatherOccupation || '',
        age: String(form.birthCertificateForm?.fatherAge || ''),
        residence: {
          houseNo: fatherResidence.houseNo,
          st: fatherResidence.street,
          barangay: fatherResidence.barangay,
          cityMunicipality: fatherResidence.cityMunicipality,
          province: fatherResidence.province,
          country: fatherResidence.country,
        },
      },

      // Parent marriage information
      parentMarriage: {
        date: parentMarriage?.date || '',
        place: {
          houseNo: parentMarriage?.place.houseNo || '',
          st: parentMarriage?.place.st || '',
          barangay: parentMarriage?.place.barangay || '',
          cityMunicipality: parentMarriage?.place.cityMunicipality || '',
          province: parentMarriage?.place.province || '',
          country: parentMarriage?.place.country || ''
        }
      },

      // Attendant information
      attendant: {
        type: attendant.type,
        certification: {
          time: parseDateSafely(attendant.certification.time),
          name: attendant.certification.name,
          title: attendant.certification.title,
          date: parseDateSafely(attendant.certification.date),
          address: {
            st: attendant.certification.address.st,
            country: attendant.certification.address.country,
            houseNo: attendant.certification.address.houseNo,
            barangay: attendant.certification.address.barangay,
            province: attendant.certification.address.province,
            cityMunicipality: attendant.certification.address.cityMunicipality   
          },
        }
      },

      // Informant information
      informant:{
        name: informant.name,
        relationship: informant.relationship,
        address: {
          houseNo: informant.address.houseNo,
          st: informant.address.st,
          barangay: informant.address.barangay,
          cityMunicipality: informant.address.cityMunicipality,
          province: informant.address.province,
          country: informant.address.country
        },
        date: informant.date,
      },

      preparedBy: preparedBy,

      receivedBy: {
        nameInPrint: typeof form.receivedBy === 'string' ? form.receivedBy : '',
        titleOrPosition: typeof form.receivedByPosition === 'string' ? form.receivedByPosition : '',
        date: parseDateSafely(form.receivedByDate),
      },
      registeredByOffice: {
        nameInPrint: typeof form.registeredBy === 'string' ? form.registeredBy : '',
        titleOrPosition: typeof form.registeredByPosition === 'string' ? form.registeredByPosition : '',
        date: parseDateSafely(form.registeredByDate),
      },

      hasAffidavitOfPaternity: form.birthCertificateForm?.hasAffidavitOfPaternity,
      affidavitOfPaternityDetails: {
        father: {
          name: affidavitOfPaternityDetails?.father?.name || ''
        },
        mother: {
          name:affidavitOfPaternityDetails?.mother?.name || ''
        },
        adminOfficer: {
          nameInPrint: affidavitOfPaternityDetails?.adminOfficer?.nameInPrint || '',
          titleOrPosition: affidavitOfPaternityDetails?.adminOfficer?.titleOrPosition || '',
          address: {
            country: affidavitOfPaternityDetails?.adminOfficer?.address?.country || '',
            barangay: affidavitOfPaternityDetails?.adminOfficer?.address?.barangay || '',
            province: affidavitOfPaternityDetails?.adminOfficer?.address?.province || '',
            cityMunicipality: affidavitOfPaternityDetails?.adminOfficer?.address?.cityMunicipality || ''
          }
        },
        ctcInfo: {
          number: affidavitOfPaternityDetails?.ctcInfo?.number || '',
          dateIssued: parseDateSafely(affidavitOfPaternityDetails?.ctcInfo?.dateIssued) || '',
          placeIssued: affidavitOfPaternityDetails?.ctcInfo?.placeIssued || ''
        }
      },
      

      isDelayedRegistration: form.birthCertificateForm?.isDelayedRegistration,
      affidavitOfDelayedRegistration: affidavitOfDelayedRegistration,
    };
  };

  const initialData = mapToBirthCertificateValues(form);

  const handleEditSubmit = async (data: BirthCertificateFormValues): Promise<void> => {
    setIsUpdating(true);
  
    // Ensure we have valid object values for the residences
    const originalMotherResidence =
      typeof form.birthCertificateForm?.motherResidence === 'object' &&
      form.birthCertificateForm?.motherResidence !== null &&
      !Array.isArray(form.birthCertificateForm?.motherResidence)
        ? (form.birthCertificateForm?.motherResidence as Record<string, string>)
        : {};
  
    const originalFatherResidence =
      typeof form.birthCertificateForm?.fatherResidence === 'object' &&
      form.birthCertificateForm?.fatherResidence !== null &&
      !Array.isArray(form.birthCertificateForm?.fatherResidence)
        ? (form.birthCertificateForm?.fatherResidence as Record<string, string>)
        : {};
  
    const originalParentMarriage = (() => {
      const pm = form.birthCertificateForm?.parentMarriage;
      if (
        typeof pm === 'object' &&
        pm !== null &&
        !Array.isArray(pm) &&
        'place' in pm &&
        typeof pm.place === 'object' &&
        pm.place !== null &&
        !Array.isArray(pm.place)
      ) {
        return pm.place as Record<string, string>;
      }
      return {};
    })();
  
    const originalAttendantAddress = (() => {
      const att = form.birthCertificateForm?.attendant;
      if (
        typeof att === 'object' &&
        att !== null &&
        !Array.isArray(att) &&
        'certification' in att &&
        typeof att.certification === 'object' &&
        att.certification !== null &&
        !Array.isArray(att.certification) &&
        'address' in att.certification &&
        typeof att.certification.address === 'object' &&
        att.certification.address !== null &&
        !Array.isArray(att.certification.address)
      ) {
        return att.certification.address as Record<string, string>;
      }
      return {};
    })();
  
    const originalInformantAddress = (() => {
      const inf = form.birthCertificateForm?.informant;
      if (
        typeof inf === 'object' &&
        inf !== null &&
        !Array.isArray(inf) &&
        'address' in inf &&
        typeof inf.address === 'object' &&
        inf.address !== null &&
        !Array.isArray(inf.address)
      ) {
        return inf.address as Record<string, string>;
      }
      return {};
    })();
  
    const originalAdminOfficerAddress = (() => {
      const details = form.birthCertificateForm?.affidavitOfPaternityDetails;
      if (
        typeof details === 'object' &&
        details !== null &&
        !Array.isArray(details) &&
        'adminOfficer' in details &&
        typeof details.adminOfficer === 'object' &&
        details.adminOfficer !== null &&
        !Array.isArray(details.adminOfficer) &&
        'address' in details.adminOfficer &&
        typeof details.adminOfficer.address === 'object' &&
        details.adminOfficer.address !== null &&
        !Array.isArray(details.adminOfficer.address)
      ) {
        return details.adminOfficer.address as Record<string, string>;
      }
      return {};
    })();
  
    const updatedForm = {
      id: form.id,
      registryNumber: data.registryNumber,
      province: data.province,
      cityMunicipality: data.cityMunicipality,
      pageNumber: data.pagination?.pageNumber || form.pageNumber,
      bookNumber: data.pagination?.bookNumber || form.bookNumber,
      remarks: data.remarks || null,
      preparedByDate: data.preparedBy.date || null,
      receivedBy: data.receivedBy.nameInPrint || null,
      receivedByPosition: data.receivedBy.titleOrPosition || null,  // <-- Added
      receivedByDate: data.receivedBy.date || null,
      registeredBy: data.registeredByOffice.nameInPrint || null,
      registeredByPosition: data.registeredByOffice.titleOrPosition || null,  // <-- Added
      registeredByDate: data.registeredByOffice.date || null,
      updatedAt: new Date(),
      childInfo: {
        firstName: data.childInfo.firstName || '',
        middleName: data.childInfo.middleName || '',
        lastName: data.childInfo.lastName || '',
        sex: data.childInfo.sex || '',
        dateOfBirth: data.childInfo.dateOfBirth || null,
        placeOfBirth: data.childInfo.placeOfBirth || '',
        typeOfBirth: data.childInfo.typeOfBirth || '',
        multipleBirthOrder: data.childInfo.multipleBirthOrder,
        birthOrder: data.childInfo.birthOrder,
        weightAtBirth: data.childInfo.weightAtBirth,
      },
      motherInfo: {
        firstName: data.motherInfo.firstName || '',
        middleName: data.motherInfo.middleName || '',
        lastName: data.motherInfo.lastName || '',
        citizenship: data.motherInfo.citizenship || '',
        religion: data.motherInfo.religion || '',
        occupation: data.motherInfo.occupation || '',
        age: data.motherInfo.age,
        totalChildrenBornAlive: Number(data.motherInfo.totalChildrenBornAlive ?? 0),
        childrenStillLiving: Number(data.motherInfo.childrenStillLiving ?? 0),
        childrenNowDead: Number(data.motherInfo.childrenNowDead ?? 0),
        // Merge original and updated residence using mergeResidence
        residence: mergeResidence(
          originalMotherResidence,
          data.motherInfo.residence as Record<string, string>
        ),
      },
      fatherInfo: {
        firstName: data.fatherInfo!.firstName || '',
        middleName: data.fatherInfo!.middleName || '',
        lastName: data.fatherInfo!.lastName || '',
        citizenship: data.fatherInfo!.citizenship || '',
        religion: data.fatherInfo!.religion || '',
        occupation: data.fatherInfo!.occupation || '',
        age: data.fatherInfo!.age,
        residence: mergeResidence(
          originalFatherResidence,
          data.fatherInfo!.residence as Record<string, string>
        ),
      },
      parentMarriage: {
        date: data.parentMarriage?.date || '',
        place: mergeResidence(
          originalParentMarriage,
          data.parentMarriage?.place as Record<string, string>
        ),
      },
      attendant: {
        type: data.attendant.type,
        certification: {
          time: data.attendant.certification.time,
          name: data.attendant.certification.name,
          title: data.attendant.certification.title,
          date: data.attendant.certification.date,
          address: mergeResidence(
            originalAttendantAddress,
            data.attendant.certification?.address as Record<string, string>,
            'st'
          ),
        }
      },
      informant: {
        name: data.informant.name,
        relationship: data.informant.relationship,
        address: mergeResidence(
          originalInformantAddress,
          data.informant.address as Record<string, string>,
          'st'
        ),
        date: data.informant.date,
      },
      preparedBy: data.preparedBy,
      hasAffidavitOfPaternity: data.hasAffidavitOfPaternity,
      affidavitOfPaternityDetails: {
        father: {
          name: data.affidavitOfPaternityDetails?.father?.name || ''
        },
        mother: {
          name: data.affidavitOfPaternityDetails?.mother?.name || ''
        },
        adminOfficer: {
          nameInPrint: data.affidavitOfPaternityDetails?.adminOfficer?.nameInPrint || '',
          titleOrPosition: data.affidavitOfPaternityDetails?.adminOfficer?.titleOrPosition || '',
          address: mergeResidence(
            originalAdminOfficerAddress,
            data.affidavitOfPaternityDetails?.adminOfficer?.address as Record<string, string>
          ),
        },
        ctcInfo: {
          number: data.affidavitOfPaternityDetails?.ctcInfo?.number || '',
          dateIssued: data.affidavitOfPaternityDetails?.ctcInfo?.dateIssued || '',
          placeIssued: data.affidavitOfPaternityDetails?.ctcInfo?.placeIssued || ''
        }
      },
      isDelayedRegistration: data.isDelayedRegistration,
      affidavitOfDelayedRegistration: data.affidavitOfDelayedRegistration,
    };
  
    console.log(JSON.stringify(updatedForm, null, 2));
  
    try {
      const response = await fetch('/api/editForm/birth', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedForm),
      });
  
      const responseText = await response.text();
      const responseData = responseText ? JSON.parse(responseText) : {};
  
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update form');
      }
  
      onCancel();
      toast.success(`${t('formUpdated')} ${updatedForm.id}!`);
    } catch (error) {
      console.error('Failed to update form:', error);
      toast.error('Error updating form');
    } finally {
      setIsUpdating(false);
    }
  };
  

  const { formMethods, handleError } = useBirthCertificateForm({
    onOpenChange: () => { },
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: BirthCertificateFormValues): Promise<void> => {
    const result = await formMethods.trigger();
    if (result) {
      try {
        await handleEditSubmit(data);
        formMethods.reset();
      } catch (error: unknown) {
        console.error('Error submitting form:', error);
        toast.error('Error submitting form');
        handleError(error);
      }
    } else {
      toast.warning('Please complete all required fields');
    }
  };

  const handleCancel = () => {
    formMethods.reset();
    onCancel();
  };

  return (
    <div className='max-w-[70dvw] w-[70dvw] h-[95dvh] max-h-[95dvh] p-4'>
      <div className='mb-6 text-center'>
        <h2 className='text-2xl font-bold'>
          {t('Edit Certificate of Live Birth')}
        </h2>
      </div>
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(handleFormSubmit, handleError)}
          className='space-y-6'
        >
          <div className='h-full flex flex-col'>
            <ScrollArea className='h-[calc(95vh-180px)]'>
              <div className='p-6 space-y-4'>
                <PaginationInputs />
                <RegistryInformationCard formType={FormType.BIRTH} forms={form} isEdit="BIRTH" />
                <ChildInformationCard />
                <MotherInformationCard />
                <FatherInformationCard />
                <MarriageInformationCard />
                <AttendantInformationCard />
                <CertificationOfInformantCard />
                <PreparedByCard cardTitle="Prepared By" isEdit="BIRTH" />
                <ReceivedByCard cardTitle="Received By" isEdit="BIRTH" />
                <RegisteredAtOfficeCard
                  fieldPrefix='registeredByOffice'
                  cardTitle='Registered at the Office of Civil Registrar'
                  isEdit="BIRTH"
                />
                <RemarksCard
                  fieldName='remarks'
                  cardTitle='Birth Certificate Remarks'
                  label='Additional Remarks'
                  placeholder='Enter any additional remarks or annotations'
                />
                <AffidavitOfPaternityForm />
                <DelayedRegistrationForm />
              </div>
            </ScrollArea>
            <div className='flex justify-end gap-2 mt-4 mr-8'>
              <Button
                type='button'
                variant='outline'
                className='py-2 w-32 bg-muted-foreground/80 hover:bg-muted-foreground hover:text-accent text-accent'
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type='submit' variant='default' className='py-2 w-32'>
                {isUpdating ? 'Updating' : 'Update'}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
