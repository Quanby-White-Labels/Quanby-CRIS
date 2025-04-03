"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  MarriageCertificateFormValues,
  MarriageProps,
} from "@/lib/types/zod-form-certificate/marriage-certificate-form-schema";
import React, { useEffect, useState } from "react";

import { useFormContext } from "react-hook-form";
import LocationSelector from "../shared-components/location-selector";
import NCRModeSwitch from "../shared-components/ncr-mode-switch";
import HusbandConsentPlace from "./locations/husband-consent-place";

const HusbandParentsInfoCard: React.FC = () => {
  const { control, getValues, setValue } =
    useFormContext<MarriageCertificateFormValues>();
  const [parentMode, setNcrMode] = useState(false);

  useEffect(() => {
    // Detect NCR mode from fetched data on component mount
    const province = getValues("husbandConsentPerson.residence.province");
    if (province === "Metro Manila" || province === "NCR") {
      setNcrMode(true);
    }
  }, [getValues]);

  useEffect(() => {
    if (parentMode === true) {
      setValue("husbandConsentPerson.residence.province", "Metro Manila");
    }
  });

  return (
    <Card className="border dark:border-border">
      <CardHeader>
        <CardTitle>Husband&apos;s Parents Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Father's First Name */}
          <FormField
            control={control}
            name="husbandParents.fatherName.first"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father&apos;s First Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
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
          {/* Father's Middle Name */}
          <FormField
            control={control}
            name="husbandParents.fatherName.middle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father&apos;s Middle Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
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
          {/* Father's Last Name */}
          <FormField
            control={control}
            name="husbandParents.fatherName.last"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father&apos;s Last Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Maiden Mother's First Name */}
          <FormField
            control={control}
            name="husbandParents.motherName.first"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother&apos;s First Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
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
          {/* Maiden Mother's Middle Name */}
          <FormField
            control={control}
            name="husbandParents.motherName.middle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother&apos;s Middle Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
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
          {/* Maiden Mother's last Name */}
          <FormField
            control={control}
            name="husbandParents.motherName.last"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother&apos;s (Maiden) Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Father's Citizenship */}
          <FormField
            control={control}
            name="husbandParents.fatherCitizenship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father&apos;s Citizenship</FormLabel>
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
          {/* Mother's Citizenship */}
          <FormField
            control={control}
            name="husbandParents.motherCitizenship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother&apos;s Citizenship</FormLabel>
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
        </div>

        {/* Adviser */}
        <div className="col-span-full py-12">
          <h3 className="font-bold ">
            Name of person Wali who gave consent or advise
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={control}
            name="husbandConsentPerson.name.first"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adviser (First Name)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter Adviser (first)"
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
            name="husbandConsentPerson.name.middle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adviser (Middle Name)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter Adviser (middle)"
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
            name="husbandConsentPerson.name.last"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adviser (Last Name)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter Adviser (last)"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Parents Residence */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Parents Relationship */}
          <FormField
            control={control}
            name="husbandConsentPerson.relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relationship </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter relationship"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <HusbandConsentPlace />
        </div>
      </CardContent>
    </Card>
  );
};

export default HusbandParentsInfoCard;
