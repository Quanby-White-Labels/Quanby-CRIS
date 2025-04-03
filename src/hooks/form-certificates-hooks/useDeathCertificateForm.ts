import { submitDeathCertificateForm } from '@/components/custom/civil-registry/actions/certificate-actions/death-certificate-actions';
import {
  DeathCertificateFormValues,
  deathCertificateFormSchema,
} from '@/lib/types/zod-form-certificate/death-certificate-form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Permission } from '@prisma/client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { notifyUsersWithPermission } from '../users-action';
import { useRouter } from 'next/navigation';
import { updateDeathCertificateForm } from '@/components/custom/civil-registry/actions/certificate-edit-actions/death-certificate-edit-form';

export interface UseDeathCertificateFormProps {
  onOpenChange?: (open: boolean) => void;
  defaultValues?: Partial<DeathCertificateFormValues> & { id?: string };
  scrollAreaRef?: React.RefObject<HTMLDivElement>; // Add scroll area ref
}

const emptyDefaults: DeathCertificateFormValues = {
  registryNumber: '',
  province: '',
  cityMunicipality: '',
  name: {
    first: '',
    middle: '',
    last: '',
  },
  sex: undefined,
  dateOfDeath: undefined,
  timeOfDeath: undefined,
  dateOfBirth: undefined,
  ageAtDeath: {
    years: undefined,
    months: undefined,
    days: undefined,
    hours: undefined,
    minutes: undefined,
  },
  placeOfDeath: {
    locationType: '',
    internationalAddress: '',
    hospitalInstitution: undefined,
    houseNo: undefined,
    st: undefined,
    barangay: undefined,
    cityMunicipality: '',
    province: '',
  },
  civilStatus: '',
  religion: '',
  citizenship: '',
  residence: {
    houseNo: undefined,
    st: undefined,
    barangay: undefined,
    cityMunicipality: '',
    province: '',
    country: '',
  },
  occupation: '',
  birthInformation: {
    ageOfMother: undefined,
    methodOfDelivery: undefined,
    lengthOfPregnancy: undefined,
    typeOfBirth: undefined,
    birthOrder: undefined,
  },
  parents: {
    fatherName: {
      first: '',
      middle: '',
      last: '',
    },
    motherName: {
      first: '',
      middle: '',
      last: '',
    },
  },

  causesOfDeath19a: {
    mainDiseaseOfInfant: '',
    otherDiseasesOfInfant: undefined,
    mainMaternalDisease: undefined,
    otherMaternalDisease: undefined,
    otherRelevantCircumstances: undefined,
  },

  causesOfDeath19b: {
    immediate: { cause: '', interval: '' },
    antecedent: { cause: undefined, interval: undefined },
    underlying: { cause: undefined, interval: undefined },
    otherSignificantConditions: undefined,
  },
  medicalCertificate: {
    causesOfDeath: {
      immediate: { cause: '', interval: '' },
      antecedent: { cause: undefined, interval: undefined },
      underlying: { cause: undefined, interval: undefined },
      otherSignificantConditions: undefined,
    },
    maternalCondition: {
      pregnantNotInLabor: false,
      pregnantInLabor: false,
      lessThan42Days: false,
      daysTo1Year: false,
      noneOfTheAbove: false,
    },
    externalCauses: { mannerOfDeath: undefined, placeOfOccurrence: undefined },
    attendant: {
      type: undefined,
      othersSpecify: undefined,
      duration: { from: undefined, to: undefined },
      certification: {
        date: undefined,
        name: '',
        title: '',
        time: undefined,
        address: ''
      },
    },
    autopsy: false,
  },
  certificationOfDeath: {
    hasAttended: false,
    nameInPrint: '',
    titleOfPosition: '',
    address: '',
    reviewedBy: {
      date: undefined,
      healthOfficerNameInPrint: '',
    }

  },
  reviewedBy: { date: undefined },
  postmortemCertificate: {
    address: '',
    nameInPrint: '',
    causeOfDeath: '',
    titleDesignation: '',
    date: undefined,
  },
  embalmerCertification: {
    address: '',
    nameInPrint: '',
    titleDesignation: '',
    nameOfDeceased: '',
    licenseNo: '',
    issuedOn: undefined,
    issuedAt: '',
    expiryDate: undefined,
  },
  delayedRegistration: {
    isDelayed: false,
    affiant: {
      name: undefined,
      civilStatus: undefined,
      residenceAddress: undefined,
      age: undefined,
    },
    deceased: {
      name: undefined,
      diedOn: undefined,
      dateOfDeath: undefined,
      placeOfDeath: undefined,
      burialInfo: {
        date: undefined,
        place: undefined,
        method: undefined,
      },
    },
    attendance: {
      wasAttended: false,
      attendedBy: undefined,
    },
    causeOfDeath: undefined,
    reasonForDelay: undefined,
    affidavitDate: undefined,
    affidavitDatePlace: undefined,
    adminOfficer: {
      name: undefined,
      position: undefined,
      address: undefined,
    },
    ctcInfo: {
      dayOf: undefined,
      placeAt: undefined,
      number: undefined,
      issuedOn: undefined,
      issuedAt: undefined,
    },
  },
  corpseDisposal: undefined,
  burialPermit: { number: '', dateIssued: undefined },
  transferPermit: { number: undefined, dateIssued: undefined },
  cemeteryOrCrematory: {
    name: '',
    address: {
      internationalAddress: '',
      houseNo: undefined,
      st: undefined,
      barangay: undefined,
      cityMunicipality: '',
      province: '',
      country: '',
    },
  },
  informant: {
    nameInPrint: '',
    relationshipToDeceased: '',
    address: '',
    date: undefined,
  },
  preparedBy: {
    nameInPrint: undefined,
    titleOrPosition: '',
    date: undefined,
  },
  receivedBy: {
    nameInPrint: undefined,
    titleOrPosition: '',
    date: undefined,
  },
  registeredByOffice: {
    nameInPrint: undefined,
    titleOrPosition: '',
    date: undefined,
  },
  remarks: undefined,
  pagination: { pageNumber: undefined, bookNumber: undefined },
};


export function useDeathCertificateForm({
  onOpenChange,
  defaultValues,
  scrollAreaRef,
}: UseDeathCertificateFormProps = {}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const formMethods = useForm<DeathCertificateFormValues>({
    resolver: zodResolver(deathCertificateFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues || emptyDefaults,
  });


  const preparePrismaData = (data: any) => {
    const formatTimeString = (date: Date) => {
      return date instanceof Date ?
        date.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        }) : date;
    };

    const processedData = { ...data };
    return processedData;
  };


  const router = useRouter();

  // Reset the form when defaultValues change (for edit mode)
  useEffect(() => {
    if (defaultValues && !isInitialized) {
      // Set the form values once and mark as initialized
      formMethods.reset(defaultValues);
      setIsInitialized(true);
    }
  }, [defaultValues, formMethods, isInitialized]);

  const onSubmit = async (data: DeathCertificateFormValues) => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Check and simplify affidavitForDelayed if it's false
    if (!data.delayedRegistration ||
      data.delayedRegistration.isDelayed === false ||
      data.delayedRegistration.isDelayed === null ||
      data.delayedRegistration.isDelayed === undefined) {

      data.delayedRegistration
    }

    try {
      // Check if we're in update mode
      const isUpdateMode = Boolean(defaultValues && defaultValues.id);
      console.log('dapat na id:', defaultValues?.id || '');

      let result;

      if (isUpdateMode) {
        console.log('Updating Death certificate with ID:', defaultValues?.id);
        console.log('Form values being sent:', data);

        // Call update function
        result = await updateDeathCertificateForm(defaultValues?.id || '', data);

        // Log the result
        console.log('Update result:', result);

        if ('data' in result) {
          toast.success(`Death certificate updated successfully`);
          onOpenChange?.(false);
        } else if ('error' in result) {
          toast.error(`Update failed: ${result.error}`);
        }
      } else {
        console.log('Preparing to submit new Death certificate');
      }

      const preparedData = preparePrismaData(data);
      const processedData = await preparedData;

      console.log('Processed data before submission:', processedData);

      // Call the appropriate action based on create or edit mode
      if (isUpdateMode && defaultValues?.id) {
        // Check and simplify affidavitForDelayed if it's false
        if (!data.delayedRegistration ||
          data.delayedRegistration.isDelayed === false ||
          data.delayedRegistration.isDelayed === null ||
          data.delayedRegistration.isDelayed === undefined) {

          data.delayedRegistration = undefined;
        }

        result = await updateDeathCertificateForm(defaultValues.id, processedData);

        if ('data' in result) {
          toast.success(`Death certificate updated successfully (Book ${result?.data?.bookNumber}, Page ${result?.data?.pageNumber})`);
          notifyUsersWithPermission(
            Permission.DOCUMENT_READ,
            "Death Certificate Updated",
            `Death Certificate with the details (Book ${result?.data?.bookNumber}, Page ${result?.data?.pageNumber}, Registry Number ${data.registryNumber}) has been updated.`
          );

          router.refresh();
          onOpenChange?.(false);
        }
      } else {
        result = await submitDeathCertificateForm(processedData);

        if ('data' in result) {
          toast.success(`Death certificate submitted successfully (Book ${result.data.bookNumber}, Page ${result.data.pageNumber})`);
          notifyUsersWithPermission(
            Permission.DOCUMENT_READ,
            "New uploaded Death Certificate",
            `New Death Certificate with the details (Book ${result.data.bookNumber}, Page ${result.data.pageNumber}, Registry Number ${data.registryNumber}) has been uploaded.`
          );

          router.refresh();
          onOpenChange?.(false);
          formMethods.reset(emptyDefaults);
        }
      }

      console.log('Submission result:', result);
    } catch (error) {
      console.error('Error in submitDeathCertificateForm:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced error handler with scrolling functionality
  const handleError = (errors: any) => {
    console.error("❌ Form Errors:", errors);

    // Get all error field names to determine which section to scroll to
    const errorFields = Object.keys(errors);

    if (errorFields.length === 0) return;

    // Define the field prefix to card ID mapping for scrolling
    const fieldToCardMap: Record<string, string> = {
      'registry': 'registry-information-card',
      'pagination': 'pagination-inputs',

      'name': 'deceased-information-card',
      'sex': 'deceased-information-card',
      'dateOfDeath': 'deceased-information-card',
      'dateOfBirth': 'deceased-information-card',
      'ageAtDeath': 'deceased-information-card',
      'placeOfDeath': 'deceased-information-card',
      'civilStatus': 'deceased-information-card',
      'religion': 'deceased-information-card',
      'citizenship': 'deceased-information-card',
      'residence': 'deceased-information-card',
      'occupation': 'deceased-information-card',
      'birthInformation': 'deceased-information-card',
      'parents': 'deceased-information-card',

      'causesOfDeath19a': 'causes-of-death-19a-card',
      'causesOfDeath19b': 'causes-of-death-19b-card',

      'medicalCertificate': 'causes-of-death-19b-card',
      'maternalCondition': 'maternal-condition-card',
      'externalCauses': 'death-by-external-causes-card',
      'attendant': 'attendant-information-card',

      'certificationOfDeath': 'certification-of-death-card',
      'postmortemCertificate': 'postmortem-certificate-card',
      'embalmerCertification': 'embalmer-certification-card',

      'delayedRegistration': 'affidavit-delayed-registration-card',

      'corpseDisposal': 'disposal-information-card',
      'burialPermit': 'disposal-information-card',
      'transferPermit': 'disposal-information-card',
      'cemeteryOrCrematory': 'disposal-information-card',

      'informant': 'certification-informant-card',

      'preparedBy': 'prepared-by-card',
      'receivedBy': 'received-by-card',
      'registeredByOffice': 'registered-at-office-card',

      'remarks': 'remarks-card',
    };

    // Build a hierarchy of priority - which errors to scroll to first
    const errorHierarchy = [
      'registryNumber', 'province', 'cityMunicipality',
      'name', 'sex', 'dateOfDeath', 'dateOfBirth',
      'causesOfDeath19a', 'causesOfDeath19b',
      // Add more fields in priority order
    ];

    // Find the first field that has an error according to our hierarchy
    let firstErrorField = errorHierarchy.find(field => errorFields.includes(field));

    // If no match in hierarchy, just take the first error field
    if (!firstErrorField && errorFields.length > 0) {
      firstErrorField = errorFields[0];
    }

    // Determine which card to scroll to
    let cardToScrollTo = null;

    if (firstErrorField) {
      // First check for exact matches
      if (fieldToCardMap[firstErrorField]) {
        cardToScrollTo = fieldToCardMap[firstErrorField];
      } else {
        // If no exact match, check for prefixes
        for (const [prefix, cardId] of Object.entries(fieldToCardMap)) {
          if (firstErrorField.startsWith(prefix)) {
            cardToScrollTo = cardId;
            break;
          }
        }
      }
    }

    // Execute the scrolling after a short delay to ensure the DOM is ready
    setTimeout(() => {
      if (cardToScrollTo) {
        // Try to find the corresponding card element
        const cardElement = document.getElementById(cardToScrollTo) ||
          document.querySelector(`.${cardToScrollTo}`);

        if (cardElement) {
          // Find the scrollable container - may be the ScrollArea viewport
          const scrollContainer = scrollAreaRef?.current?.querySelector('[data-radix-scroll-area-viewport]') ||
            document.querySelector('[data-radix-scroll-area-viewport]') ||
            document.querySelector('.overflow-auto') ||
            window;

          // Different scrolling logic based on the container
          if (scrollContainer === window) {
            // Global window scrolling
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (scrollContainer instanceof Element) {
            // For custom scrollable containers
            const containerRect = scrollContainer.getBoundingClientRect();
            const cardRect = cardElement.getBoundingClientRect();

            // Calculate the scroll position relative to the container
            const scrollTop = cardRect.top - containerRect.top + scrollContainer.scrollTop - 20;

            // Scroll the container
            scrollContainer.scrollTo({
              top: scrollTop,
              behavior: 'smooth'
            });
          }

          // Flash the card to highlight it
          cardElement.classList.add('error-flash');
          setTimeout(() => {
            cardElement.classList.remove('error-flash');
          }, 1000);
        }
      }

      // Build error messages for toast
      const errorMessages: string[] = [];

      // Helper function to make field names user-friendly
      const formatFieldName = (fieldName: string) => {
        return fieldName
          .replace(/([A-Z])/g, " $1") // Add space before capital letters
          .replace(/\./g, " → ") // Replace dots with arrows
          .trim()
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter
      };

      // Log and collect nested errors
      const processNestedErrors = (obj: any, path: string = '') => {
        if (!obj) return;

        if (typeof obj === 'object') {
          if (obj.message) {
            const formattedPath = path ? formatFieldName(path) : '';
            const message = `${formattedPath}: ${obj.message}`;
            console.log(message);
            errorMessages.push(message);
          }

          Object.keys(obj).forEach((key) => {
            processNestedErrors(obj[key], path ? `${path}.${key}` : key);
          });
        }
      };

      processNestedErrors(errors);

      if (errorMessages.length > 0) {
        // Show only the first few errors to avoid overwhelming the user
        const displayedErrors = errorMessages.slice(0, 3);
        const remainingCount = errorMessages.length - 3;

        let errorMessage = displayedErrors.join('\n');
        if (remainingCount > 0) {
          errorMessage += `\n... and ${remainingCount} more error${remainingCount > 1 ? 's' : ''}`;
        }

        toast.error(errorMessage);
      } else {
        toast.error('Please check the form for errors');
      }
    }, 100);
  };

  return { formMethods, onSubmit, handleError, isSubmitting };
}