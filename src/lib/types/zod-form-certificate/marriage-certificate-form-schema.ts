import { z } from 'zod'
import {
  citizenshipSchema,
  cityMunicipalitySchema,
  createDateFieldSchema,
  nameSchemaOptional,
  paginationSchema,
  processingDetailsSchema,
  provinceSchema,
  registryNumberSchema,
} from './form-certificates-shared-schema'

/**
 * Helper schemas for common fields
 */
const locationSchema = z.object({
  houseNo: z.string().optional(),
  street: z.string().optional(),
  barangay: z.string().optional(),
  cityMunicipality: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  residence: z.string().optional(),
  internationalAddress: z.string().optional(),
})


const residenceSchemas = z.object({

  st: z.string().optional(),
  barangay: z.string().optional(),
  cityMunicipality: z.string().optional(), // Reuse shared city/municipality schema
  province: z.string().optional(), // Reuse shared province schema
  country: z.string().optional()
})


//*****BACK PAGE ***************************************** //
//*****BACK PAGE ***************************************** //
const affidavitOfSolemnizingOfficerSchema = z.object({

  a: z.object({
    nameOfHusband: nameSchemaOptional,
    nameOfWife: nameSchemaOptional
  }),
  b: z.object({
    a: z.boolean().default(false),
    b: z.boolean().default(false),
    c: z.boolean().default(false),
    d: z.boolean().default(false),
    e: z.boolean().default(false),
  }),
  c: z.string().optional(),
  d: z.object({
    dayOf: z.date().optional(),
    atPlaceExecute: locationSchema,
  }),
  dateSworn: z.object({
    dayOf: z.date().optional(),
    atPlaceOfSworn: locationSchema,
    ctcInfo: z.object({
      number: z.string().optional(),
      dateIssued: z.date().optional(),
      placeIssued: z.string().optional(),
    }),
  }),
  solemnizingOfficerInformation: z.object({
    officerName: z.object({
      first: z.string().optional(),
      middle: z.string().optional(), // Middle name can be optional
      last: z.string().optional(),
    }),
    officeName: z.string().optional(),
    // Signature removed
    address: z.string().optional(),
  }),
  administeringOfficerInformation: z.object({
    adminName: z.object({
      first: z.string().optional(),
      middle: z.string().optional(), // Middle name can be optional
      last: z.string().optional(),
    }),
    // Signature removed
    address: z.string().optional(),
    position: z.string().optional(),
  })
})

const affidavitForDelayedSchema = z.object({
  delayedRegistration: z.enum(['Yes', 'No']).optional(),

  administeringInformation: z.object({
    adminName: z.string().optional(),
    // Admin signature removed
    position: z.string().optional(),
    adminAddress: z.string().optional(),
  }).optional(), // Make this entire section optional

  applicantInformation: z.object({
    // Signature of applicant removed
    nameOfApplicant: z.string().optional(),
    applicantAddress: residenceSchemas.optional(), // Make the address optional
    postalCode: z
      .string()
      .min(4, 'Postal code must be at least 4 digits')
      .max(6, 'Postal code must be at most 6 digits')
      .regex(/^\d+$/, 'Postal code must contain only numbers')
      .optional(), // Make postal code optional
  }).optional(),

  a: z
    .object({
      a: z.object({
        agreement: z.boolean().default(false).optional(),
        nameOfPartner: z
          .object({
            first: z.string().optional(),
            middle: z.string().optional(),
            last: z.string().optional(),
          })
          .optional(),
        placeOfMarriage: z.string().optional(),
        dateOfMarriage: z.date().optional(),
      }).optional(),

      b: z.object({
        agreement: z.boolean().default(false).optional(),
        nameOfHusband: z
          .object({
            first: z.string().optional(),
            middle: z.string().optional(),
            last: z.string().optional(),
          })
          .optional(),
        nameOfWife: z
          .object({
            first: z.string().optional(),
            middle: z.string().optional(),
            last: z.string().optional(),
          })
          .optional(),
        placeOfMarriage: z.string().optional(),
        dateOfMarriage: z.date().optional(),
      }).optional(),
    }).optional(),

  b: z.object({
    solemnizedBy: z.string().optional(),

    sector: z
      .preprocess(
        (val) => (val === '' ? undefined : val),
        z
          .enum(['religious-ceremony', 'civil-ceremony', 'Muslim-rites', 'tribal-rites'])
          .optional()
      )
      .superRefine((val, ctx) => {
        if (val === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Sector status is required',
          });
        }
      }),
  }).optional(),

  c: z.object({
    a: z.object({
      licenseNo: z.string().optional(),
      dateIssued: z.date().optional(),
      placeOfSolemnizedMarriage: z.string().optional(),
    }).optional(),
    b: z.object({
      underArticle: z.string().optional(),
    }).optional(),
  }).optional(),

  d: z.object({
    husbandCitizenship: citizenshipSchema.optional(), // Make required fields optional
    wifeCitizenship: citizenshipSchema.optional(), // Make required fields optional
  }).optional(),

  e: z.string().optional(),

  f: z.object({
    date: z.date().optional(),// Make required fields optional
    place: residenceSchemas.optional(), // Make required fields optional
  }).optional(),

  dateSworn: z.object({
    dayOf: z.date().optional(),
    atPlaceOfSworn: residenceSchemas.optional(), // Make required fields optional
    ctcInfo: z.object({
      number: z.string().optional(),
      dateIssued: z.date().optional(),
      placeIssued: z.string().optional(),
    }).optional(),
  }).optional(),
}).optional(); // Make the entire affidavit section optional

/**
 * Main Marriage Certificate Schema
 */
export const marriageCertificateSchema = z.object({
  // Registry Information
  // Registry Information
  registryNumber: registryNumberSchema,
  province: provinceSchema,
  cityMunicipality: cityMunicipalitySchema,
  contractDay: z.date().optional(),

  pagination: paginationSchema.optional(),

  // Husband Information
  husbandName: nameSchemaOptional,
  husbandAge: z.number().int(),
  husbandBirth: z.date().optional(),
  husbandPlaceOfBirth: locationSchema,
  husbandSex: z
    .preprocess(
      (val) => (val === '' ? undefined : val),
      z.union([z.enum(['Male', 'Female']), z.undefined()])
    )
    .superRefine((val, ctx) => {
      if (val === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sex is required',
        });
      }
    }),
  husbandCitizenship: z.string(),
  husbandResidence: z.string(),
  husbandReligion: z.string(),
  husbandCivilStatus: z.string().optional(),
  husbandConsentPerson: z.object({
    name: nameSchemaOptional,
    relationship: z.string(),
    residence: locationSchema
  }),
  husbandParents: z.object({
    fatherName: nameSchemaOptional,
    fatherCitizenship: z.string(),
    motherName: nameSchemaOptional,
    motherCitizenship: z.string()
  }),

  // Wife Information
  wifeName: nameSchemaOptional,
  wifeAge: z.number().int(),
  wifeBirth: z.date().optional(),
  wifePlaceOfBirth: locationSchema,
  wifeSex: z
    .preprocess(
      (val) => (val === '' ? undefined : val),
      z.union([z.enum(['Male', 'Female']), z.undefined()])
    )
    .superRefine((val, ctx) => {
      if (val === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sex is required',
        });
      }
    }),
  wifeCitizenship: z.string(),
  wifeResidence: z.string(),
  wifeReligion: z.string(),
  wifeCivilStatus: z.string().optional(),
  wifeConsentPerson: z.object({
    name: nameSchemaOptional,
    relationship: z.string(),
    residence: locationSchema
  }),
  wifeParents: z.object({
    fatherName: nameSchemaOptional,
    fatherCitizenship: z.string(),
    motherName: nameSchemaOptional,
    motherCitizenship: z.string()
  }),

  // Marriage Details
  placeOfMarriage: z.object({
    ...locationSchema.shape
  }),
  dateOfMarriage: z.date().optional(),
  timeOfMarriage: z.date().optional(),

  // Witnesses
  husbandWitnesses: z.array(z.object({
    name: z.string().optional(),
    // Signature removed
  })),
  wifeWitnesses: z.array(z.object({
    name: z.string().optional(),
    // Signature removed
  })),

  // Contracting Parties
  husbandContractParty: z.object({
    // Signature removed
    agreement: z.boolean().optional()
  }),

  wifeContractParty: z.object({
    // Signature removed
    agreement: z.boolean().optional()
  }),


  // Marriage License Details
  marriageLicenseDetails: z.object({
    licenseNumber: z.string().optional(),
    dateIssued: z.date().optional(),
    placeIssued: z.string().optional(),
    marriageAgreement: z.boolean()
  }),

  // Marriage Article
  marriageArticle: z.object({
    article: z.string().optional(),
    marriageArticle: z.boolean()
  }),

  // Marriage Settlement
  marriageSettlement: z.boolean(),
  executiveOrderApplied: z.boolean().optional(),
  // Solemnizing Officer
  solemnizingOfficer: z.object({
    name: z.string().optional(),
    position: z.string().optional(),
    // Signature removed
    registryNoExpiryDate: z.string()
  }),

  // Registered at Civil Registrar
  // preparedBy: processingDetailsSchema.shape.preparedBy,
  receivedBy: processingDetailsSchema.shape.receivedBy,
  registeredByOffice: processingDetailsSchema.shape.registeredBy,

  // Optional Sections
  remarks: z.string().optional(),

  //*****BACK PAGE ***************************************** //
  affidavitOfSolemnizingOfficer: affidavitOfSolemnizingOfficerSchema,

  affidavitForDelayed: affidavitForDelayedSchema.optional(),
  id: z.string().optional(),

})

// Export the TypeScript type for the form values
export type MarriageCertificateFormValues = z.infer<
  typeof marriageCertificateSchema
>


export interface MarriageCertificateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
}

export interface MarriageProps {
  id?: string
}