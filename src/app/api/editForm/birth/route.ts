// /pages/api/editForm/birth/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Helper function to recursively replace null/undefined with {} if the value is an object.
const replaceNulls = (obj: any): any => {
  if (obj === null || obj === undefined) return {};
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(replaceNulls);
  const newObj: Record<string, any> = {};
  for (const key in obj) {
    newObj[key] = replaceNulls(obj[key]);
  }
  return newObj;
};

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log("Received body:", body);

    const {
      id,
      registryNumber,
      province,
      cityMunicipality,
      pageNumber,
      bookNumber,
      remarks,
      preparedBy,
      preparedByDate,
      receivedBy,
      receivedByPosition,       // <-- Added
      receivedByDate,
      registeredBy,
      registeredByPosition,     // <-- Added
      registeredByDate,
      childInfo,
      motherInfo,
      fatherInfo,
      parentMarriage,
      attendant,
      informant,
      hasAffidavitOfPaternity,
      affidavitOfPaternityDetails,
      isDelayedRegistration,
      affidavitOfDelayedRegistration,
      reasonForDelay,
    } = body;

    // Optional JSON fields: if null, default to {}.
    const safeAffidavitOfPaternityDetails = replaceNulls(affidavitOfPaternityDetails);
    const safeAffidavitOfDelayedRegistration = replaceNulls(affidavitOfDelayedRegistration);

    // For JSON fields that are required objects, ensure valid objects.
    const safeChildPlaceOfBirth = replaceNulls(childInfo?.placeOfBirth);
    const safeMotherResidence = replaceNulls(motherInfo?.residence);
    const safeFatherResidence = replaceNulls(fatherInfo?.residence);
    const safeParentMarriage = replaceNulls(parentMarriage);
    const safeAttendant = replaceNulls(attendant);
    const safeInformant = replaceNulls(informant);
    const safePreparer = replaceNulls(preparedBy);

    // For string fields that are stored as JSON scalars, pass as string.
    const safeReceivedBy = receivedBy || "";
    const safeRegisteredBy = registeredBy || "";

    // Map name objects.
    const safeChildName = childInfo
      ? replaceNulls({
          first: childInfo.firstName || "",
          middle: childInfo.middleName || "",
          last: childInfo.lastName || "",
        })
      : { first: "", middle: "", last: "" };

    const safeMotherName = motherInfo
      ? replaceNulls({
          first: motherInfo.firstName || "",
          middle: motherInfo.middleName || "",
          last: motherInfo.lastName || "",
        })
      : { first: "", middle: "", last: "" };

    const safeFatherName = fatherInfo
      ? replaceNulls({
          first: fatherInfo.firstName || "",
          middle: fatherInfo.middleName || "",
          last: fatherInfo.lastName || "",
        })
      : { first: "", middle: "", last: "" };

    const updatedForm = await prisma.baseRegistryForm.update({
      where: { id },
      data: {
        registryNumber,
        province,
        cityMunicipality,
        pageNumber,
        bookNumber,
        remarks,
        preparedByDate: preparedByDate ? new Date(preparedByDate) : null,
        receivedBy: receivedBy || "",
        receivedByPosition: receivedByPosition || "", // <-- Added
        receivedByDate: receivedByDate ? new Date(receivedByDate) : null,
        registeredBy: registeredBy || "",
        registeredByPosition: registeredByPosition || "", // <-- Added
        registeredByDate: registeredByDate ? new Date(registeredByDate) : null,
        updatedAt: new Date(),
        birthCertificateForm: {
          upsert: {
            update: {
              childName: safeChildName,
              sex: childInfo?.sex || "",
              dateOfBirth: childInfo?.dateOfBirth ? new Date(childInfo.dateOfBirth) : new Date(),
              placeOfBirth: safeChildPlaceOfBirth,
              typeOfBirth: childInfo?.typeOfBirth || "",
              multipleBirthOrder: childInfo?.multipleBirthOrder,
              birthOrder: childInfo?.birthOrder,
              weightAtBirth: childInfo?.weightAtBirth ? Number(childInfo.weightAtBirth) : 0,
              motherMaidenName: safeMotherName,
              motherCitizenship: motherInfo?.citizenship || "",
              motherReligion: motherInfo?.religion || "",
              motherOccupation: motherInfo?.occupation || "",
              motherAge: Number(motherInfo?.age ?? 0),
              totalChildrenBornAlive: Number(motherInfo?.totalChildrenBornAlive ?? 0),
              childrenStillLiving: Number(motherInfo?.childrenStillLiving ?? 0),
              childrenNowDead: Number(motherInfo?.childrenNowDead ?? 0),
              motherResidence: safeMotherResidence,
              fatherName: safeFatherName,
              fatherCitizenship: fatherInfo?.citizenship || "",
              fatherReligion: fatherInfo?.religion || "",
              fatherOccupation: fatherInfo?.occupation || "",
              fatherAge: Number(fatherInfo?.age ?? 0),
              fatherResidence: safeFatherResidence,
              parentMarriage: safeParentMarriage,
              attendant: safeAttendant,
              informant: safeInformant,
              preparer: safePreparer,
              hasAffidavitOfPaternity,
              affidavitOfPaternityDetails: safeAffidavitOfPaternityDetails,
              affidavitOfDelayedRegistration: safeAffidavitOfDelayedRegistration,
              isDelayedRegistration,
              reasonForDelay: reasonForDelay || "",
            },
            create: {
              childName: safeChildName,
              sex: childInfo?.sex || "",
              dateOfBirth: childInfo?.dateOfBirth ? new Date(childInfo.dateOfBirth) : new Date(),
              placeOfBirth: safeChildPlaceOfBirth,
              typeOfBirth: childInfo?.typeOfBirth || "",
              multipleBirthOrder: childInfo?.multipleBirthOrder,
              birthOrder: childInfo?.birthOrder,
              weightAtBirth: childInfo?.weightAtBirth ? Number(childInfo.weightAtBirth) : 0,
              motherMaidenName: safeMotherName,
              motherCitizenship: motherInfo?.citizenship || "",
              motherReligion: motherInfo?.religion || "",
              motherOccupation: motherInfo?.occupation || "",
              motherAge: Number(motherInfo?.age ?? 0),
              totalChildrenBornAlive: Number(motherInfo?.totalChildrenBornAlive ?? 0),
              childrenStillLiving: Number(motherInfo?.childrenStillLiving ?? 0),
              childrenNowDead: Number(motherInfo?.childrenNowDead ?? 0),
              motherResidence: safeMotherResidence,
              fatherName: safeFatherName,
              fatherCitizenship: fatherInfo?.citizenship || "",
              fatherReligion: fatherInfo?.religion || "",
              fatherOccupation: fatherInfo?.occupation || "",
              fatherAge: Number(fatherInfo?.age ?? 0),
              fatherResidence: safeFatherResidence,
              parentMarriage: safeParentMarriage,
              attendant: safeAttendant,
              informant: safeInformant,
              preparer: safePreparer,
              hasAffidavitOfPaternity,
              affidavitOfPaternityDetails: safeAffidavitOfPaternityDetails,
              affidavitOfDelayedRegistration: safeAffidavitOfDelayedRegistration,
              isDelayedRegistration,
              reasonForDelay: reasonForDelay || "",
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, updatedForm });
  } catch (error: any) {
    console.error("Update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
