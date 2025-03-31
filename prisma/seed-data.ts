/**
 * prisma/seed-data.ts
 *
 * This file contains functions to seed all tables in the system.
 * It generates dummy data for:
 *   - Feedback
 *   - Notifications
 *   - Base registry forms and associated certificate forms (marriage, birth, death)
 *   - Certified copies
 *   - Bulk data (additional registry forms)
 *   - Additional test data (documents and civil registry forms)
 *   - Audit logs
 *   - Accounts, Sessions
 *   - Verification tokens
 *   - Queues
 *   - Documents
 *   - Attachments
 *   - Workflows and Workflow steps
 *
 * The exported function generateTestData(prisma, userIds) calls all seeding functions.
 */

import {
  COUNTRY,
  getAllProvinces,
  getBarangaysByLocation,
  getCachedCitySuggestions,
} from '@/lib/utils/location-helpers';
import { fakerEN as faker } from '@faker-js/faker';
import {
  AttachmentType,
  AttendantType,
  CivilRegistryFormType,
  DocumentStatus,
  FormType,
  NotificationType,
  PrismaClient,
  QueueStatus,
  ServiceType,
  Sex,
} from '@prisma/client';

/* ======================================================================
   Helper Functions
   ====================================================================== */

/**
 * Generate a random date between two dates.
 */
const randomDate = (start: Date, end: Date): Date =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

/**
 * Generate a person’s name in JSON format.
 */
const generatePersonName = () => ({
  first: faker.person.firstName(),
  middle: faker.person.lastName(),
  last: faker.person.lastName(),
});

/**
 * Generate a time string in "HH:mm AM/PM" format.
 */
const generateTimeString = (): string => {
  const hours = faker.number.int({ min: 1, max: 12 });
  const minutes = faker.number.int({ min: 0, max: 59 });
  const ampm = faker.helpers.arrayElement(['AM', 'PM']);
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')} ${ampm}`;
};


const registryNumberFormat = (): string => {
  return `${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
}

console.log(registryNumberFormat()) // Example output: 2025-654321


/**
 * Generate a random Philippine location.
 * Returns an object with cityMunicipality, province, region, barangay, street and houseNo.
 */
const generatePhLocation = (isNCRMode: boolean = false) => {
  // Get all provinces and pick one randomly.
  const provinces = getAllProvinces();
  const province = faker.helpers.arrayElement(provinces);

  // Get cities/municipalities for the selected province.
  let citySuggestions = getCachedCitySuggestions(province.psgc_id, isNCRMode);
  if (citySuggestions.length === 0) {
    // Fallback: if no suggestions match (or province isn't found), get all cities
    // (This fallback depends on your application's logic.)
    citySuggestions = getCachedCitySuggestions(province.psgc_id, false);
  }
  const city = faker.helpers.arrayElement(citySuggestions);

  // Get barangays for the selected city.
  let barangays = getBarangaysByLocation(city.psgc_id);
  if (barangays.length === 0) {
    // Fallback: In case no barangays are found for that city,
    // you might consider fetching a broader list or using another logic.
    // For now, we'll simply use an empty string.
    return {
      houseNo: '',
      street: '',
      barangay: '',
      cityMunicipality: city.displayName,
      province: province.name,
      country: COUNTRY,
    };
  }
  const barangay = faker.helpers.arrayElement(barangays).name;

  // Generate additional location details.
  const street = faker.location.streetAddress();
  const houseNo = faker.location.buildingNumber();

  return {
    houseNo,
    street,
    barangay,
    cityMunicipality: city.displayName,
    province: province.name,
    country: COUNTRY,
  };
};

/* ======================================================================
   Seed Data for Simple Tables
   ====================================================================== */

/**
 * Seed Feedback data.
 */
export const seedFeedbackData = async (
  prisma: PrismaClient,
  userIds: string[]
) => {
  console.log('Seeding Feedback data...');
  const feedbackData = Array(50)
    .fill(null)
    .map(() => ({
      feedback: faker.helpers.arrayElement([
        'The system is very user-friendly and easy to navigate.',
        'I encountered some lag when submitting forms. Please optimize the performance.',
        'It would be great to have a dark mode option for the interface.',
        'I found a bug where the form submission fails when the internet connection is slow.',
        'The civil registry process is much faster now. Thank you!',
        'Can you add a feature to track the status of my submitted documents?',
        'The system is reliable, but the UI could use some modern design improvements.',
        'I appreciate the quick response from the support team.',
        'The search functionality for records could be improved.',
        'The system is excellent, but it would be helpful to have more detailed instructions.',
      ]),
      submittedBy: faker.datatype.boolean()
        ? null
        : faker.helpers.arrayElement(userIds),
      createdAt: faker.date.between({
        from: new Date(2023, 0, 1),
        to: new Date(),
      }),
      updatedAt: faker.date.between({
        from: new Date(2023, 0, 1),
        to: new Date(),
      }),
    }));
  await prisma.feedback.createMany({ data: feedbackData });
  console.log('Feedback data seeded successfully!');
};

/**
 * Seed Notification data.
 */
export const seedNotificationData = async (
  prisma: PrismaClient,
  userIds: string[]
) => {
  console.log('Seeding Notification data...');
  const notificationData = Array(100)
    .fill(null)
    .map(() => ({
      userId: faker.helpers.arrayElement(userIds),
      type: faker.helpers.arrayElement(Object.values(NotificationType)),
      title: faker.helpers.arrayElement([
        'New Document Uploaded',
        'Form Submission Approved',
        'Form Submission Rejected',
        'Reminder: Update Your Profile',
        'System Maintenance Scheduled',
        'New Feedback Received',
        'Certified Copy Request Processed',
        'Payment Received',
        'Account Verification Required',
        'Welcome to the Civil Registry System',
      ]),
      message: faker.helpers.arrayElement([
        'A new document has been uploaded to your account. Please review it.',
        'Your form submission has been approved. You can now proceed to the next step.',
        'Your form submission has been rejected. Please review the comments and resubmit.',
        'Please update your profile information to ensure accurate records.',
        'System maintenance is scheduled for tomorrow at 2:00 AM. Expect downtime for 1 hour.',
        'You have received new feedback. Please review it in the feedback section.',
        'Your certified copy request has been processed. You can download it now.',
        'Your payment has been received. Thank you for your transaction.',
        'Your account requires verification. Please upload the necessary documents.',
        'Welcome to the Civil Registry System! We are glad to have you here.',
      ]),
      read: faker.datatype.boolean(),
      readAt: faker.helpers.maybe(() => faker.date.recent(), {
        probability: 0.5,
      }),
      createdAt: faker.date.between({
        from: new Date(2023, 0, 1),
        to: new Date(),
      }),
    }));
  await prisma.notification.createMany({ data: notificationData });
  console.log('Notification data seeded successfully!');
};

/* ======================================================================
   Base Registry Forms & Certificate Data Generation
   ====================================================================== */

/**
 * Generate a Base Registry Form.
 */


const generateBaseRegistryForm = (
  formType: FormType,
  userIds: string[],
  registrationDate: Date
) => {
  const location = generatePhLocation();
  return {
    formNumber:
      formType === FormType.MARRIAGE
        ? '97'
        : formType === FormType.BIRTH
          ? '102'
          : '103',
    formType,
    registryNumber: registryNumberFormat(),
    province: location.province,
    cityMunicipality: location.cityMunicipality,
    pageNumber: faker.string.numeric(3),
    bookNumber: faker.string.numeric(3),
    receivedBy: faker.person.fullName(),
    receivedByPosition: 'Civil Registry Officer',
    receivedByDate: registrationDate,
    registeredBy: faker.person.fullName(),
    registeredByPosition: 'Civil Registrar',
    dateOfRegistration: registrationDate, // Corrected line
    isLateRegistered: faker.datatype.boolean(),
    remarks: faker.helpers.maybe(() => faker.lorem.sentence()),
    lcroNotations: faker.helpers.maybe(() => faker.string.alpha(10)),
    status: faker.helpers.arrayElement(Object.values(DocumentStatus)),
    preparedById: faker.helpers.arrayElement(userIds),
    verifiedById: faker.helpers.maybe(
      () => faker.helpers.arrayElement(userIds),
      { probability: 0.8 }
    ),
  };
};

/**
 * Generate Marriage Certificate data.
 */
const generateMarriageCertificate = (
  userIds: string[],
  registrationDate: Date
) => {
  const marriageDate = registrationDate;
  const husbandBirthDate = randomDate(
    new Date(1970, 0, 1),
    new Date(2000, 0, 1)
  );
  const wifeBirthDate = randomDate(new Date(1970, 0, 1), new Date(2000, 0, 1));
  const husbandResidenceLocation = generatePhLocation();
  const wifeResidenceLocation = generatePhLocation();

  // Get the name values for reuse
  const husbandFirstName = faker.person.firstName('male');
  const husbandMiddleName = faker.person.lastName();
  const husbandLastName = faker.person.lastName();

  const wifeFirstName = faker.person.firstName('female');
  const wifeMiddleName = faker.person.lastName();
  const wifeLastName = faker.person.lastName();

  // Generate random time string for wedding time
  const weddingTime = generateTimeString();

  // Generate random date for marriage
  const dateOfMarriage = randomDate(new Date(2020, 0, 1), new Date());

  // Generate contract day
  const contractDay = randomDate(new Date(2020, 0, 1), marriageDate);

  const delayedRegistration = faker.datatype.boolean(0.3);
  const delayedRegistrationValue = delayedRegistration ? 'Yes' : 'No';

  // Create base form
  const baseForm = generateBaseRegistryForm(
    FormType.MARRIAGE,
    userIds,
    registrationDate
  );

  return {
    baseForm: baseForm,
    marriageCertificateForm: {
      // Husband Information
      husbandFirstName: husbandFirstName,
      husbandMiddleName: husbandMiddleName,
      husbandLastName: husbandLastName,
      husbandDateOfBirth: husbandBirthDate,
      husbandAge: Math.floor(
        (marriageDate.getTime() - husbandBirthDate.getTime()) / 31557600000
      ),
      husbandPlaceOfBirth: generatePhLocation(),
      husbandSex: Sex.Male,
      husbandCitizenship: 'Filipino',
      husbandResidence: `${husbandResidenceLocation.houseNo}, ${husbandResidenceLocation.street}, ${husbandResidenceLocation.barangay}, ${husbandResidenceLocation.cityMunicipality}, ${husbandResidenceLocation.province}, Philippines`,
      husbandReligion: faker.helpers.arrayElement([
        'Catholic',
        'Protestant',
        'Islam',
        'Buddhism',
      ]),
      husbandCivilStatus: faker.helpers.arrayElement([
        'Single',
        'Widowed',
        'Divorced',
      ]),

      // Husband Parents Information
      husbandFatherName: generatePersonName(),
      husbandFatherCitizenship: 'Filipino',
      husbandMotherMaidenName: generatePersonName(),
      husbandMotherCitizenship: 'Filipino',

      // Husband Consent Person
      husbandConsentPerson: {
        name: generatePersonName(),
        relationship: faker.helpers.arrayElement([
          'Parent',
          'Child',
          'Sibling',
        ]),
        residence: generatePhLocation(),
      },

      husbandContractParty: {

        agreement: true
      },
      wifeContractParty: {

        agreement: true
      },

      // receivedByOffice:{
      //   
      //   nameInPrint: generatePersonName(),
      //   title: faker.helpers.arrayElement([
      //     'Civil Registrar',
      //     'Civil Registry Officer',
      //   ]),
      //   date: registrationDate
      // },
      // preparedByOffice:{
      //   
      //   nameInPrint: generatePersonName(),
      //   title: faker.helpers.arrayElement([
      //     'Civil Registrar',
      //     'Civil Registry Officer',
      //   ]),
      //   date: registrationDate
      // },

      // Wife Information
      wifeFirstName: wifeFirstName,
      wifeMiddleName: wifeMiddleName,
      wifeLastName: wifeLastName,
      wifeDateOfBirth: wifeBirthDate,
      wifeAge: Math.floor(
        (marriageDate.getTime() - wifeBirthDate.getTime()) / 31557600000
      ),
      wifePlaceOfBirth: generatePhLocation(),
      wifeSex: Sex.Female,
      wifeCitizenship: 'Filipino',
      wifeResidence: `${wifeResidenceLocation.houseNo}, ${wifeResidenceLocation.street}, ${wifeResidenceLocation.barangay}, ${wifeResidenceLocation.cityMunicipality}, ${wifeResidenceLocation.province}, Philippines`,
      wifeReligion: faker.helpers.arrayElement([
        'Catholic',
        'Protestant',
        'Islam',
        'Buddhism',
      ]),
      wifeCivilStatus: faker.helpers.arrayElement([
        'Single',
        'Widowed',
        'Divorced',
      ]),

      // Wife Parents Information
      wifeFatherName: generatePersonName(),
      wifeFatherCitizenship: 'Filipino',
      wifeMotherMaidenName: generatePersonName(),
      wifeMotherCitizenship: 'Filipino',

      // Wife Consent Person
      wifeConsentPerson: {
        name: generatePersonName(),
        relationship: faker.helpers.arrayElement([
          'Parent',
          'Child',
          'Sibling',
        ]),
        residence: faker.location.streetAddress(),
      },

      // Contract Party
      contractDay: contractDay,

      // Marriage Details
      placeOfMarriage: generatePhLocation(),
      dateOfMarriage: dateOfMarriage,
      // In your seed script
      timeOfMarriage: (() => {
        const dateOfMarriage = new Date("2023-07-08T11:33:36.060Z");
        const [time, period] = "03:14 PM".split(' ');
        const [hours, minutes] = time.split(':');

        let convertedHours = Number(hours);
        if (period === 'PM' && convertedHours !== 12) {
          convertedHours += 12;
        } else if (period === 'AM' && convertedHours === 12) {
          convertedHours = 0;
        }

        dateOfMarriage.setHours(convertedHours, Number(minutes), 0, 0);
        return dateOfMarriage;
      })(),

      // Witnesses
      witnesses: Array(2)
        .fill(null)
        .map(() => ({
          name: faker.person.fullName(),
          signature: faker.person.fullName()
        })),

      // Marriage License Details
      marriageLicenseDetails: {
        licenseNumber: faker.string.numeric(8),
        dateIssued: randomDate(new Date(2020, 0, 1), dateOfMarriage),
        placeIssued: 'Office of the Civil Registrar, ',
        marriageAgreement: true
      },

      // Marriage Article
      marriageArticle: {
        article: faker.helpers.arrayElement([
          'Article 1',
          'Article 2',
          'Article 3',
          'Article 4',
          'Article 5',
        ]),
        marriageArticle: faker.datatype.boolean()
      },

      // Marriage Settlement
      marriageSettlement: faker.datatype.boolean(),

      // Solemnizing Officer
      solemnizingOfficer: {
        name: faker.person.fullName(),
        position: faker.helpers.arrayElement([
          'Priest',
          'Judge',
          'Mayor',
          'Minister',
        ]),
        registryNoExpiryDate: faker.date.future().toISOString(),
        signature: faker.person.fullName()
      },

      // Registered By Office
      registeredByOffice: {
        date: faker.date.recent(),
        nameInPrint: faker.person.fullName(),

        title: faker.helpers.arrayElement([
          'Civil Registrar',
          'Assistant Civil Registrar',
          'Registration Officer'
        ])
      },

      // Remarks
      remarks: faker.helpers.maybe(() => faker.lorem.sentence()),

      // Affidavit of Solemnizing Officer
      affidavitOfSolemnizingOfficer: {
        solemnizingOfficerInformation: {
          officerName: {
            first: faker.person.firstName(),
            middle: faker.person.middleName(),
            last: faker.person.lastName()
          },
          officeName: faker.company.name(),

          address: faker.location.streetAddress(),
        },

        a: {
          nameOfHusband: {
            first: husbandFirstName,
            middle: husbandMiddleName,
            last: husbandLastName
          },
          nameOfWife: {
            first: wifeFirstName,
            middle: wifeMiddleName,
            last: wifeLastName
          }
        },

        b: {
          a: faker.datatype.boolean(0.2),
          b: faker.datatype.boolean(0.2),
          c: faker.datatype.boolean(0.2),
          d: faker.datatype.boolean(0.2),
          e: faker.datatype.boolean(0.2)
        },

        c: faker.lorem.sentence(),

        d: {
          dayOf: randomDate(new Date(2020, 0, 1), dateOfMarriage),
          atPlaceExecute: {
            street: faker.location.street(),
            barangay: faker.location.county(),
            cityMunicipality: faker.location.city(),
            province: faker.location.state(),
            country: 'Philippines'
          }
        },

        dateSworn: {
          dayOf: faker.date.recent(),
          atPlaceOfSworn: {
            street: faker.location.street(),
            barangay: faker.location.county(),
            cityMunicipality: faker.location.city(),
            province: faker.location.state(),
            country: 'Philippines'
          },
          ctcInfo: {
            number: faker.string.alphanumeric(10),
            dateIssued: faker.date.recent(),
            placeIssued: faker.location.city()
          }
        },

        administeringOfficerInformation: {
          adminName: {
            first: faker.person.firstName(),
            middle: faker.person.middleName(),
            last: faker.person.lastName()
          },
          position: faker.helpers.arrayElement(['Notary Public', 'Judge', 'Mayor']),
          address: faker.location.streetAddress(),

        }
      },

      // Optional affidavit for delayed registration
      // Affidavit for Delayed Registration
      affidavitOfdelayedRegistration: delayedRegistrationValue === 'Yes' ? {
        delayedRegistration: 'Yes',
        administeringInformation: {

          nameOfOfficer: faker.person.fullName(),
          position: faker.helpers.arrayElement(['Judge', 'Notary Public', 'Mayor']),
          addressOfOfficer: {
            street: faker.location.street(),
            barangay: faker.location.county(),
            cityMunicipality: faker.location.city(),
            province: faker.location.state(),
            country: 'Philippines'
          }
        },
        applicantInformation: {

          nameOfApplicant: faker.person.fullName(),
          postalCode: faker.location.zipCode('#####'), // Ensuring 5 digits for postalCode
          applicantAddress: {
            street: faker.location.street(),
            barangay: faker.location.county(),
            cityMunicipality: faker.location.city(),
            province: faker.location.state(),
            country: 'Philippines'
          }
        },
        a: (() => {
          // To ensure only one agreement is true (per schema refine rule)
          const useAgreementA = faker.datatype.boolean();
          return {
            a: {
              agreement: useAgreementA,
              nameOfPartner: {
                first: faker.person.firstName(),
                middle: faker.person.lastName(),
                last: faker.person.lastName()
              },
              placeOfMarriage: faker.location.city(),
              dateOfMarriage: randomDate(new Date(2020, 0, 1), new Date())
            },
            b: {
              agreement: !useAgreementA,
              nameOfHusband: {
                first: husbandFirstName,
                middle: husbandMiddleName,
                last: husbandLastName
              },
              nameOfWife: {
                first: wifeFirstName,
                middle: wifeMiddleName,
                last: wifeLastName
              },
              placeOfMarriage: faker.location.city(),
              dateOfMarriage: dateOfMarriage
            }
          };
        })(),
        b: {
          solemnizedBy: faker.person.fullName(),
          sector: faker.helpers.arrayElement([
            'religious-ceremony',
            'civil-ceremony',
            'Muslim-rites',
            'tribal-rites'
          ])
        },
        c: {
          a: {
            licenseNo: faker.string.numeric(8),
            dateIssued: randomDate(new Date(2020, 0, 1), dateOfMarriage),
            placeOfSolemnizedMarriage: faker.location.city()
          },
          b: {
            underArticle: faker.helpers.arrayElement([
              'Article 1 of the Family Code',
              'Article 34 of Executive Order No. 209',
              'Presidential Decree No. 1083'
            ])
          }
        },
        d: {
          husbandCitizenship: 'Filipino',
          wifeCitizenship: 'Filipino'
        },
        e: faker.lorem.paragraph(), // Required reason for delayed registration
        f: {
          date: faker.date.recent(),
          place: {
            street: faker.location.street(),
            barangay: faker.location.county(),
            cityMunicipality: faker.location.city(),
            province: faker.location.state(),
            country: 'Philippines'
          }
        },
        dateSworn: {
          dayOf: randomDate(new Date(2020, 0, 1), dateOfMarriage),
          atPlaceOfSworn: {
            street: faker.location.street(),
            barangay: faker.location.county(),
            cityMunicipality: faker.location.city(),
            province: faker.location.state(),
            country: 'Philippines'
          },
          ctcInfo: {
            number: faker.string.alphanumeric(10),
            dateIssued: randomDate(new Date(2020, 0, 1), dateOfMarriage),
            placeIssued: faker.location.city()
          }
        }
      } : {}

    }
  };
};

/**
 * Generate Birth Certificate data.
 */
const generateBirthCertificate = (
  userIds: string[],
  registrationDate: Date
) => {
  const birthDate = randomDate(new Date(2020, 0, 1), new Date());
  const motherAge = faker.number.int({ min: 18, max: 45 });
  const fatherAge = faker.number.int({ min: 20, max: 50 });
  const motherResidenceLocation = generatePhLocation();
  const fatherResidenceLocation = generatePhLocation();
  return {
    baseForm: generateBaseRegistryForm(
      FormType.BIRTH,
      userIds,
      registrationDate
    ),
    birthCertificateForm: {
      childName: generatePersonName(),
      sex: faker.helpers.arrayElement(['Male', 'Female']),
      dateOfBirth: birthDate,
      placeOfBirth: {
        hospital: faker.helpers.arrayElement([
          "St. Luke's Medical Center",
          'Makati Medical Center',
          'Philippine General Hospital',
          'Asian Hospital',
        ]),
        ...generatePhLocation(),
        country: 'Philippines',
      },
      typeOfBirth: faker.helpers.arrayElement(['Single', 'Twin', 'Triplet']),
      birthOrder: faker.number.int({ min: 1, max: 5 }).toString(),
      weightAtBirth:
        faker.number.float({ min: 2.5, max: 4.5, fractionDigits: 2 }) * 1000,
      motherMaidenName: generatePersonName(),
      motherCitizenship: 'Filipino',
      motherReligion: faker.helpers.arrayElement([
        'Catholic',
        'Protestant',
        'Islam',
      ]),
      motherOccupation: faker.person.jobTitle(),
      motherAge,
      motherResidence: {
        houseNo: motherResidenceLocation.houseNo,
        street: motherResidenceLocation.street,
        barangay: motherResidenceLocation.barangay,
        cityMunicipality: motherResidenceLocation.cityMunicipality,
        province: motherResidenceLocation.province,
        country: 'Philippines',
      },
      totalChildrenBornAlive: faker.number.int({ min: 1, max: 5 }),
      childrenStillLiving: faker.number.int({ min: 1, max: 5 }),
      childrenNowDead: faker.number.int({ min: 0, max: 2 }),
      fatherName: generatePersonName(),
      fatherCitizenship: 'Filipino',
      fatherReligion: faker.helpers.arrayElement([
        'Catholic',
        'Protestant',
        'Islam',
      ]),
      fatherOccupation: faker.person.jobTitle(),
      fatherAge,
      fatherResidence: {
        houseNo: fatherResidenceLocation.houseNo,
        street: fatherResidenceLocation.street,
        barangay: fatherResidenceLocation.barangay,
        cityMunicipality: fatherResidenceLocation.cityMunicipality,
        province: fatherResidenceLocation.province,
        country: 'Philippines',
      },
      parentMarriage: {
        date: randomDate(new Date(2015, 0, 1), birthDate),
        place: { ...generatePhLocation(), country: 'Philippines' },
      },
      attendant: {
        type: faker.helpers.arrayElement(Object.values(AttendantType)),
        name: faker.person.fullName(),
        title: 'MD',
        address: faker.location.streetAddress(),
        signature: faker.person.fullName(),
        date: birthDate,
      },
      informant: {
        name: faker.person.fullName(),
        signature: faker.person.fullName(),
        relationship: faker.helpers.arrayElement([
          'Mother',
          'Father',
          'Grandmother',
        ]),
        address: faker.location.streetAddress(),
        date: birthDate,
      },
      preparer: {
        name: faker.person.fullName(),
        signature: faker.person.fullName(),
        title: 'Civil Registry Staff',
        date: birthDate,
      },
    },
  };
};

/**
 * Generate Death Certificate data.
 */
const generateDeathCertificate = (
  userIds: string[],
  registrationDate: Date
) => {
  const deathDate = randomDate(new Date(2020, 0, 1), new Date());
  const birthDate = randomDate(new Date(1940, 0, 1), new Date(2000, 0, 1));
  const residenceLocation = generatePhLocation();
  const placeOfDeathLocation = generatePhLocation();

  // Calculate age at death
  const yearsAtDeath = Math.floor(
    (deathDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
  );
  const monthsAtDeath = Math.floor(Math.random() * 11);
  const daysAtDeath = Math.floor(Math.random() * 30);
  const hoursAtDeath = Math.floor(Math.random() * 24);

  return {
    baseForm: generateBaseRegistryForm(
      FormType.DEATH,
      userIds,
      registrationDate
    ),
    deathCertificateForm: {
      deceasedName: generatePersonName(),
      sex: faker.helpers.arrayElement(['Male', 'Female']),
      dateOfDeath: deathDate,
      timeOfDeath: deathDate, // Use the same date object but will be formatted as time in the DB
      dateOfBirth: birthDate,
      ageAtDeath: {
        years: yearsAtDeath.toString(),
        months: monthsAtDeath.toString(),
        days: daysAtDeath.toString(),
        hours: hoursAtDeath.toString(),
      },
      placeOfDeath: placeOfDeathLocation,
      civilStatus: faker.helpers.arrayElement([
        'Single',
        'Married',
        'Widowed',
        'Divorced',
      ]),
      religion: faker.helpers.arrayElement(['Catholic', 'Protestant', 'Islam']),
      citizenship: 'Filipino',
      residence: generatePhLocation(),
      occupation: faker.person.jobTitle(),

      // Parent Information
      parentInfo: {
        fatherName: generatePersonName(),
        motherName: generatePersonName(),
      },

      // Birth Information (if applicable)
      birthInformation: faker.helpers.maybe(() => ({
        ageOfMother: faker.number.int({ min: 18, max: 45 }).toString(),
        methodOfDelivery: faker.helpers.arrayElement([
          'Normal spontaneous vertex',
          'Caesarean section',
          'Forceps',
        ]),
        lengthOfPregnancy: faker.number.int({ min: 30, max: 42 }),
        typeOfBirth: faker.helpers.arrayElement(['Single', 'Twin', 'Triplet']),
        birthOrder: faker.helpers.arrayElement([
          'First',
          'Second',
          'Third',
          'Fourth',
        ]),
      })),

      // Medical Certificate
      medicalCertificate: {
        causesOfDeath: faker.helpers.arrayElement([
          // Infant-style cause of death
          {
            mainDiseaseOfInfant: faker.helpers.arrayElement([
              'Respiratory Distress Syndrome',
              'Neonatal Sepsis',
              'Congenital Heart Disease',
            ]),
            otherDiseasesOfInfant: faker.helpers.maybe(() =>
              faker.helpers.arrayElement(['Jaundice', 'Premature Birth'])
            ),
            mainMaternalDisease: faker.helpers.maybe(() =>
              faker.helpers.arrayElement([
                'Preeclampsia',
                'Gestational Diabetes',
              ])
            ),
            otherMaternalDisease: faker.helpers.maybe(() =>
              faker.helpers.arrayElement(['Anemia', 'Infections'])
            ),
            otherRelevantCircumstances: faker.helpers.maybe(() =>
              faker.lorem.sentence()
            ),
          },
          // Standard cause of death
          {
            immediate: {
              cause: faker.helpers.arrayElement([
                'Cardiac Arrest',
                'Respiratory Failure',
                'Multiple Organ Failure',
              ]),
              interval: faker.helpers.arrayElement([
                'Minutes',
                'Hours',
                'Days',
              ]),
            },
            antecedent: {
              cause: faker.helpers.arrayElement([
                'Pneumonia',
                'Sepsis',
                'Acute Renal Failure',
              ]),
              interval: faker.helpers.arrayElement(['Days', 'Weeks', 'Months']),
            },
            underlying: {
              cause: faker.helpers.arrayElement([
                'Hypertension',
                'Diabetes Mellitus',
                'Cancer',
              ]),
              interval: faker.helpers.arrayElement(['Months', 'Years']),
            },
            otherSignificantConditions: faker.helpers.maybe(() =>
              faker.helpers.arrayElement([
                'Chronic Kidney Disease',
                'Coronary Artery Disease',
                'COPD',
              ])
            ),
          },
        ]),

        // Maternal condition (optional)
        maternalCondition: faker.helpers.maybe(() => ({
          pregnantNotInLabor: faker.datatype.boolean(),
          pregnantInLabor: faker.datatype.boolean(),
          lessThan42Days: faker.datatype.boolean(),
          daysTo1Year: faker.datatype.boolean(),
          noneOfTheAbove: faker.datatype.boolean(),
        })),

        // External causes
        externalCauses: {
          mannerOfDeath: faker.helpers.arrayElement([
            'Natural',
            'Accident',
            'Suicide',
            'Homicide',
          ]),
          placeOfOccurrence: faker.helpers.arrayElement([
            'Home',
            'Hospital',
            'Road',
            'Workplace',
          ]),
        },

        // Attendant
        attendant: {
          type: faker.helpers.arrayElement([
            'Private physician',
            'Public health officer',
            'Hospital authority',
            'None',
            'Others',
          ]),
          othersSpecify: faker.helpers.maybe(() => faker.lorem.word()),
          duration: {
            from: randomDate(new Date(2019, 0, 1), deathDate),
            to: deathDate,
          },
          certification: {
            time: deathDate,
            name: faker.person.fullName(),
            title: faker.helpers.arrayElement([
              'MD',
              'RN',
              'Attending Physician',
            ]),
            address: faker.location.streetAddress(),
            date: deathDate,
          },
        },

        autopsy: faker.datatype.boolean(),
      },

      causesOfDeath19a: {
        mainDiseaseOfInfant: faker.helpers.arrayElement([
          'Respiratory Distress Syndrome',
          'Neonatal Sepsis',
          'Congenital Heart Disease',
        ]),
        otherDiseasesOfInfant: faker.helpers.maybe(() =>
          faker.helpers.arrayElement(['Jaundice', 'Premature Birth'])
        ),
        mainMaternalDisease: faker.helpers.maybe(() =>
          faker.helpers.arrayElement(['Preeclampsia', 'Gestational Diabetes'])
        ),
        otherMaternalDisease: faker.helpers.maybe(() =>
          faker.helpers.arrayElement(['Anemia', 'Infections'])
        ),
        otherRelevantCircumstances: faker.helpers.maybe(() =>
          faker.lorem.sentence()
        ),
      },

      // Causes of Death (specific section - standard format)
      causesOfDeath19b: {
        immediate: {
          cause: faker.helpers.arrayElement([
            'Cardiac Arrest',
            'Respiratory Failure',
            'Multiple Organ Failure',
          ]),
          interval: faker.helpers.arrayElement(['Minutes', 'Hours', 'Days']),
        },
        antecedent: {
          cause: faker.helpers.arrayElement([
            'Pneumonia',
            'Sepsis',
            'Acute Renal Failure',
          ]),
          interval: faker.helpers.arrayElement(['Days', 'Weeks', 'Months']),
        },
        underlying: {
          cause: faker.helpers.arrayElement([
            'Hypertension',
            'Diabetes Mellitus',
            'Cancer',
          ]),
          interval: faker.helpers.arrayElement(['Months', 'Years']),
        },
        otherSignificantConditions: faker.helpers.maybe(() =>
          faker.helpers.arrayElement([
            'Chronic Kidney Disease',
            'Coronary Artery Disease',
            'COPD',
          ])
        ),
      },

      // Certification of Death
      certificationOfDeath: {
        hasAttended: faker.datatype.boolean(),
        nameInPrint: faker.person.fullName(),
        titleOfPosition: faker.helpers.arrayElement([
          'MD',
          'RN',
          'Medical Examiner',
        ]),
        address: generatePhLocation(),
        date: randomDate(deathDate, new Date(deathDate.getTime() + 86400000)),
        healthOfficerNameInPrint: faker.person.fullName(),
      },

      // Review Information
      reviewedBy: randomDate(
        deathDate,
        new Date(deathDate.getTime() + 86400000 * 7)
      ),


      // Optional Certificates
      postmortemCertificate: faker.helpers.maybe(
        () => ({
          causeOfDeath: faker.helpers.arrayElement([
            'Multiple traumatic injuries',
            'Gunshot wound',
            'Blunt force trauma',
          ]),
          nameInPrint: faker.person.fullName(),
          date: randomDate(
            deathDate,
            new Date(deathDate.getTime() + 86400000 * 3)
          ),
          titleDesignation: 'Forensic Pathologist',
          address: faker.location.streetAddress(),
        }),
        { probability: 0.2 }
      ),

      embalmerCertification: faker.helpers.maybe(
        () => ({
          nameOfDeceased: `${faker.person.firstName()} ${faker.person.lastName()}`,
          nameInPrint: faker.person.fullName(),
          address: faker.location.streetAddress(),
          titleDesignation: 'Licensed Embalmer',
          licenseNo: faker.string.numeric(8),
          issuedOn: randomDate(new Date(2015, 0, 1), new Date(2022, 0, 1))
            .toISOString()
            .split('T')[0],
          issuedAt: faker.location.city(),
          expiryDate: randomDate(new Date(), new Date(2025, 0, 1))
            .toISOString()
            .split('T')[0],
        }),
        { probability: 0.3 }
      ),

      delayedRegistration: {},

      // Disposal Information
      corpseDisposal: faker.helpers.arrayElement([
        'Burial',
        'Cremation',
        'Embalming',
      ]),
      burialPermit: {
        number: faker.string.numeric(8),
        dateIssued: randomDate(
          deathDate,
          new Date(deathDate.getTime() + 86400000 * 3)
        ),
      },

      transferPermit: faker.helpers.maybe(
        () => ({
          number: faker.string.numeric(8),
          dateIssued: randomDate(
            deathDate,
            new Date(deathDate.getTime() + 86400000 * 3)
          )
            .toISOString()
            .split('T')[0],
        }),
        { probability: 0.3 }
      ),

      cemeteryOrCrematory: {
        name: faker.helpers.arrayElement([
          'Manila Memorial Park',
          'Loyola Memorial Park',
          'Holy Cross Memorial Park',
          'Forest Lake Memorial Park',
        ]),
        address: generatePhLocation(),
      },

      // Informant Information
      informant: {
        nameInPrint: faker.person.fullName(),
        relationshipToDeceased: faker.helpers.arrayElement([
          'Spouse',
          'Child',
          'Sibling',
          'Parent',
          'Other Relative',
        ]),
        address: faker.location.streetAddress(),
        date: randomDate(
          deathDate,
          new Date(deathDate.getTime() + 86400000 * 3)
        ),
      },

      // Additional Fields
      remarks: faker.helpers.maybe(() => faker.lorem.sentence()),
    },
  };
};

/* ======================================================================
   Certified Copy Data Generation
   ====================================================================== */

/**
 * Generate Certified Copy data.
 */
const generateCertifiedCopy = (formIds: string[], documentIds: string[]) => {
  const createdAt = randomDate(new Date(2021, 0, 1), new Date());
  const registeredDate = faker.helpers.maybe(() =>
    randomDate(createdAt, new Date())
  );
  return {
    formId: faker.helpers.arrayElement(formIds),
    lcrNo: faker.helpers.maybe(() => faker.string.numeric(8)),
    bookNo: faker.helpers.maybe(() => faker.string.numeric(3)),
    pageNo: faker.helpers.maybe(() => faker.string.numeric(3)),
    searchedBy: faker.person.fullName(),
    contactNo: faker.phone.number(),
    date: randomDate(new Date(2023, 0, 1), new Date()),
    address: faker.location.streetAddress(),
    amountPaid: faker.number.float({ min: 100, max: 500, fractionDigits: 2 }),
    createdAt,
    datePaid: faker.helpers.maybe(() => randomDate(createdAt, new Date())),
    isRegistered: faker.datatype.boolean(),
    orNumber: faker.helpers.maybe(() => faker.string.numeric(7)),
    purpose: faker.helpers.arrayElement([
      'School Requirement',
      'Employment',
      'Passport Application',
      'Marriage License',
      'Legal Purposes',
      'Travel',
      'Insurance',
    ]),
    registeredDate,
    relationshipToOwner: faker.helpers.arrayElement([
      'Self',
      'Parent',
      'Child',
      'Spouse',
      'Sibling',
      'Legal Representative',
    ]),
    remarks: faker.helpers.maybe(() => faker.lorem.sentence()),
    requesterName: faker.person.fullName(),
    signature: faker.helpers.maybe(() => faker.person.fullName()),
    updatedAt: new Date(),
    attachmentId: faker.helpers.arrayElement(documentIds),
  };
};

/**
 * Seed Certified Copy data.
 */
export const seedCertifiedCopyData = async (prisma: PrismaClient) => {
  console.log('Seeding Certified Copy data...');
  // Create CivilRegistryFormBase entries with linked specific forms.
  const civilRegistryForms = await Promise.all(
    Array(20)
      .fill(null)
      .map(async () => {
        const formType = faker.helpers.arrayElement([
          'FORM_1A',
          'FORM_2A',
          'FORM_3A',
        ]);
        const baseFormData = {
          formType,
          pageNumber: faker.string.numeric(3),
          bookNumber: faker.string.numeric(3),
          registryNumber: faker.string.numeric(8),
          dateOfRegistration: randomDate(new Date(2020, 0, 1), new Date()),
          issuedTo: faker.person.fullName(),
          purpose: faker.helpers.arrayElement([
            'School Requirement',
            'Employment',
            'Legal Purposes',
          ]),
          remarks: faker.helpers.maybe(() => faker.lorem.sentence()),
          civilRegistrar: faker.person.fullName(),
          civilRegistrarPosition: 'Registrar',
          preparedByName: faker.person.fullName(),
          preparedByPosition: 'Civil Registry Officer',
          verifiedByName: faker.person.fullName(),
          verifiedByPosition: 'Civil Registrar',
          amountPaid: faker.number.float({
            min: 100,
            max: 500,
            fractionDigits: 2,
          }),
          orNumber: faker.string.numeric(7),
          datePaid: faker.date.recent(),
        };
        const baseForm = await prisma.civilRegistryFormBase.create({
          data: baseFormData,
        });
        if (formType === 'FORM_1A') {
          await prisma.civilRegistryForm1A.create({
            data: {
              baseFormId: baseForm.id,
              nameOfChild: faker.person.fullName(),
              sex: faker.helpers.arrayElement(['Male', 'Female']),
              dateOfBirth: randomDate(new Date(2020, 0, 1), new Date()),
              placeOfBirth: faker.location.city(),
              nameOfMother: faker.person.fullName(),
              citizenshipMother: 'Filipino',
              nameOfFather: faker.person.fullName(),
              citizenshipFather: 'Filipino',
              dateMarriageParents: faker.date.past(),
              placeMarriageParents: faker.location.city(),
            },
          });
        } else if (formType === 'FORM_2A') {
          await prisma.civilRegistryForm2A.create({
            data: {
              baseFormId: baseForm.id,
              nameOfDeceased: faker.person.fullName(),
              sex: faker.helpers.arrayElement(['Male', 'Female']),
              age: faker.number.int({ min: 1, max: 100 }),
              civilStatus: faker.helpers.arrayElement([
                'Single',
                'Married',
                'Widowed',
                'Divorced',
              ]),
              citizenship: 'Filipino',
              dateOfDeath: randomDate(new Date(2020, 0, 1), new Date()),
              placeOfDeath: faker.location.city(),
              causeOfDeath: faker.helpers.arrayElement([
                'Cardiac Arrest',
                'Respiratory Failure',
                'Multiple Organ Failure',
              ]),
            },
          });
        } else if (formType === 'FORM_3A') {
          await prisma.civilRegistryForm3A.create({
            data: {
              baseFormId: baseForm.id,
              husbandName: faker.person.fullName(),
              husbandDateOfBirthAge: `${randomDate(
                new Date(1970, 0, 1),
                new Date(2000, 0, 1)
              ).toISOString()} (${faker.number.int({ min: 20, max: 50 })})`,
              husbandCitizenship: 'Filipino',
              husbandCivilStatus: faker.helpers.arrayElement([
                'Single',
                'Married',
                'Widowed',
                'Divorced',
              ]),
              husbandMother: faker.person.fullName(),
              husbandFather: faker.person.fullName(),
              wifeName: faker.person.fullName(),
              wifeDateOfBirthAge: `${randomDate(
                new Date(1970, 0, 1),
                new Date(2000, 0, 1)
              ).toISOString()} (${faker.number.int({ min: 20, max: 50 })})`,
              wifeCitizenship: 'Filipino',
              wifeCivilStatus: faker.helpers.arrayElement([
                'Single',
                'Married',
                'Widowed',
                'Divorced',
              ]),
              wifeMother: faker.person.fullName(),
              wifeFather: faker.person.fullName(),
              dateOfMarriage: randomDate(new Date(2020, 0, 1), new Date()),
              placeOfMarriage: faker.location.city(),
            },
          });
        }
        return baseForm;
      })
  );
  const formIds = civilRegistryForms.map((form) => form.id);
  // Create additional Document entries.
  const documents = await Promise.all(
    Array(20)
      .fill(null)
      .map(() =>
        prisma.document.create({
          data: {
            type: faker.helpers.arrayElement([
              'BIRTH_CERTIFICATE',
              'DEATH_CERTIFICATE',
              'MARRIAGE_CERTIFICATE',
            ]),
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            metadata: {},
            version: 1,
            isLatest: true,
            createdAt: randomDate(new Date(2021, 0, 1), new Date()),
          },
        })
      )
  );
  const documentIds = documents.map((doc) => doc.id);
  if (formIds.length === 0 || documentIds.length === 0) {
    console.error(
      'Cannot generate CertifiedCopy records: formIds or documentIds is empty.'
    );
    return;
  }
  const certifiedCopyData = Array(50)
    .fill(null)
    .map(() => generateCertifiedCopy(formIds, documentIds));
  await prisma.certifiedCopy.createMany({ data: certifiedCopyData });
  console.log('Certified Copy data seeded successfully!');
};

/* ======================================================================
   Bulk Data Generation
   ====================================================================== */

/**
 * Generate bulk data for marriage, birth, and death certificates.
 */
export const generateBulkData = async (
  prisma: PrismaClient,
  userIds: string[],
  count = 1000
): Promise<void> => {
  if (userIds.length === 0) {
    throw new Error('No user IDs available for preparedById');
  }
  console.log('Generating bulk data...');
  const recordTypes = Array(count)
    .fill(null)
    .map(() => faker.helpers.arrayElement(['marriage', 'birth', 'death']));
  for (let i = 0; i < recordTypes.length; i++) {
    const recordType = recordTypes[i];
    const createdAt = randomDate(new Date(2021, 0, 1), new Date());
    if (recordType === 'marriage') {
      await prisma.baseRegistryForm.create({
        data: {
          ...generateBaseRegistryForm(FormType.MARRIAGE, userIds, createdAt),
          createdAt,
          marriageCertificateForm: {
            create: generateMarriageCertificate(userIds, createdAt)
              .marriageCertificateForm,
          },
        },
      });
    } else if (recordType === 'birth') {
      await prisma.baseRegistryForm.create({
        data: {
          ...generateBaseRegistryForm(FormType.BIRTH, userIds, createdAt),
          createdAt,
          birthCertificateForm: {
            create: generateBirthCertificate(userIds, createdAt)
              .birthCertificateForm,
          },
        },
      });
    } else if (recordType === 'death') {
      await prisma.baseRegistryForm.create({
        data: {
          ...generateBaseRegistryForm(FormType.DEATH, userIds, createdAt),
          createdAt,
          deathCertificateForm: {
            create: generateDeathCertificate(userIds, createdAt)
              .deathCertificateForm,
          },
        },
      });
    }
    if (i % 100 === 0) console.log(`Generated ${i} records...`);
  }
  console.log('Bulk data generation completed!');
};

/* ======================================================================
   Additional Test Data Generation
   ====================================================================== */

/**
 * Generate additional test data for additional documents and certified copies.
 */
export const generateAdditionalData = async (prisma: PrismaClient) => {
  console.log('Generating additional test data...');
  console.log('Generating additional documents...');
  const additionalDocs = await Promise.all(
    Array(10)
      .fill(null)
      .map(() =>
        prisma.document.create({
          data: {
            type: faker.helpers.arrayElement([
              'BIRTH_CERTIFICATE',
              'DEATH_CERTIFICATE',
              'MARRIAGE_CERTIFICATE',
            ]),
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            metadata: {},
            version: 1,
            isLatest: true,
            createdAt: randomDate(new Date(2021, 0, 1), new Date()),
          },
        })
      )
  );
  const additionalDocIds = additionalDocs.map((doc) => doc.id);
  const civilRegistryForms = await prisma.civilRegistryFormBase.findMany({
    select: { id: true },
  });
  const formIds = civilRegistryForms.map((form) => form.id);
  if (formIds.length === 0 || additionalDocIds.length === 0) {
    console.error(
      'Cannot generate CertifiedCopy records: formIds or documentIds is empty.'
    );
    return;
  }
  console.log(`Generating 50 certified copy requests (additional)...`);
  const certifiedCopyData = Array(50)
    .fill(null)
    .map(() => ({
      ...generateCertifiedCopy(formIds, additionalDocIds),
      attachmentId: faker.helpers.arrayElement(additionalDocIds),
    }));
  await prisma.certifiedCopy.createMany({ data: certifiedCopyData });
  console.log('Additional test data generation completed!');
};

/* ======================================================================
   Seed Data for Audit Logs, Accounts, Sessions, Roles & RolePermissions,
   Verification, and Queue, Document, Attachment, Workflow.
   ====================================================================== */

export const seedAuditLogData = async (
  prisma: PrismaClient,
  userIds: string[]
) => {
  console.log('Seeding AuditLog data...');
  const documents = await prisma.document.findMany({ select: { id: true } });
  const forms = await prisma.civilRegistryFormBase.findMany({
    select: { id: true },
  });
  const documentIds = documents.map((doc) => doc.id);
  const formIds = forms.map((form) => form.id);
  // Fallback in case arrays are empty
  if (documentIds.length === 0) {
    console.warn('No documents found. Creating a dummy document...');
    const dummyDoc = await prisma.document.create({
      data: {
        type: AttachmentType.BIRTH_CERTIFICATE,
        title: 'Dummy Document',
        description: 'Fallback dummy document',
        metadata: {},
        status: DocumentStatus.PENDING,
        version: 1,
        isLatest: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    documentIds.push(dummyDoc.id);
  }
  if (formIds.length === 0) {
    console.warn('No civil registry forms found. Creating a dummy form...');
    const dummyForm = await prisma.civilRegistryFormBase.create({
      data: {
        formType: CivilRegistryFormType.FORM_1A,
        registryNumber: '00000000',
        issuedTo: 'Dummy',
        purpose: 'Dummy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    formIds.push(dummyForm.id);
  }
  const actions = [
    'USER_LOGIN',
    'USER_LOGOUT',
    'DOCUMENT_CREATED',
    'DOCUMENT_UPDATED',
    'FORM_SUBMITTED',
    'ACCOUNT_UPDATED',
  ];
  const auditLogsData = Array(100)
    .fill(null)
    .map(() => {
      const userId = faker.helpers.arrayElement(userIds);
      const userName = faker.person.fullName();
      const action = faker.helpers.arrayElement(actions);
      const entityType = faker.helpers.arrayElement([
        'User',
        'Document',
        'CivilRegistryForm',
        'Account',
      ]);
      const documentId =
        entityType === 'Document'
          ? faker.helpers.arrayElement(documentIds)
          : null;
      const civilRegistryFormId =
        entityType === 'CivilRegistryForm'
          ? faker.helpers.arrayElement(formIds)
          : null;
      const details = { info: faker.lorem.sentence() };
      const ipAddress = faker.internet.ip();
      const userAgent = faker.internet.userAgent();
      const createdAt = faker.date.recent();
      return {
        userId,
        userName,
        action,
        entityType,
        documentId,
        civilRegistryFormId,
        details,
        ipAddress,
        userAgent,
        createdAt,
      };
    });
  await prisma.auditLog.createMany({ data: auditLogsData });
  console.log('AuditLog data seeded successfully!');
};

export const seedAccountData = async (
  prisma: PrismaClient,
  userIds: string[]
) => {
  console.log('Seeding Account data...');
  const accountsData = Array(20)
    .fill(null)
    .map(() => ({
      accountId: faker.string.uuid(),
      providerId: faker.helpers.arrayElement(['google', 'facebook', 'github']),
      userId: faker.helpers.arrayElement(userIds),
      password: faker.string.alpha(10),
      accessToken: faker.string.alpha(20),
      refreshToken: faker.string.alpha(20),
      idToken: faker.string.alpha(20),
      createdAt: faker.date.recent(),
      updatedAt: new Date(),
    }));
  await prisma.account.createMany({ data: accountsData });
  console.log('Account data seeded successfully!');
};

export const seedSessionData = async (
  prisma: PrismaClient,
  userIds: string[]
) => {
  console.log('Seeding Session data...');
  const sessionsData = Array(20)
    .fill(null)
    .map(() => ({
      expiresAt: faker.date.future(),
      token: faker.string.uuid(),
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
      userId: faker.helpers.arrayElement(userIds),
      createdAt: faker.date.recent(),
      updatedAt: new Date(),
    }));
  await prisma.session.createMany({ data: sessionsData });
  console.log('Session data seeded successfully!');
};

/**
 * Seed Verification data.
 */
export const seedVerificationData = async (prisma: PrismaClient) => {
  console.log('Seeding Verification data...');
  const verificationData = Array(10)
    .fill(null)
    .map(() => ({
      id: faker.string.uuid(),
      identifier: faker.internet.email(),
      value: faker.string.alphanumeric(20),
      expiresAt: faker.date.future(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    }));
  await prisma.verification.createMany({ data: verificationData });
  console.log('Verification data seeded successfully!');
};

/**
 * Seed Queue data.
 */
export const seedQueueData = async (
  prisma: PrismaClient,
  userIds: string[]
) => {
  console.log('Seeding Queue data...');
  const queueData = Array(20)
    .fill(null)
    .map(() => ({
      kioskNumber: faker.number.int({ min: 1, max: 10 }),
      status: faker.helpers.arrayElement(Object.values(QueueStatus)),
      serviceType: faker.helpers.arrayElement(Object.values(ServiceType)),
      userId: faker.helpers.arrayElement(userIds),
      email: faker.internet.email(),
      documents: [faker.lorem.word(), faker.lorem.word()],
      processingNotes: faker.helpers.maybe(() => faker.lorem.sentence(), {
        probability: 0.5,
      }),
      createdAt: faker.date.past(),
      updatedAt: new Date(),
      completedAt: faker.helpers.maybe(() => faker.date.recent(), {
        probability: 0.5,
      }),
      userName: faker.person.fullName(),
    }));
  await prisma.queue.createMany({ data: queueData });
  console.log('Queue data seeded successfully!');
};

/**
 * Seed Document data.
 */
export const seedDocumentData = async (prisma: PrismaClient) => {
  console.log('Seeding Document data...');
  const documentData = Array(20)
    .fill(null)
    .map(() => ({
      type: faker.helpers.arrayElement(Object.values(AttachmentType)),
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      metadata: {},
      status: faker.helpers.arrayElement(Object.values(DocumentStatus)),
      version: 1,
      isLatest: true,
      createdAt: faker.date.past(),
      updatedAt: new Date(),
    }));
  await prisma.document.createMany({ data: documentData });
  console.log('Document data seeded successfully!');
};

/**
 * Seed Attachment data.
 */
export const seedAttachmentData = async (
  prisma: PrismaClient,
  userIds: string[],
  documentIds: string[]
) => {
  console.log('Seeding Attachment data...');
  const attachmentData = Array(20)
    .fill(null)
    .map(() => ({
      userId: faker.helpers.arrayElement(userIds),
      documentId: faker.helpers.arrayElement(documentIds),
      type: faker.helpers.arrayElement(Object.values(AttachmentType)),
      fileUrl: faker.internet.url(),
      fileName: faker.system.commonFileName(),
      fileSize: faker.number.int({ min: 1000, max: 500000 }),
      mimeType: faker.helpers.arrayElement([
        'image/jpeg',
        'application/pdf',
        'image/png',
      ]),
      status: faker.helpers.arrayElement(Object.values(DocumentStatus)),
      uploadedAt: faker.date.past(),
      updatedAt: new Date(),
      verifiedAt: faker.helpers.maybe(() => faker.date.recent(), {
        probability: 0.5,
      }),
      notes: faker.helpers.maybe(() => faker.lorem.sentence(), {
        probability: 0.5,
      }),
      metadata: {},
      hash: faker.string.alphanumeric(32),
    }));
  await prisma.attachment.createMany({ data: attachmentData });
  console.log('Attachment data seeded successfully!');
};

/**
 * Seed Workflow data (with steps).
 */
export const seedWorkflowData = async (
  prisma: PrismaClient,
  userIds: string[]
) => {
  console.log('Seeding Workflow data...');
  await Promise.all(
    Array(5)
      .fill(null)
      .map(async (_, i) => {
        const createdBy = faker.helpers.arrayElement(userIds);
        await prisma.workflow.create({
          data: {
            name: `Workflow ${i + 1}`,
            description: faker.lorem.sentence(),
            isActive: true,
            createdBy: createdBy,
            createdByName: faker.person.fullName(),
            steps: {
              create: Array(3)
                .fill(null)
                .map((_, j) => ({
                  name: `Step ${j + 1}`,
                  order: j + 1,
                  isRequired: faker.datatype.boolean(),
                  deadline: faker.helpers.maybe(() => faker.date.future(), {
                    probability: 0.5,
                  }),
                  status: faker.helpers.arrayElement([
                    'Pending',
                    'Completed',
                    'In Progress',
                  ]),
                })),
            },
          },
        });
      })
  );
  console.log('Workflow data seeded successfully!');
};

/* ======================================================================
   Final Combined Export
   ====================================================================== */

/**
 * Generate all test data (bulk data, additional data, feedback, notifications,
 * audit logs, accounts, sessions, verification, queues, documents, attachments,
 * workflows) for every table.
 * User IDs are passed from seed.ts.
 */
export const generateTestData = async (
  prisma: PrismaClient,
  userIds: string[]
) => {
  // First, seed data that is needed for relationships
  await seedAccountData(prisma, userIds);
  await seedSessionData(prisma, userIds);
  await generateBulkData(prisma, userIds);
  await generateAdditionalData(prisma);
  await seedFeedbackData(prisma, userIds);
  await seedNotificationData(prisma, userIds);
  await seedAuditLogData(prisma, userIds);
  await seedVerificationData(prisma);
  await seedQueueData(prisma, userIds);
  await seedDocumentData(prisma);
  // After seeding documents, fetch their IDs:
  const docs = await prisma.document.findMany({ select: { id: true } });
  const documentIds = docs.map((doc) => doc.id);
  await seedAttachmentData(prisma, userIds, documentIds);
  await seedWorkflowData(prisma, userIds);
};
