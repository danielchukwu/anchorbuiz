import { useEffect, useState } from "react";
import type { SelectProps } from "../../lib/types";
import { cn } from "../../lib/utils";
import { Button } from "../button";
import { GeneralCommand } from "../command/general-command";
import { SelectResponsiveWrapper } from "./select-responsive-wrapper";
import { useQuery } from "@tanstack/react-query";
import ArrowDownIcon from "../../icons/arrow-down-icon";
import { defaultCountries } from "./default-countries";

export interface Country {
  id: number;
  name: string;
  iso2?: string;
  phone_code?: string;
}

interface CountriesResponse {
  success: boolean;
  message: string;
  data: {
    countries: Country[];
  };
}

export const SelectCountry = ({
  align = "start",
  update,
  errorMsg,
  selectedId,
  className,
  disabled,
  fetchCountries,
  countries: propCountries,
  buttonText,
}: SelectProps<Country, number | string> & {
  fetchCountries?: () => Promise<any>;
  countries?: Country[];
  buttonText?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Country | undefined>(undefined);

  const { data, isLoading } = useQuery<CountriesResponse>({
    queryKey: ["GetAllCountries"],
    queryFn: async () => {
      if (!fetchCountries) return { success: true, message: "", data: { countries: defaultCountries } };
      const res = await fetchCountries();
      if (res && res.success && res.data) return res;
      if (Array.isArray(res)) return { success: true, message: "", data: { countries: res } };
      throw new Error(res?.message || "Failed to fetch countries");
    },
    enabled: !!fetchCountries && !propCountries,
    staleTime: Infinity,
  });

  const countries = propCountries || (fetchCountries ? data?.data?.countries : defaultCountries) || defaultCountries;

  useEffect(() => {
    if (selectedId) {
      const country = countries.find(
        (c) =>
          String(c.id) === String(selectedId) ||
          c.name.toLowerCase() === String(selectedId).toLowerCase(),
      );
      if (country) setSelectedItem(country);
    } else {
      setSelectedItem(undefined);
    }
  }, [selectedId, countries]);

  const handleSelect = (item: Country) => {
    setSelectedItem(item);
    update(item);
    setOpen(false);
  };

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const currentSelectedId = selectedItem?.id
    ? `${selectedItem.id}`
    : selectedId
      ? `${selectedId}`
      : undefined;
  const getId = (item: Country) => `${item.id}`;
  const getName = (item: Country) => item.name;
  const getLabel = (item: Country) => (
    <span className="flex items-center gap-2 capitalize">
      {item.iso2 && (
        <span className="country shrink-0">
          <img
            src={`https://flagcdn.com/w40/${item.iso2.toLowerCase()}.png`}
            width="23"
            alt=""
          />
        </span>
      )}
      <span>{item.name}</span>
    </span>
  );

  if (isLoading && countries.length === 0) {
    return (
      <Button
        variant="select"
        size="select"
        className={cn(
          "justify-between w-full gap-2 opacity-70",
          className,
        )}
        type="button"
        disabled
      >
        <span className="font-normal text-muted-foreground">
          Loading countries...
        </span>
        <ArrowDownIcon className="ml-auto shrink-0 text-c-80" />
      </Button>
    );
  }

  return (
    <SelectResponsiveWrapper
      open={open}
      onOpenChange={setOpen}
      placeholder={buttonText ?? "Select Country"}
      align={align}
      className={className}
      trigger={
        <Button
          variant="select"
          size="select"
          className={cn(
            "justify-between w-full gap-2",
            errorMsg && "border-0.8 border-red",
            className,
          )}
          type="button"
          disabled={disabled}
        >
          <div className="flex items-center gap-2 min-w-0">
            {selectedItem?.iso2 && (
              <span className="country shrink-0">
                <img
                  src={`https://flagcdn.com/w40/${selectedItem.iso2.toLowerCase()}.png`}
                  width="23"
                  alt=""
                />
              </span>
            )}
            <p className="whitespace-nowrap text-left truncate font-normal">
              {selectedItem ? selectedItem.name : (buttonText ?? "Select Country")}
            </p>
          </div>
          <ArrowDownIcon className="ml-auto shrink-0 text-c-80" />
        </Button>
      }
      desktopContent={
        <GeneralCommand
          data={filteredCountries}
          getId={getId}
          getName={getName}
          getLabel={getLabel}
          handleSelect={handleSelect}
          selectedId={currentSelectedId}
          onSearch={setSearch}
        />
      }
      mobileContent={
        <GeneralCommand
          data={filteredCountries}
          getId={getId}
          getName={getName}
          getLabel={getLabel}
          handleSelect={handleSelect}
          selectedId={currentSelectedId}
          onSearch={setSearch}
        />
      }
    />
  );
};
