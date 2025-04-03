"use client";

import DatePickerField from "@/components/custom/datepickerfield/date-picker-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DeathCertificateFormValues } from "@/lib/types/zod-form-certificate/death-certificate-form-schema";
import { useState, useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import NCRModeSwitch from "../shared-components/ncr-mode-switch";
import CivilStatus from "../shared-components/civil-status";
import { Switch } from "@/components/ui/switch";
import PlaceOfDeathCards from "./locations/place-of-death-place";
import ResidenceCards from "./locations/residence-place";

const DeceasedInformationCard: React.FC = () => {
  const { control, setValue, getValues } =
    useFormContext<DeathCertificateFormValues>();
  const [deceasedNCRMode, setDeceasedNCRMode] = useState(false);
  const initialRender = useRef(true);

  useEffect(() => {
    // Detect NCR mode from fetched data on component mount
    const province = getValues("placeOfDeath.province");
    if (province === "Metro Manila" || province === "NCR") {
      setDeceasedNCRMode(true);
    }
  }, [getValues]);

  useEffect(() => {
    if (deceasedNCRMode === true) {
      setValue("placeOfDeath.province", "Metro Manila");
    }
  });

  const locationType = useWatch({
    control,
    name: "placeOfDeath.locationType",
  });

  // Watch fields for overall business logic
  const dateOfBirth = useWatch({ control, name: "dateOfBirth" });
  const dateOfDeath = useWatch({ control, name: "dateOfDeath" });
  const sex = useWatch({ control, name: "sex" });
  const ageAtDeath = useWatch({ control, name: "ageAtDeath" });
  const typeOfBirth = useWatch({
    control,
    name: "birthInformation.typeOfBirth",
  });

  // Determine whether to show birth information
  const [shouldShowBirthInfo, setShouldShowBirthInfo] = useState(false);

  // Use useEffect with proper dependency array to only run when the switch changes
  useEffect(() => {
    if (!shouldShowBirthInfo) {
      // Clear the birth information fields when switch is turned off
      setValue("birthInformation.typeOfBirth", "Single");
      setValue("birthInformation.birthOrder", undefined);
      setValue("birthInformation.lengthOfPregnancy", undefined);
      setValue("birthInformation.methodOfDelivery", undefined);
      setValue("birthInformation.ageOfMother", undefined);
    }
  }, [shouldShowBirthInfo, setValue]); // Include dependencies

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Deceased Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name Section */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-sm font-semibold">1. Name Details</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={control}
                name="name.first"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter first name"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="name.middle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter middle name"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="name.last"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter last name"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Dates & Time Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Important Dates and Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>2. Sex</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger
                          ref={field.ref}
                          className="h-10 px-3 text-base md:text-sm"
                        >
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Death */}
              <FormField
                control={control}
                name="dateOfDeath"
                render={({ field }) => (
                  <FormItem>
                    <DatePickerField
                      field={{
                        value: field.value ?? "",
                        onChange: field.onChange,
                      }}
                      label="3. Date of Death"
                      placeholder="Select date of death"
                      ref={field.ref}
                    />
                  </FormItem>
                )}
              />
              {/* Date of Birth */}
              <FormField
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <DatePickerField
                      field={{
                        value: field.value ?? "",
                        onChange: field.onChange,
                      }}
                      label="4. Date of Birth"
                      placeholder="Select date of birth"
                      ref={field.ref}
                    />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Age at Death Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              5. Age at Time of Death
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <FormField
                control={control}
                name="ageAtDeath.years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="h-10 pr-8"
                        placeholder="Years"
                        inputMode="numeric"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? "" : value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="ageAtDeath.months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Months</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="h-10 pr-8"
                        placeholder="Months"
                        inputMode="numeric"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? "" : value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="ageAtDeath.days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="h-10 pr-8"
                        placeholder="Days"
                        inputMode="numeric"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? "" : value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="ageAtDeath.hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="h-10 pr-8"
                        placeholder="Hours"
                        inputMode="numeric"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? "" : value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="ageAtDeath.minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minutes/Seconds</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="h-10 pr-8"
                        placeholder="Hours"
                        inputMode="numeric"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? "" : value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Place of Death Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              6. Place of Death
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Toggle between Hospital and Address */}
            <div className="grid grid-cols-1 space-x-2 mb-6">
              <FormField
                control={control}
                name="placeOfDeath.locationType"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
                    <div className="space-y-0.5">
                      <FormLabel>Died in a Hospital/Institution?</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === "hospital"}
                        onCheckedChange={(checked) => {
                          const newValue = checked ? "hospital" : "address";
                          field.onChange(newValue);

                          // Clear appropriate fields based on selection
                          if (newValue === "hospital") {
                            setValue("placeOfDeath.houseNo", "");
                            setValue("placeOfDeath.st", "");
                          } else {
                            setValue("placeOfDeath.hospitalInstitution", "");
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <NCRModeSwitch
              isNCRMode={deceasedNCRMode}
              setIsNCRMode={setDeceasedNCRMode}
            />

            <div
              className={` ${
                locationType === "hospital"
                  ? "flex gap-4 items-center"
                  : "grid gap-4 mt-6 grid-cols-4"
              }`}
            >
              {/* Conditional Fields Based on Location Type */}
              {locationType === "hospital" ? (
                // Hospital/Institution Fields
                <div
                  className={`${locationType === "hospital" ? "flex-1" : ""}`}
                >
                  <FormField
                    control={control}
                    name="placeOfDeath.hospitalInstitution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Hospital / Clinic / Institution Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-10"
                            placeholder="Enter the name of the hospital or institution"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                // Specific Address Fields
                <>
                  <PlaceOfDeathCards />
                </>
              )}

              <div
                className={`${locationType === "hospital" ? "flex-none" : ""}`}
              >
                <CivilStatus
                  name="civilStatus"
                  label="7. Civil Status"
                  placeholder="Select civil status"
                  options={[
                    { value: "Single", label: "Single" },
                    { value: "Married", label: "Married" },
                    { value: "Widow", label: "Widow" },
                    { value: "Widower", label: "Widower" },
                    { value: "Annulled", label: "Annulled" },
                    { value: "Divorced", label: "Divorced" },
                  ]}
                  otherOptionValue="Other"
                  otherOptionLabel="Other (please specify)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Religion and Citizenship</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-6">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={control}
                name="religion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>8. Religion</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        className="h-10"
                        placeholder="Enter citizenship"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="citizenship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>9. Citizenship</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        className="h-10"
                        placeholder="Enter citizenship"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>11. Occupation</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter occupation"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* 10. Residence */}
        <Card>
          <CardHeader>
            <CardTitle>10. Residence</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResidenceCards />
          </CardContent>
        </Card>

        {/* Name of Father and Mother */}
        <Card>
          <CardHeader>
            <CardTitle>Name of Father and Mother</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name of Father */}
            <FormField
              control={control}
              name="parents.fatherName.first"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>12. Name of Father (first)</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="Enter father first name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="parents.fatherName.middle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name of Father (middle)</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="Enter father middle name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="parents.fatherName.last"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name of Father (last)</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="Enter father last name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Maiden Name of Mother */}
            <FormField
              control={control}
              name="parents.motherName.first"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>13. Maiden Name of Mother (first)</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="Enter mother first name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="parents.motherName.middle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maiden Name of Mother (middle)</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="Enter mother middle name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="parents.motherName.last"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maiden Name of Mother (last)</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="Enter mother last name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Birth Information Section - Conditionally Rendered */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>FOR CHILDREN AGED 0 TO 7 DAYS</CardTitle>
            <Switch
              checked={shouldShowBirthInfo}
              onCheckedChange={setShouldShowBirthInfo}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            {shouldShowBirthInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* For female cases, show Age of Mother */}

                <FormField
                  control={control}
                  name="birthInformation.ageOfMother"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>14. Age of Mother</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={10}
                          max={65}
                          className="h-10"
                          placeholder="Enter mother's age"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Method of Delivery */}
                <FormField
                  control={control}
                  name="birthInformation.methodOfDelivery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>15. Method of Delivery</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger ref={field.ref} className="h-10">
                            <SelectValue placeholder="Select delivery method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Normal spontaneous vertex">
                            Normal spontaneous vertex
                          </SelectItem>
                          <SelectItem value="Caesarean section">
                            Caesarean section
                          </SelectItem>
                          <SelectItem value="Forceps">Forceps</SelectItem>
                          <SelectItem value="Vacuum extraction">
                            Vacuum extraction
                          </SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Length of Pregnancy */}
                <FormField
                  control={control}
                  name="birthInformation.lengthOfPregnancy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>16. Length of Pregnancy (weeks)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={20}
                          max={45}
                          className="h-10"
                          placeholder="Enter weeks"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? "" : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Normal range: 37-42 weeks
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type of Birth */}
                <FormField
                  control={control}
                  name="birthInformation.typeOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>17. Type of Birth</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset birth order if type is Single
                          if (value === "Single") {
                            setValue("birthInformation.birthOrder", undefined);
                          }
                        }}
                        value={field.value || "Single"}
                      >
                        <FormControl>
                          <SelectTrigger ref={field.ref} className="h-10">
                            <SelectValue placeholder="Select type of birth" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Twin">Twin</SelectItem>
                          <SelectItem value="Triplet">Triplet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Only show Birth Order for multiple births */}
                {typeOfBirth !== "Single" && (
                  <FormField
                    control={control}
                    name="birthInformation.birthOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>18. Birth Order</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger ref={field.ref} className="h-10">
                              <SelectValue placeholder="Select birth order" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="First">First</SelectItem>
                            <SelectItem value="Second">Second</SelectItem>
                            <SelectItem value="Third">Third</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default DeceasedInformationCard;
