"use client";

import DatePickerField from "@/components/custom/datepickerfield/date-picker-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MarriageCertificateFormValues } from "@/lib/types/zod-form-certificate/marriage-certificate-form-schema";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import TimePicker from "@/components/custom/time/time-picker";
import PlaceOfMarriageCard from "./locations/place-of-marriage";

const MarriageDetailsCard: React.FC = () => {
  const { control, getValues, setValue, watch } =
    useFormContext<MarriageCertificateFormValues>();
  const [marriageNcr, setNcrMode] = useState(false);
  const [useFullAddressInput, setUseFullAddressInput] = useState(false);

  // Watch for changes in the address fields for synchronization
  const province = watch("placeOfMarriage.province");
  const cityMunicipality = watch("placeOfMarriage.cityMunicipality");
  const barangay = watch("placeOfMarriage.barangay");
  const fullAddress = watch("placeOfMarriage.address");

  useEffect(() => {
    // Detect NCR mode from fetched data on component mount
    const province = getValues("placeOfMarriage.province");
    if (province === "Metro Manila" || province === "NCR") {
      setNcrMode(true);
    }

    // Detect if fullAddress is already set to determine initial view mode
    const hasFullAddress = !!getValues("placeOfMarriage.address");
    if (hasFullAddress) {
      setUseFullAddressInput(true);
    }
  }, [getValues]);

  useEffect(() => {
    if (marriageNcr === true) {
      setValue("placeOfMarriage.province", "Metro Manila");
    }
  }, [marriageNcr, setValue]);

  // When switching to full address input, combine existing fields into the full address
  useEffect(() => {
    if (useFullAddressInput && !fullAddress) {
      const parts = [barangay, cityMunicipality, province].filter(Boolean);

      if (parts.length > 0) {
        setValue("placeOfMarriage.address", parts.join(", "));
      }
    }
  }, [
    useFullAddressInput,
    fullAddress,
    barangay,
    cityMunicipality,
    province,
    setValue,
  ]);

  // When switching from full address to location selector, try to parse the address
  // This is basic and would need more sophisticated parsing in a real application
  useEffect(() => {
    if (!useFullAddressInput && fullAddress && !province && !cityMunicipality) {
      const parts = fullAddress.split(",").map((part) => part.trim());

      if (parts.length >= 3) {
        setValue("placeOfMarriage.barangay", parts[0]);
        setValue("placeOfMarriage.cityMunicipality", parts[1]);
        setValue("placeOfMarriage.province", parts[2]);
      } else if (parts.length === 2) {
        setValue("placeOfMarriage.cityMunicipality", parts[0]);
        setValue("placeOfMarriage.province", parts[1]);
      } else if (parts.length === 1) {
        setValue("placeOfMarriage.province", parts[0]);
      }
    }
  }, [useFullAddressInput, fullAddress, province, cityMunicipality, setValue]);

  // Clear the full address when switching to location selector mode
  const handleAddressInputModeChange = (newValue: boolean) => {
    setUseFullAddressInput(newValue);

    // If turning OFF the single address input, clear the address field
    if (!newValue) {
      setValue("placeOfMarriage.address", "");
    }
  };

  return (
    <Card className="border dark:border-border">
      <CardHeader>
        <CardTitle>Marriage Details</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={useFullAddressInput}
            onCheckedChange={handleAddressInputModeChange}
            id="address-type-switch"
          />
          <FormLabel htmlFor="address-type-switch" className="cursor-pointer">
            Use single address input
          </FormLabel>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          {/* Conditional rendering based on address input mode */}
          {useFullAddressInput ? (
            <div className="col-span-full md:col-span-3">
              <FormField
                control={control}
                name="placeOfMarriage.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complete Address</FormLabel>
                    <FormControl>
                      <Textarea
                        className="resize-none min-h-24"
                        placeholder="Enter complete address of marriage"
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
            /* Location Selector */
            <PlaceOfMarriageCard />
          )}

          {/* Date of Marriage */}
          <FormField
            control={control}
            name="dateOfMarriage"
            render={({ field }) => (
              <DatePickerField
                field={{
                  value: field.value || "",
                  onChange: field.onChange,
                }}
                label="Date of Marriage"
                ref={field.ref}
                placeholder="Select date of marriage"
              />
            )}
          />

          {/* Time of Marriage */}
          <FormField
            control={control}
            name="timeOfMarriage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time of Marriage</FormLabel>
                <FormControl>
                  <TimePicker
                    value={field.value ?? null}
                    onChange={(value) => field.onChange(value)}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MarriageDetailsCard;
