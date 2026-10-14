import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Check, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import WhatsAppIcon from "@repo/ui/icons/whatsapp-icon";
import { Button } from "@repo/ui/components/button";
import { Input, Textarea } from "@repo/ui/components/input";
import { Drawer, DrawerContent, DrawerTitle } from "@repo/ui/components/drawer";
import { SelectCountry } from "@repo/ui/components/selects/country-select";
import { SelectState } from "@repo/ui/components/selects/state-select";
import { SelectDate } from "@repo/ui/components/selects/date-select";
import { AppSelect } from "@repo/ui/components/selects/app-select";
import { type ReactNode, useState } from "react";
import {
  useFetchStates,
  useFetchCountries,
  useRegistrationCountries,
} from "@repo/convex/hooks/useLocations";
import { usePackages } from "@repo/convex/hooks/usePackages";
import { useEntityTypesByCountry } from "@repo/convex/hooks/useCountryEntityTypes";
import { useCreateBusiness } from "@repo/convex/hooks/useBusinesses";
import { useAddShareholder } from "@repo/convex/hooks/useShareholders";
import { useUpsertProfile } from "@repo/convex/hooks/useProfiles";
import { useForm } from "react-hook-form";
import CountryFlag from "../../components/CountryFlag";

export const Route = createFileRoute("/(app)/register")({
  component: BusinessRegistrationPage,
});

/* -------------------------------------------------------------------------- */
/*                                CONSTANTS                                   */
/* -------------------------------------------------------------------------- */

// Countries & Packages & Entity Types are fetched live from Convex

const businessKinds = ["A new business", "An existing business"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

type RegistrationStep =
  | "intro"
  | "country"
  | "package"
  | "registered-elsewhere"
  | "registered-countries"
  | "business-name"
  | "structure"
  | "brief-description"
  | "activity-purpose"
  | "business-kind"
  | "start-date"
  | "personal-information"
  | "government-id"
  | "shareholders"
  | "shareholder-form"
  | "submitted";

type PersonalInformation = {
  firstName: string;
  lastName: string;
  otherNames: string;
  email: string;
  phone: string;
  whatsapp: string;
  residentialAddress: string;
  countryOfCitizenship: string;
  dateOfBirth: string;
  idType: string;
  idNumber: string;
};

type Shareholder = {
  firstName: string;
  lastName: string;
  ownership: string;
  email: string;
  phone: string;
  country: string;
  countryOriginalId?: number;
  state: string;
  stateOriginalId?: number;
  city: string;
  zipCode: string;
  address: string;
};

export type RegistrationFormData = {
  countryName: string;
  registeredElsewhere: "Yes" | "No";
  registeredCountries: string;
  businessName: string;
  structure: string;
  briefDescription: string;
  activityPurpose: string;
  businessKind: string;
  startYear: string;
  startMonth: string;
  personal: PersonalInformation;
  shareholders: Shareholder[];
};

type HeaderTone = "business" | "personal" | "ownership";

/* -------------------------------------------------------------------------- */
/*                        REUSABLE SHARED COMPONENTS                          */
/* -------------------------------------------------------------------------- */

interface StepHeaderProps {
  label?: string;
  tone?: HeaderTone;
  onBack?: () => void;
  showBack?: boolean;
}

export function StepHeader({
  label,
  tone = "business",
  onBack,
  showBack = true,
}: StepHeaderProps) {
  const toneColor =
    tone === "personal"
      ? "text-[#f3a177]"
      : tone === "ownership"
        ? "text-[#f28f98]"
        : "text-[#a29bd9]";

  return (
    <header className="sticky bg-background/90 backdrop-blur-xl top-0 left-0 flex h-16 w-full items-center justify-center pt-1">
      {showBack && onBack && (
        <button
          className="absolute left-0 top-1/2 -ml-2 -translate-y-1/2 rounded-full p-2 text-neutral-800 transition-colors hover:bg-neutral-100"
          type="button"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="size-6 stroke-[1.8]" aria-hidden="true" />
        </button>
      )}
      {label && (
        <span className={`text-base font-semibold ${toneColor}`}>{label}</span>
      )}
    </header>
  );
}

interface StepFooterProps {
  buttonText?: string;
  onClick: () => void;
  disabled?: boolean;
}

export function StepFooter({
  buttonText = "Continue",
  onClick,
  disabled = false,
}: StepFooterProps) {
  return (
    <div className="sticky bottom-0 z-10 -mx-6 mt-auto bg-gradient-to-t from-white via-white/95 to-transparent px-6 pb-8 pt-4 sm:pb-10 flex justify-center">
      <Button
        variant="default"
        className="mx-auto"
        // className="mx-auto flex h-16 w-full max-w-sm items-center justify-center rounded-full bg-[#5037ff] text-xl font-semibold text-white shadow-sm transition-all hover:bg-[#432ee6] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        onClick={onClick}
        disabled={disabled}
      >
        {buttonText}
      </Button>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-500">
      <span>{label}</span>
      {children}
    </label>
  );
}

function PhoneInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex h-16 w-full items-center gap-2.5 rounded-2xl border border-neutral-300 bg-background px-4 text-lg text-neutral-800 transition-all focus-within:border-[#5037ff] focus-within:ring-2 focus-within:ring-[#5037ff]/20">
      <span aria-label="Nigeria" title="Nigeria" className="text-xl">
        🇳🇬
      </span>
      <strong className="font-semibold text-neutral-700">+234</strong>
      <input
        autoComplete="tel-national"
        inputMode="tel"
        placeholder="090 2222 2222"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="flex-1 bg-transparent text-lg text-neutral-800 outline-none placeholder:text-neutral-400"
      />
    </div>
  );
}

function RadioChoices({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className="flex flex-col space-y-3"
      role="radiogroup"
      aria-label={name}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            className={`flex h-[68px] w-full items-center gap-4 rounded-2xl px-4 text-left text-lg transition-all sm:text-xl ${
              selected
                ? "bg-[#dfdbff] font-medium text-neutral-900"
                : "bg-transparent text-neutral-800 hover:bg-neutral-50"
            }`}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                selected ? "bg-[#5037ff] text-white" : "bg-neutral-300"
              }`}
            >
              {selected && (
                <Check className="size-4 stroke-[3]" aria-hidden="true" />
              )}
            </span>
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );
}

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh px-5 text-neutral-800">{children}</div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          STEP 1: INTRO STEP                                */
/* -------------------------------------------------------------------------- */

interface IntroStepProps {
  onStart: () => void;
}

function IntroStep({ onStart }: IntroStepProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <StepHeader onBack={() => router.navigate({ to: "/" })} />

      {/* Main Content */}
      <main className="mt-20 flex flex-col items-center text-center">
        <div className="flex h-44 w-full items-center justify-center">
          <img
            className="h-44 w-56 object-contain"
            src="https://pub-e0380ffeabae40d2aba932936caf9754.r2.dev/assets/3d-box.webp"
            alt="Decorated parcel ready to ship"
            loading="eager"
          />
        </div>
        <h1 className="mt-10 text-3xl font-extrabold tracking-tight text-[#342490] sm:text-4xl">
          Start Business
          <br />
          Registration Application
        </h1>
        <p className="mt-4 max-w-xs text-lg text-neutral-400 sm:text-xl">
          We help register business all over the world
        </p>

        <Button
          variant="default"
          className="mt-8 flex h-16 w-full max-w-sm items-center justify-center rounded-full bg-[#5037ff] text-xl font-semibold text-white shadow-sm transition-all hover:bg-[#432ee6] active:scale-[0.99]"
          type="button"
          onClick={onStart}
        >
          Start
        </Button>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         STEP 2: COUNTRY SELECT                             */
/* -------------------------------------------------------------------------- */

interface CountryStepProps {
  countryName: string;
  onSelectCountry: (country: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function CountryStep({
  countryName,
  onSelectCountry,
  onBack,
  onContinue,
}: CountryStepProps) {
  const registrationCountries = useRegistrationCountries();

  const countryList = (registrationCountries ?? []).map((c) => ({
    name: c.name,
    iso2: c.iso2,
  }));

  const isCountryValid = Boolean(countryName && countryName.trim());

  return (
    <StepWrapper>
      <StepHeader onBack={onBack} />
      <main className="flex-1">
        <h1 className="mb-8 text-2xl font-bold leading-snug tracking-tight text-[#342490] sm:text-3xl">
          Which country would you like to register your company?
        </h1>
        {registrationCountries === undefined ? (
          <div className="flex flex-col space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[68px] w-full animate-pulse rounded-2xl bg-neutral-100"
              />
            ))}
          </div>
        ) : (
          <div
            className="space-y-2"
            role="radiogroup"
            aria-label="Company registration country"
          >
            {countryList.map((item) => {
              const selected = item.name === countryName;
              return (
                <button
                  className={`flex h-[68px] w-full items-center gap-4 rounded-2xl px-4 text-left text-lg transition-all sm:text-xl ${
                    selected
                      ? "bg-[#dfdbff] font-medium text-neutral-900"
                      : "bg-transparent text-neutral-800 hover:bg-neutral-50"
                  }`}
                  key={item.name}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onSelectCountry(item.name)}
                >
                  <CountryFlag
                    iso2={item.iso2}
                    name={item.name}
                    className="size-8"
                    imgClassName="size-full rounded-full object-cover shadow-xs"
                  />
                  <span className="flex-1">{item.name}</span>
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                      selected ? "bg-[#5037ff] text-white" : "bg-neutral-300"
                    }`}
                  >
                    {selected && (
                      <Check className="size-4 stroke-[3]" aria-hidden="true" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </main>
      <StepFooter onClick={onContinue} disabled={!isCountryValid} />
    </StepWrapper>
  );
}

/* -------------------------------------------------------------------------- */
/*                         STEP 3: PACKAGE DETAILS                            */
/* -------------------------------------------------------------------------- */

interface PackageStepProps {
  country: { name: string; iso2?: string | null; originalId?: number };
  onBack: () => void;
  onContinue: () => void;
}

function PackageStep({ country, onBack, onContinue }: PackageStepProps) {
  const packages = usePackages(country.originalId);
  const selectedPackage = packages && packages.length > 0 ? packages[0] : null;

  const offerings: string[] = Array.isArray(selectedPackage?.offerings)
    ? (selectedPackage.offerings as string[])
    : [];

  const formattedNairaPrice =
    selectedPackage?.priceInNaira !== undefined
      ? `₦${selectedPackage.priceInNaira.toLocaleString()}`
      : selectedPackage?.currency === "NGN"
        ? `₦${selectedPackage.price.toLocaleString()}`
        : null;

  const formattedForeignPrice =
    selectedPackage?.currency && selectedPackage.currency !== "NGN"
      ? `${selectedPackage.currency} ${selectedPackage.price.toLocaleString()}`
      : null;

  const isPackageReady = packages !== undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader onBack={onBack} />
      <main className="flex-1 pb-6">
        <div className="flex flex-col items-center text-center">
          <div aria-label={country.name}>
            <CountryFlag
              iso2={country.iso2}
              name={country.name}
              className="size-16 sm:size-20"
              imgClassName="size-full rounded-full object-cover shadow-xs"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#342490] sm:text-3xl">
            {selectedPackage?.name ?? `${country.name} Package`}
          </h1>
        </div>

        {packages === undefined ? (
          <div className="mt-8 animate-pulse rounded-3xl bg-[#f6f4ff] p-6 space-y-4">
            <div className="h-4 w-16 bg-neutral-200 rounded" />
            <div className="h-8 w-48 bg-neutral-200 rounded" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-5 w-full bg-neutral-200 rounded" />
              ))}
            </div>
          </div>
        ) : (
          <section
            className="mt-8 rounded-3xl bg-[#f6f4ff] p-6 text-neutral-800"
            aria-label="Package price and inclusions"
          >
            <p className="text-base text-neutral-600">Price</p>
            <div className="mb-6 mt-2 flex flex-wrap items-baseline gap-2">
              {formattedNairaPrice ? (
                <>
                  <strong className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                    {formattedNairaPrice}
                  </strong>
                  {formattedForeignPrice && (
                    <span className="text-base text-neutral-400">
                      ({formattedForeignPrice})
                    </span>
                  )}
                </>
              ) : formattedForeignPrice ? (
                <strong className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                  {formattedForeignPrice}
                </strong>
              ) : (
                <strong className="text-2xl font-bold tracking-tight text-neutral-900">
                  Contact Us
                </strong>
              )}
            </div>
            {offerings.length > 0 ? (
              <ul className="space-y-4">
                {offerings.map((service, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3.5 text-sm text-neutral-700 sm:text-base"
                  >
                    <Check
                      className="mt-0.5 size-5 shrink-0 stroke-[2.5] text-[#6044ff]"
                      aria-hidden="true"
                    />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">
                Package offerings for this country will be provided shortly.
              </p>
            )}
          </section>
        )}
      </main>
      <StepFooter onClick={onContinue} disabled={!isPackageReady} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                  STEP 4: REGISTERED ELSEWHERE (YES/NO)                     */
/* -------------------------------------------------------------------------- */

interface RegisteredElsewhereStepProps {
  value: "Yes" | "No";
  onChange: (value: "Yes" | "No") => void;
  onBack: () => void;
  onContinue: () => void;
}

function RegisteredElsewhereStep({
  value,
  onChange,
  onBack,
  onContinue,
}: RegisteredElsewhereStepProps) {
  const isValid = value === "Yes" || value === "No";

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader label="Business details" tone="business" onBack={onBack} />
      <main className="flex-1">
        <h1 className="mb-8 text-2xl font-bold leading-snug tracking-tight text-[#342490] sm:text-3xl">
          Have you registered your business in any other country
        </h1>
        <RadioChoices
          name="registeredElsewhere"
          options={["Yes", "No"]}
          value={value}
          onChange={(val) => onChange(val as "Yes" | "No")}
        />
      </main>
      <StepFooter onClick={onContinue} disabled={!isValid} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                  STEP 5: REGISTERED COUNTRIES INPUT                        */
/* -------------------------------------------------------------------------- */

interface RegisteredCountriesStepProps {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function RegisteredCountriesStep({
  value,
  onChange,
  onBack,
  onContinue,
}: RegisteredCountriesStepProps) {
  const isValid = Boolean(value.trim());

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader label="Business details" tone="business" onBack={onBack} />
      <main className="flex-1">
        <h1 className="mb-8 text-2xl font-bold leading-snug tracking-tight text-[#342490] sm:text-3xl">
          Enter all the countries where this business is registered
        </h1>
        <Input
          className="h-16 w-full rounded-2xl px-5 text-lg"
          aria-label="Countries where the business is registered"
          placeholder="Nigeria, United Kingdom"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <p className="mt-2 text-sm text-neutral-500">
          For example: Nigeria, Canada, Russia
        </p>
      </main>
      <StepFooter onClick={onContinue} disabled={!isValid} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                       STEP 6: BUSINESS NAME                                */
/* -------------------------------------------------------------------------- */

interface BusinessNameStepProps {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function BusinessNameStep({
  value,
  onChange,
  onBack,
  onContinue,
}: BusinessNameStepProps) {
  const isValid = Boolean(value.trim());

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader label="Business details" tone="business" onBack={onBack} />
      <main className="flex-1">
        <h1 className="mb-8 text-2xl font-bold leading-snug tracking-tight text-[#342490] sm:text-3xl">
          Enter Business Name
        </h1>
        <Input
          className="h-16 w-full rounded-2xl px-5 text-lg"
          aria-label="Business name"
          placeholder="Choose a business name"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <p className="mt-2 text-sm text-neutral-500">
          For example: Makachi consulting, Inschool Apps
        </p>
      </main>
      <StepFooter onClick={onContinue} disabled={!isValid} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                     STEP 7: BUSINESS STRUCTURE                             */
/* -------------------------------------------------------------------------- */

interface StructureStepProps {
  countryOriginalId?: number;
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function StructureStep({
  countryOriginalId,
  value,
  onChange,
  onBack,
  onContinue,
}: StructureStepProps) {
  const countryEntities = useEntityTypesByCountry(countryOriginalId);

  const options = (countryEntities ?? [])
    .filter((mapping) => Boolean(mapping.entity))
    .map((mapping) => ({
      name: mapping.entity?.name ?? "",
      shortName: mapping.entity?.shortName,
      description: mapping.entity?.description,
    }));

  const isValid = Boolean(value.trim());

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader label="Business details" tone="business" onBack={onBack} />
      <main className="flex-1">
        <h1 className="mb-8 text-2xl font-bold leading-snug tracking-tight text-[#342490] sm:text-3xl">
          Choose your preferred Business Structure
        </h1>
        {countryEntities === undefined ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[76px] w-full animate-pulse rounded-2xl bg-neutral-100"
              />
            ))}
          </div>
        ) : options.length === 0 ? (
          <div className="rounded-2xl bg-neutral-50 p-6 text-center text-neutral-500">
            No registered business structures found for this country yet. Please
            check back soon or choose another country.
          </div>
        ) : (
          <div
            className="flex flex-col space-y-3"
            role="radiogroup"
            aria-label="businessStructure"
          >
            {options.map((item) => {
              const selected = item.name === value;
              return (
                <button
                  key={item.name}
                  className={`flex w-full items-start gap-4 rounded-2xl p-4 text-left transition-all ${
                    selected
                      ? "bg-[#dfdbff] font-medium text-neutral-900"
                      : "bg-transparent text-neutral-800 hover:bg-neutral-50"
                  }`}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onChange(item.name)}
                >
                  <span
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                      selected ? "bg-[#5037ff] text-white" : "bg-neutral-300"
                    }`}
                  >
                    {selected && (
                      <Check className="size-4 stroke-[3]" aria-hidden="true" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold sm:text-xl">
                        {item.name}
                      </span>
                      {item.shortName && (
                        <span className="rounded-md bg-neutral-200/70 px-2 py-0.5 text-xs font-semibold text-neutral-600">
                          {item.shortName}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
      <StepFooter onClick={onContinue} disabled={!isValid} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                   STEP 8: BRIEF DESCRIPTION                                */
/* -------------------------------------------------------------------------- */

interface BriefDescriptionStepProps {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function BriefDescriptionStep({
  value,
  onChange,
  onBack,
  onContinue,
}: BriefDescriptionStepProps) {
  const isValid = Boolean(value.trim());

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader label="Business details" tone="business" onBack={onBack} />
      <main className="flex-1">
        <h1 className="mb-8 text-2xl font-bold leading-snug tracking-tight text-[#342490] sm:text-3xl">
          Give us a brief description of the business
        </h1>
        <Textarea
          className="h-40 w-full resize-none rounded-2xl p-5 text-lg"
          aria-label="Brief business description"
          placeholder="Makachi consulting is a ..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <p className="mt-2 text-sm text-neutral-500">
          Characters: {value.length}
        </p>
      </main>
      <StepFooter onClick={onContinue} disabled={!isValid} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                  STEP 9: ACTIVITY & PURPOSE                                */
/* -------------------------------------------------------------------------- */

interface ActivityPurposeStepProps {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function ActivityPurposeStep({
  value,
  onChange,
  onBack,
  onContinue,
}: ActivityPurposeStepProps) {
  const isValid = Boolean(value.trim());

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader label="Business details" tone="business" onBack={onBack} />
      <main className="flex-1">
        <h1 className="mb-8 text-2xl font-bold leading-snug tracking-tight text-[#342490] sm:text-3xl">
          Tell us about the business activities and purpose
        </h1>
        <Textarea
          className="h-40 w-full resize-none rounded-2xl p-5 text-lg"
          aria-label="Business activities and purpose"
          placeholder="Makachi consulting is a ..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <p className="mt-2 text-sm text-neutral-500">
          Characters: {value.length}
        </p>
      </main>
      <StepFooter onClick={onContinue} disabled={!isValid} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                    STEP 10: BUSINESS KIND                                  */
/* -------------------------------------------------------------------------- */

interface BusinessKindStepProps {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function BusinessKindStep({
  value,
  onChange,
  onBack,
  onContinue,
}: BusinessKindStepProps) {
  const isValid = Boolean(value.trim());

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader label="Business details" tone="business" onBack={onBack} />
      <main className="flex-1">
        <h1 className="mb-8 text-2xl font-bold leading-snug tracking-tight text-[#342490] sm:text-3xl">
          Which option best describes this business?
        </h1>
        <RadioChoices
          name="businessKind"
          options={businessKinds}
          value={value}
          onChange={onChange}
        />
      </main>
      <StepFooter onClick={onContinue} disabled={!isValid} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                     STEP 11: START DATE                                    */
/* -------------------------------------------------------------------------- */

interface StartDateStepProps {
  startYear: string;
  startMonth: string;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function StartDateStep({
  startYear,
  startMonth,
  onYearChange,
  onMonthChange,
  onBack,
  onContinue,
}: StartDateStepProps) {
  const isValid = Boolean(
    startYear && startYear.trim() && startMonth && startMonth.trim(),
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader label="Business details" tone="business" onBack={onBack} />
      <main className="flex-1">
        <h1 className="mb-8 text-2xl font-bold leading-snug tracking-tight text-[#342490] sm:text-3xl">
          When did this business start or plans to start?
        </h1>
        <div className="space-y-6">
          <FormField label="Year">
            <AppSelect
              value={startYear}
              onValueChange={onYearChange}
              placeholder="Select year"
              options={Array.from({ length: 127 }, (_, index) =>
                String(new Date().getFullYear() - index),
              )}
            />
          </FormField>
          <FormField label="Month">
            <AppSelect
              value={startMonth}
              onValueChange={onMonthChange}
              placeholder="Select month"
              options={months}
            />
          </FormField>
        </div>
      </main>
      <StepFooter onClick={onContinue} disabled={!isValid} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                STEP 12: PERSONAL INFORMATION                               */
/* -------------------------------------------------------------------------- */

interface PersonalInformationStepProps {
  personal: PersonalInformation;
  error: string;
  onChange: <K extends keyof PersonalInformation>(
    key: K,
    value: PersonalInformation[K],
  ) => void;
  onBack: () => void;
  onContinue: () => void;
}

function PersonalInformationStep({
  personal,
  error,
  onChange,
  onBack,
  onContinue,
}: PersonalInformationStepProps) {
  const hasRequiredDetails = Boolean(
    personal.firstName.trim() &&
      personal.lastName.trim() &&
      personal.email.trim() &&
      /^\S+@\S+\.\S+$/.test(personal.email.trim()) &&
      personal.phone.trim() &&
      personal.whatsapp.trim() &&
      personal.residentialAddress.trim() &&
      personal.countryOfCitizenship.trim() &&
      personal.dateOfBirth.trim(),
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader
        label="Personal Information"
        tone="personal"
        onBack={onBack}
      />
      <main className="flex-1">
        <h1 className="mb-8 text-2xl font-bold leading-snug tracking-tight text-[#342490] sm:text-3xl">
          Provide your personal information
        </h1>
        <div className="space-y-5">
          <FormField label="First name">
            <Input
              autoComplete="given-name"
              placeholder="Enter first name"
              value={personal.firstName}
              onChange={(event) => onChange("firstName", event.target.value)}
              className="h-16 rounded-2xl px-5 text-lg"
            />
          </FormField>
          <FormField label="Last name">
            <Input
              autoComplete="family-name"
              placeholder="Enter last name"
              value={personal.lastName}
              onChange={(event) => onChange("lastName", event.target.value)}
              className="h-16 rounded-2xl px-5 text-lg"
            />
          </FormField>
          <FormField label="Other names">
            <Input
              autoComplete="additional-name"
              placeholder="Enter your other names"
              value={personal.otherNames}
              onChange={(event) => onChange("otherNames", event.target.value)}
              className="h-16 rounded-2xl px-5 text-lg"
            />
          </FormField>
          <FormField label="Email">
            <Input
              autoComplete="email"
              type="email"
              placeholder="Enter your email address"
              value={personal.email}
              onChange={(event) => onChange("email", event.target.value)}
              className="h-16 rounded-2xl px-5 text-lg"
            />
          </FormField>
          <FormField label="Phone number (for calling)">
            <PhoneInput
              value={personal.phone}
              onChange={(value) => onChange("phone", value)}
            />
          </FormField>
          <FormField label="Phone number (for whatsapp)">
            <PhoneInput
              value={personal.whatsapp}
              onChange={(value) => onChange("whatsapp", value)}
            />
          </FormField>
          <FormField label="Residential address">
            <Input
              autoComplete="street-address"
              placeholder="Enter residential address"
              value={personal.residentialAddress}
              onChange={(event) =>
                onChange("residentialAddress", event.target.value)
              }
              className="h-16 rounded-2xl px-5 text-lg"
            />
          </FormField>
          <FormField label="Country of citizenship">
            <SelectCountry
              selectedId={personal.countryOfCitizenship}
              update={(country) =>
                onChange("countryOfCitizenship", country.name)
              }
              buttonText="Select country of citizenship"
              className="h-16 rounded-2xl px-5 text-lg text-left"
            />
          </FormField>
          <FormField label="Date of birth">
            <SelectDate
              initialData={personal.dateOfBirth}
              update={(date) => onChange("dateOfBirth", date)}
              buttonText="Select date of birth"
              endMonth={new Date()}
              className="h-16 rounded-2xl px-5 text-lg text-left"
            />
          </FormField>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </main>
      <StepFooter onClick={onContinue} disabled={!hasRequiredDetails} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                  STEP 13: GOVERNMENT ID STEP                               */
/* -------------------------------------------------------------------------- */

interface GovernmentIdStepProps {
  personal: PersonalInformation;
  error: string;
  onChange: <K extends keyof PersonalInformation>(
    key: K,
    value: PersonalInformation[K],
  ) => void;
  onBack: () => void;
  onContinue: () => void;
}

function GovernmentIdStep({
  personal,
  error,
  onChange,
  onBack,
  onContinue,
}: GovernmentIdStepProps) {
  const isValid = Boolean(personal.idType.trim() && personal.idNumber.trim());

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader
        label="Personal Information"
        tone="personal"
        onBack={onBack}
      />
      <main className="flex-1">
        <h1 className="mb-8 text-2xl font-bold leading-snug tracking-tight text-[#342490] sm:text-3xl">
          Provide your government issued ID
        </h1>
        <div className="space-y-6">
          <FormField label="ID Type">
            <AppSelect
              value={personal.idType}
              onValueChange={(value) => onChange("idType", value)}
              placeholder="Select ID Type"
              options={["NIN", "International Passport", "Driver’s License"]}
            />
          </FormField>
          <FormField label={personal.idType}>
            <Input
              autoComplete="off"
              placeholder={`Enter ${personal.idType}`}
              value={personal.idNumber}
              onChange={(event) => onChange("idNumber", event.target.value)}
              className="h-16 rounded-2xl px-5 text-lg"
            />
          </FormField>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </main>
      <StepFooter onClick={onContinue} disabled={!isValid} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                    STEP 14: SHAREHOLDERS LIST                              */
/* -------------------------------------------------------------------------- */

interface ShareholdersStepProps {
  shareholders: Shareholder[];
  onAddShareholderClick: () => void;
  onEditShareholder: (index: number) => void;
  onRemoveShareholder: (index: number) => void;
  onBack: () => void;
  isSubmitting?: boolean;
  submitError?: string;
  onSubmit: () => void;
}

function ShareholdersStep({
  shareholders,
  onAddShareholderClick,
  onEditShareholder,
  onRemoveShareholder,
  onBack,
  isSubmitting = false,
  submitError,
  onSubmit,
}: ShareholdersStepProps) {
  const [selectedShareholderIndex, setSelectedShareholderIndex] = useState<
    number | null
  >(null);

  const selectedShareholder =
    selectedShareholderIndex !== null
      ? shareholders[selectedShareholderIndex]
      : null;

  const totalPercentage = shareholders.reduce(
    (sum, s) => sum + (Number(s.ownership) || 0),
    0,
  );
  const isValid =
    shareholders.length > 0 && totalPercentage <= 100 && !isSubmitting;

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader label="Ownership Details" tone="ownership" onBack={onBack} />
      <main className="flex-1">
        <h1 className="mb-8 text-2xl font-bold leading-snug tracking-tight text-[#342490] sm:text-3xl">
          Add Shareholders of the company
        </h1>
        {shareholders.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-2xl bg-neutral-100/70 text-lg font-medium text-neutral-400">
            0 shareholders
          </div>
        ) : (
          <div className="space-y-4">
            {shareholders.map((shareholder, index) => (
              <button
                type="button"
                className="flex w-full items-center gap-3.5 py-1 text-left transition-colors hover:bg-neutral-50/80 active:scale-[0.99]"
                key={`${shareholder.email}-${index}`}
                onClick={() => setSelectedShareholderIndex(index)}
              >
                <span
                  className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[#f0bb81] to-[#9b593e] text-sm font-bold text-white shadow-xs"
                  aria-hidden="true"
                >
                  {shareholder.firstName.slice(0, 1).toUpperCase()}
                  {shareholder.lastName.slice(0, 1).toUpperCase()}
                </span>
                <span className="flex-1 truncate text-base font-medium text-neutral-800">
                  {shareholder.firstName} {shareholder.lastName}
                </span>
                <strong className="text-lg font-semibold text-emerald-500">
                  {shareholder.ownership}%
                </strong>
              </button>
            ))}
          </div>
        )}
        <Button
          variant="secondary"
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-neutral-200/80 text-base font-semibold text-neutral-800 transition-all hover:bg-neutral-200 active:scale-[0.99]"
          type="button"
          onClick={onAddShareholderClick}
          disabled={isSubmitting}
        >
          <Plus className="size-5 stroke-[2.5]" aria-hidden="true" /> Add
          shareholder
        </Button>

        {submitError && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
            {submitError}
          </div>
        )}
      </main>
      <StepFooter
        buttonText={isSubmitting ? "Submitting application..." : "Submit"}
        onClick={onSubmit}
        disabled={!isValid || isSubmitting}
      />

      <Drawer
        open={selectedShareholderIndex !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedShareholderIndex(null);
        }}
      >
        <DrawerContent className="mx-auto max-w-[462px] rounded-t-[32px] border-0 bg-white outline-none [&>div:first-child]:hidden">
          <DrawerTitle className="sr-only">
            {selectedShareholder
              ? `Manage ${selectedShareholder.firstName} ${selectedShareholder.lastName}`
              : "Shareholder Options"}
          </DrawerTitle>
          <div className="flex flex-col gap-6 px-7 pb-9 pt-7">
            <button
              type="button"
              onClick={() => {
                if (selectedShareholderIndex !== null) {
                  const idx = selectedShareholderIndex;
                  setSelectedShareholderIndex(null);
                  onEditShareholder(idx);
                }
              }}
              className="flex items-center gap-4 text-left text-lg font-medium text-neutral-900 transition-colors hover:text-neutral-600"
            >
              <Pencil
                className="size-5 stroke-[1.8] text-neutral-800"
                aria-hidden="true"
              />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedShareholderIndex !== null) {
                  const idx = selectedShareholderIndex;
                  setSelectedShareholderIndex(null);
                  onRemoveShareholder(idx);
                }
              }}
              className="flex items-center gap-4 text-left text-lg font-medium text-[#ff4d4f] transition-colors hover:opacity-80"
            >
              <Trash2
                className="size-5 stroke-[1.8] text-[#ff4d4f]"
                aria-hidden="true"
              />
              <span>Remove</span>
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                 STEP 15: NEW SHAREHOLDER FORM                              */
/* -------------------------------------------------------------------------- */

interface ShareholderFormStepProps {
  shareholder: Shareholder;
  isEditing?: boolean;
  error: string;
  onChange: <K extends keyof Shareholder>(
    key: K,
    value: Shareholder[K],
  ) => void;
  onBack: () => void;
  onSaveShareholder: () => void;
}

function ShareholderFormStep({
  shareholder,
  isEditing = false,
  error,
  onChange,
  onBack,
  onSaveShareholder,
}: ShareholderFormStepProps) {
  const fetchStates = useFetchStates();
  const fetchCountries = useFetchCountries();

  const [shareholderCountryId, setShareholderCountryId] = useState<
    number | undefined
  >(undefined);

  const percentage = Number(shareholder.ownership);
  const isFormValid = Boolean(
    shareholder.firstName.trim() &&
      shareholder.lastName.trim() &&
      shareholder.ownership.trim() &&
      Number.isFinite(percentage) &&
      percentage > 0 &&
      percentage <= 100 &&
      shareholder.email.trim() &&
      /^\S+@\S+\.\S+$/.test(shareholder.email.trim()) &&
      shareholder.phone.trim() &&
      shareholder.country.trim() &&
      shareholder.state.trim() &&
      shareholder.city.trim() &&
      shareholder.zipCode.trim() &&
      shareholder.address.trim(),
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader onBack={onBack} />
      <main className="flex-1 pb-6">
        <h1 className="mb-8 text-2xl font-bold leading-snug tracking-tight text-[#342490] sm:text-3xl">
          {isEditing ? "Edit Shareholder" : "New Shareholder"}
        </h1>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First name">
              <Input
                autoComplete="given-name"
                placeholder="First name"
                value={shareholder.firstName}
                onChange={(event) => onChange("firstName", event.target.value)}
                className="h-16 rounded-2xl px-4 text-lg"
              />
            </FormField>
            <FormField label="Last name">
              <Input
                autoComplete="family-name"
                placeholder="Last name"
                value={shareholder.lastName}
                onChange={(event) => onChange("lastName", event.target.value)}
                className="h-16 rounded-2xl px-4 text-lg"
              />
            </FormField>
          </div>
          <FormField label="Ownership Percentage">
            <div className="flex h-16 w-full items-center rounded-2xl border border-neutral-300 bg-background px-5 text-lg text-neutral-800 transition-all focus-within:border-[#5037ff] focus-within:ring-2 focus-within:ring-[#5037ff]/20">
              <input
                inputMode="decimal"
                placeholder="0 - 100"
                value={shareholder.ownership}
                onChange={(event) =>
                  onChange(
                    "ownership",
                    event.target.value.replace(/[^\d.]/g, ""),
                  )
                }
                className="flex-1 bg-transparent text-lg text-neutral-800 outline-none placeholder:text-neutral-400"
              />
              <span className="font-semibold text-neutral-500">%</span>
            </div>
          </FormField>
          <FormField label="Email">
            <Input
              autoComplete="email"
              type="email"
              placeholder="Enter your email address"
              value={shareholder.email}
              onChange={(event) => onChange("email", event.target.value)}
              className="h-16 rounded-2xl px-5 text-lg"
            />
          </FormField>
          <FormField label="Phone number (for calling)">
            <PhoneInput
              value={shareholder.phone}
              onChange={(value) => onChange("phone", value)}
            />
          </FormField>
          <FormField label="Country">
            <SelectCountry
              fetchCountries={fetchCountries}
              selectedId={shareholderCountryId}
              update={(country) => {
                onChange("country", country?.name ?? "");
                onChange(
                  "countryOriginalId",
                  country?.id as number | undefined,
                );
                onChange("state", "");
                onChange("stateOriginalId", undefined);
                setShareholderCountryId(country?.id as number | undefined);
              }}
              className="h-16 rounded-2xl px-5 text-lg text-left"
            />
          </FormField>
          <FormField label="State">
            <SelectState
              fetchStates={fetchStates}
              countryOriginalId={shareholderCountryId}
              update={(state) => {
                onChange("state", state?.name ?? "");
                onChange("stateOriginalId", state?.id as number | undefined);
              }}
              className="h-16 rounded-2xl px-5 text-lg text-left"
              disabled={!shareholderCountryId}
            />
          </FormField>
          <FormField label="City">
            <Input
              autoComplete="address-level2"
              placeholder="Enter city"
              value={shareholder.city}
              onChange={(event) => onChange("city", event.target.value)}
              className="h-16 rounded-2xl px-5 text-lg"
            />
          </FormField>
          <FormField label="Zip code">
            <Input
              autoComplete="postal-code"
              placeholder="Enter zip code"
              value={shareholder.zipCode}
              onChange={(event) => onChange("zipCode", event.target.value)}
              className="h-16 rounded-2xl px-5 text-lg"
            />
          </FormField>
          <FormField label="Address">
            <Input
              autoComplete="street-address"
              placeholder="Enter address"
              value={shareholder.address}
              onChange={(event) => onChange("address", event.target.value)}
              className="h-16 rounded-2xl px-5 text-lg"
            />
          </FormField>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </main>
      <StepFooter
        buttonText={isEditing ? "Save changes" : "Add shareholder"}
        onClick={onSaveShareholder}
        disabled={!isFormValid}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                   STEP 16: SUBMITTED CONFIRMATION                          */
/* -------------------------------------------------------------------------- */

function SubmittedStep() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center pb-12 pt-6 text-center">
      <img
        className="mb-8 size-48 object-contain"
        src="https://pub-e0380ffeabae40d2aba932936caf9754.r2.dev/assets/3d-robot.webp"
        alt="Registration completed robot"
        loading="eager"
      />
      <h1 className="text-2xl font-bold tracking-tight text-[#342490] sm:text-3xl">
        Your application has been submitted!
      </h1>
      <ul className="my-8 max-w-sm space-y-5 text-left text-sm text-neutral-700 sm:text-base">
        <li className="flex items-start gap-3.5">
          <span className="mt-1 size-5 shrink-0 rounded-full bg-neutral-300" />
          <span>Reach out to one of our representatives to make payment.</span>
        </li>
        <li className="flex items-start gap-3.5">
          <span className="mt-1 size-5 shrink-0 rounded-full bg-neutral-300" />
          <span>
            Once you’ve made payment, send a receipt to our representative for
            confirmation.
          </span>
        </li>
        <li className="flex items-start gap-3.5">
          <span className="mt-1 size-5 shrink-0 rounded-full bg-neutral-300" />
          <span>
            Once confirmed, we will start the registration of your company.
          </span>
        </li>
      </ul>
      <a
        className="flex h-16 w-full max-w-sm items-center justify-center gap-2.5 rounded-full bg-[#5037ff] text-lg font-semibold text-white shadow-sm transition-all hover:bg-[#432ee6] active:scale-[0.99]"
        href="https://wa.me/?text=Hi%20AnchorBuiz%20Support"
        target="_blank"
        rel="noreferrer"
      >
        <WhatsAppIcon
          className="size-6 brightness-0 invert"
          aria-hidden="true"
        />
        <span>Send Message</span>
      </a>
      <Button
        variant="secondary"
        asChild
        className="mt-3 flex h-16 w-full max-w-sm items-center justify-center rounded-full bg-neutral-200/80 text-lg font-semibold text-neutral-800 transition-all hover:bg-neutral-200 active:scale-[0.99]"
      >
        <Link to="/">Go to Home</Link>
      </Button>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                         MAIN PAGE CONTROLLER                               */
/* -------------------------------------------------------------------------- */

function BusinessRegistrationPage() {
  const [step, setStep] = useState<RegistrationStep>("intro");

  const form = useForm<RegistrationFormData>({
    mode: "onChange",
    defaultValues: {
      countryName: "United Kingdom",
      registeredElsewhere: "Yes",
      registeredCountries: "",
      businessName: "",
      structure: "",
      briefDescription: "",
      activityPurpose: "",
      businessKind: businessKinds[0] ?? "A new business",
      startYear: "",
      startMonth: "",
      personal: {
        firstName: "",
        lastName: "",
        otherNames: "",
        email: "",
        phone: "",
        whatsapp: "",
        residentialAddress: "",
        countryOfCitizenship: "",
        dateOfBirth: "",
        idType: "NIN",
        idNumber: "",
      },
      shareholders: [],
    },
  });

  const { watch, setValue } = form;

  const countryName = watch("countryName");
  const registeredElsewhere = watch("registeredElsewhere");
  const registeredCountries = watch("registeredCountries");
  const businessName = watch("businessName");
  const structure = watch("structure");
  const briefDescription = watch("briefDescription");
  const activityPurpose = watch("activityPurpose");
  const businessKind = watch("businessKind");
  const startYear = watch("startYear");
  const startMonth = watch("startMonth");
  const personal = watch("personal");
  const shareholders = watch("shareholders");

  const [personalError, setPersonalError] = useState("");
  const [editingShareholderIndex, setEditingShareholderIndex] = useState<
    number | null
  >(null);
  const [newShareholder, setNewShareholder] = useState<Shareholder>({
    firstName: "",
    lastName: "",
    ownership: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    address: "",
  });
  const [shareholderError, setShareholderError] = useState("");

  const registrationCountries = useRegistrationCountries();
  const country = registrationCountries?.find(
    (item) => item.name === countryName,
  ) ??
    registrationCountries?.[0] ?? {
      name: countryName,
      iso2: null,
      originalId: undefined,
    };

  const countryEntities = useEntityTypesByCountry(country.originalId);
  const createBusiness = useCreateBusiness();
  const addShareholder = useAddShareholder();
  const upsertProfile = useUpsertProfile();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const updatePersonal = <K extends keyof PersonalInformation>(
    key: K,
    value: PersonalInformation[K],
  ) => {
    setValue(
      `personal.${key}` as `personal.${keyof PersonalInformation}`,
      value,
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );
    setPersonalError("");
  };

  const updateNewShareholder = <K extends keyof Shareholder>(
    key: K,
    value: Shareholder[K],
  ) => {
    setNewShareholder((current) => ({ ...current, [key]: value }));
    setShareholderError("");
  };

  async function handleSubmitApplication() {
    try {
      setIsSubmitting(true);
      setSubmitError("");

      // 1. Upsert Profile with personal info and government ID
      await upsertProfile({
        firstName: personal.firstName,
        lastName: personal.lastName,
        middleName: personal.otherNames || undefined,
        email: personal.email,
        phoneNumber: personal.phone,
        whatsappPhoneNumber: personal.whatsapp,
        residentialAddress: personal.residentialAddress,
        countryOriginalId: country.originalId,
        dateOfBirth: personal.dateOfBirth,
        governmentIds: {
          nin: personal.idType === "NIN" ? personal.idNumber : undefined,
          passport:
            personal.idType === "International Passport"
              ? personal.idNumber
              : undefined,
          driversLicense:
            personal.idType === "Driver’s License"
              ? personal.idNumber
              : undefined,
        },
      });

      // 2. Resolve entityTypeId from selected country entity
      const selectedEntity = countryEntities?.find(
        (m) => m.entity?.name === structure,
      )?.entity;

      // 3. Create Business record
      const businessId = await createBusiness({
        name: businessName,
        countryOriginalId: country.originalId ?? 0,
        isAStartup: businessKind === "A new business",
        entityTypeId: selectedEntity?._id,
        businessDescription: briefDescription,
        businessActivitiesAndPurpose: activityPurpose,
        businessStartDate:
          startYear && startMonth ? `${startMonth} ${startYear}` : undefined,
        status: "pending",
        paymentStatus: "unpaid",
        otherCountriesRegisteredIn:
          registeredElsewhere === "Yes" && registeredCountries
            ? registeredCountries
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
      });

      // 4. Add each Shareholder linked to the newly created business
      for (const sh of shareholders) {
        await addShareholder({
          businessId,
          firstName: sh.firstName,
          lastName: sh.lastName,
          email: sh.email,
          ownershipPercentage: Number(sh.ownership),
          countryOriginalId: sh.countryOriginalId,
          countryStateOriginalId: sh.stateOriginalId,
          city: sh.city,
          zipCode: sh.zipCode,
          address: sh.address,
        });
      }

      setStep("submitted");
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmitError(
        err?.message ||
          "Failed to submit your business application. Please ensure you are logged in and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepsList: RegistrationStep[] = [
    "registered-elsewhere",
    ...(registeredElsewhere === "Yes" ? ["registered-countries" as const] : []),
    "business-name",
    "structure",
    "brief-description",
    "activity-purpose",
    "business-kind",
    "start-date",
    "personal-information",
    "government-id",
    "shareholders",
  ];

  function continueFromStep() {
    if (step === "country") {
      setStep("package");
      return;
    }
    if (step === "package") {
      setStep("registered-elsewhere");
      return;
    }
    if (step === "shareholders") {
      setStep("submitted");
      return;
    }
    const index = stepsList.indexOf(step);
    const next = stepsList[index + 1];
    if (next) setStep(next);
  }

  function goBack() {
    if (step === "submitted") return;
    if (step === "shareholder-form") {
      setEditingShareholderIndex(null);
      setNewShareholder({
        firstName: "",
        lastName: "",
        ownership: "",
        email: "",
        phone: "",
        country: "",
        state: "",
        city: "",
        zipCode: "",
        address: "",
      });
      setShareholderError("");
      setStep("shareholders");
      return;
    }
    if (step === "country") {
      setStep("intro");
      return;
    }
    if (step === "package") {
      setStep("country");
      return;
    }
    if (step === "registered-elsewhere") {
      setStep("package");
      return;
    }
    const index = stepsList.indexOf(step);
    const previous = stepsList[index - 1];
    if (previous) setStep(previous);
  }

  function continuePersonalInformation() {
    const hasRequiredDetails =
      personal.firstName.trim() &&
      personal.lastName.trim() &&
      personal.email.trim() &&
      personal.phone.trim() &&
      personal.whatsapp.trim() &&
      personal.residentialAddress.trim() &&
      personal.countryOfCitizenship.trim() &&
      personal.dateOfBirth.trim();
    if (!hasRequiredDetails || !/^\S+@\S+\.\S+$/.test(personal.email.trim())) {
      setPersonalError(
        "Enter your personal details, residential address, citizenship, and date of birth.",
      );
      return;
    }
    setPersonalError("");
    continueFromStep();
  }

  function continueGovernmentId() {
    if (!personal.idNumber.trim()) {
      setPersonalError(`Enter your ${personal.idType}.`);
      return;
    }
    setPersonalError("");
    continueFromStep();
  }

  const saveShareholder = () => {
    const percentage = Number(newShareholder.ownership);
    const otherPercentage = shareholders
      .filter((_, idx) => idx !== editingShareholderIndex)
      .reduce((total, item) => total + Number(item.ownership), 0);

    if (
      !newShareholder.firstName.trim() ||
      !newShareholder.lastName.trim() ||
      !newShareholder.ownership ||
      !newShareholder.email.trim() ||
      !newShareholder.phone.trim() ||
      !newShareholder.country ||
      !newShareholder.state.trim() ||
      !newShareholder.city.trim() ||
      !newShareholder.zipCode.trim() ||
      !newShareholder.address.trim()
    ) {
      setShareholderError(
        "Complete all shareholder fields before adding them.",
      );
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(newShareholder.email.trim())) {
      setShareholderError("Enter a valid email address.");
      return;
    }
    if (
      !Number.isFinite(percentage) ||
      percentage <= 0 ||
      percentage > 100 ||
      otherPercentage + percentage > 100
    ) {
      setShareholderError(
        "Ownership percentages must add up to no more than 100%.",
      );
      return;
    }

    if (editingShareholderIndex !== null) {
      const updated = shareholders.map((item, idx) =>
        idx === editingShareholderIndex ? newShareholder : item,
      );
      setValue("shareholders", updated, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      setValue("shareholders", [...shareholders, newShareholder], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    setEditingShareholderIndex(null);
    setNewShareholder({
      firstName: "",
      lastName: "",
      ownership: "",
      email: "",
      phone: "",
      country: "",
      state: "",
      city: "",
      zipCode: "",
      address: "",
    });
    setShareholderError("");
    setStep("shareholders");
  };

  return (
    <div className="min-h-dvh px-5 text-neutral-800">
      {step === "intro" && <IntroStep onStart={() => setStep("country")} />}

      <div className="mt-6 max-w-[462px] mx-auto ">
        {step === "country" && (
          <CountryStep
            countryName={countryName}
            onSelectCountry={(name) =>
              setValue("countryName", name, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onBack={goBack}
            onContinue={() => setStep("package")}
          />
        )}

        {step === "package" && (
          <PackageStep
            country={{
              name: country.name,
              iso2: country.iso2,
              originalId: country.originalId,
            }}
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "registered-elsewhere" && (
          <RegisteredElsewhereStep
            value={registeredElsewhere}
            onChange={(val) =>
              setValue("registeredElsewhere", val, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "registered-countries" && (
          <RegisteredCountriesStep
            value={registeredCountries}
            onChange={(val) =>
              setValue("registeredCountries", val, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "business-name" && (
          <BusinessNameStep
            value={businessName}
            onChange={(val) =>
              setValue("businessName", val, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "structure" && (
          <StructureStep
            countryOriginalId={country.originalId}
            value={structure}
            onChange={(val) =>
              setValue("structure", val, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "brief-description" && (
          <BriefDescriptionStep
            value={briefDescription}
            onChange={(val) =>
              setValue("briefDescription", val, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "activity-purpose" && (
          <ActivityPurposeStep
            value={activityPurpose}
            onChange={(val) =>
              setValue("activityPurpose", val, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "business-kind" && (
          <BusinessKindStep
            value={businessKind}
            onChange={(val) =>
              setValue("businessKind", val, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "start-date" && (
          <StartDateStep
            startYear={startYear}
            startMonth={startMonth}
            onYearChange={(year) =>
              setValue("startYear", year, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onMonthChange={(month) =>
              setValue("startMonth", month, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "personal-information" && (
          <PersonalInformationStep
            personal={personal}
            error={personalError}
            onChange={updatePersonal}
            onBack={goBack}
            onContinue={continuePersonalInformation}
          />
        )}

        {step === "government-id" && (
          <GovernmentIdStep
            personal={personal}
            error={personalError}
            onChange={updatePersonal}
            onBack={goBack}
            onContinue={continueGovernmentId}
          />
        )}

        {step === "shareholders" && (
          <ShareholdersStep
            shareholders={shareholders}
            onAddShareholderClick={() => {
              setEditingShareholderIndex(null);
              setNewShareholder({
                firstName: "",
                lastName: "",
                ownership: "",
                email: "",
                phone: "",
                country: "",
                state: "",
                city: "",
                zipCode: "",
                address: "",
              });
              setShareholderError("");
              setStep("shareholder-form");
            }}
            onEditShareholder={(index) => {
              const shareholderToEdit = shareholders[index];
              if (shareholderToEdit) {
                setNewShareholder({ ...shareholderToEdit });
                setEditingShareholderIndex(index);
                setShareholderError("");
                setStep("shareholder-form");
              }
            }}
            onRemoveShareholder={(index) => {
              const updated = shareholders.filter((_, idx) => idx !== index);
              setValue("shareholders", updated, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            onBack={goBack}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onSubmit={handleSubmitApplication}
          />
        )}

        {step === "shareholder-form" && (
          <ShareholderFormStep
            shareholder={newShareholder}
            isEditing={editingShareholderIndex !== null}
            error={shareholderError}
            onChange={updateNewShareholder}
            onBack={goBack}
            onSaveShareholder={saveShareholder}
          />
        )}
        {step === "submitted" && <SubmittedStep />}
      </div>
    </div>
  );
}
