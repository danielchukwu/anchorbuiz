import { Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../command";
import { cn } from "../../lib/utils";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

type GeneralCommandProps<T> = {
  data: T[];
  selectedId: string | undefined;
  handleSelect: (item: T) => void;
  getId: (item: T) => string;
  getName: (item: T) => string;
  getLabel?: (item: T) => ReactNode;
  getDescription?: (item: T) => string | ReactNode;
  getExtra?: (item: T) => string;
  disableSearch?: boolean;
  tileSize?: number;
  status?: "CanLoadMore" | "LoadingMore" | "LoadingFirstPage" | "Exhausted";
  loadMore?: (numItems: number) => void;
  onSearch?: (search: string) => void;
  children?: ReactNode;
};

export function GeneralCommand<T>({
  data,
  selectedId,
  handleSelect,
  getId,
  getName,
  getLabel,
  getDescription,
  getExtra,
  disableSearch,
  status,
  loadMore,
  onSearch,
  children,
}: GeneralCommandProps<T>) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    onSearch?.(search);
  }, [search, onSearch]);

  // filter items manually based on search ONLY if not paginating
  const filteredItems = useMemo(() => {
    if (status !== undefined) return data; // Skip manual filter if using paginated data
    if (!search) return data;
    return data.filter((item) => {
      const name = getName(item).toLowerCase();
      const extra = getExtra ? getExtra(item).toLowerCase() : "";
      const description = getDescription ? getDescription(item) : "";
      const descriptionStr =
        typeof description === "string" ? description.toLowerCase() : "";

      return (
        name.includes(search.toLowerCase()) ||
        extra.includes(search.toLowerCase()) ||
        descriptionStr.includes(search.toLowerCase())
      );
    });
  }, [data, search, getName, getExtra, getDescription]);

  const handleScroll = () => {
    if (!parentRef.current || status !== "CanLoadMore" || !loadMore) return;
    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMore(20);
    }
  };

  return (
    <Command shouldFilter={status === undefined}>
      {!disableSearch && (
        <CommandInput
          placeholder="Search..."
          onValueChange={setSearch} // capture search value
        />
      )}
      <CommandList className="max-h-none overflow-visible">
        {filteredItems.length === 0 && status !== "LoadingFirstPage" ? (
          <CommandEmpty>None found.</CommandEmpty>
        ) : (
          <CommandGroup>
            <div
              ref={parentRef}
              onScroll={handleScroll}
              className="max-h-80 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain"
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col w-full">
                {filteredItems.map((item) => (
                  <CommandItem
                    key={getId(item)}
                    value={getName(item)}
                    onSelect={() => handleSelect(item)}
                    className="flex items-start gap-0 flex-col py-2 px-3 h-full cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full flex-1 min-w-0">
                      <div className="leading-5 font-[450] truncate flex-1 min-w-0">
                        {getLabel ? getLabel(item) : getName(item)}
                      </div>
                      <Check
                        className={cn(
                          "shrink-0",
                          selectedId === getId(item)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {getExtra && (
                        <p className="text-sml text-c-50 truncate text-left max-w-32 shrink-0">
                          {getExtra(item)}
                        </p>
                      )}
                    </div>
                    {getDescription && (
                      <p className="text-c-50 text-sm mt-1 truncate w-full">
                        {getDescription(item)}
                      </p>
                    )}
                  </CommandItem>
                ))}
              </div>
              {(status === "LoadingMore" || status === "LoadingFirstPage") && (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </CommandGroup>
        )}
        {children}
      </CommandList>
    </Command>
  );
}
