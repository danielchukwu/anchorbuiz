import { useEffect, useState } from "react";
import {
  useCurrencies,
  useCurrencyByCode,
  useCurrencyById,
} from "@repo/convex/client";
import ArrowDownIcon from "../../icons/arrow-down-icon";
import { SelectProps } from "../../lib/types";
import { cn } from "../../lib/utils";
import { Button } from "../button";
import { GeneralCommand } from "../command/general-command";
import { SelectResponsiveWrapper } from "./select-responsive-wrapper";
import { Doc, Id } from "@repo/convex/client";

type Currency = Doc<"currencies">;

export const SelectCurrency = ({
  update,
  errorMsg,
  selectedId,
}: SelectProps<Currency, string | Id<"currencies">>) => {
  const [open, setOpen] = useState(false);
  const currencies = useCurrencies();

  // Try to find selected currency either by ID or by Code
  const currencyById = useCurrencyById(selectedId as Id<"currencies">);
  const currencyByCode = useCurrencyByCode(selectedId as string);

  const selectedCurrency = currencyById || currencyByCode;
  const [selectedItem, setSelectedItem] = useState(selectedCurrency);

  useEffect(() => {
    if (selectedCurrency) {
      setSelectedItem(selectedCurrency);
    }
  }, [selectedCurrency]);

  const handleSelect = (item: Currency) => {
    setSelectedItem(item);
    update(item);
    setOpen(false);
  };

  return (
    <SelectResponsiveWrapper
      open={open}
      onOpenChange={setOpen}
      placeholder="Select Currency"
      align="start"
      trigger={
        <Button
          variant="select"
          className={cn(
            "justify-between w-full gap-2",
            errorMsg && "border-0.8 border-red",
          )}
          type="button"
        >
          <p className="whitespace-normal text-left line-clamp-1">
            {selectedItem ? selectedItem.name : "Currency"}
          </p>
          <ArrowDownIcon className="ml-auto text-c-80" />
        </Button>
      }
    >
      <GeneralCommand
        data={Array.isArray(currencies) ? currencies : []}
        getId={(item) => item._id}
        getName={(item) => item.name}
        getExtra={(item) => item.code}
        handleSelect={handleSelect}
        selectedId={selectedItem?._id ?? (selectedId as Id<"currencies">)}
      />
    </SelectResponsiveWrapper>
  );
};
