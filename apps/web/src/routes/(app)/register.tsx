import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Check, Pencil, Plus, Trash2 } from "lucide-react";
import WhatsAppIcon from "@repo/ui/icons/whatsapp-icon";
import { Button } from "@repo/ui/components/button";
import { Input, Textarea } from "@repo/ui/components/input";
import { Drawer, DrawerContent, DrawerTitle } from "@repo/ui/components/drawer";
import { SelectCountry } from "@repo/ui/components/selects/country-select";
import { SelectState } from "@repo/ui/components/selects/state-select";
import { SelectDate } from "@repo/ui/components/selects/date-select";
import { AppSelect } from "@repo/ui/components/selects/app-select";
import { useState, type ReactNode } from "react";
import {
  useFetchStates,
  useFetchCountries,
  useRegistrationCountries,
} from "@repo/convex/hooks/useLocations";

export const Route = createFileRoute("/(app)/register")({
  component: BusinessRegistrationPage,
});

/* -------------------------------------------------------------------------- */
/*                                CONSTANTS                                   */
/* -------------------------------------------------------------------------- */

// Countries are now fetched live from Convex (isRegistrationAvailable === true)

const includedServices = [
  "Company registration",
  "US Business Address",
  "Company documents & registers",
  "Mail scanning",
  "Privacy protection",
  "Compliance reminders/support",
  "Banking account opening assistance",
  "EIN is processed within 2 to 4 weeks (needed for bank account opening)",
];

const businessStructures = ["Limited Liability Company", "Corporation"];
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

type BusinessDetails = {
  registeredElsewhere: "Yes" | "No";
  registeredCountries: string;
  businessName: string;
  structure: string;
  briefDescription: string;
  activityPurpose: string;
  businessKind: string;
  startYear: string;
  startMonth: string;
};

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
  state: string;
  city: string;
  zipCode: string;
  address: string;
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
    flag: c.emoji ?? "🌐",
  }));

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
            className="flex flex-col space-y-2"
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
                  <span className="text-2xl leading-none" aria-hidden="true">
                    {item.flag}
                  </span>
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
      <StepFooter onClick={onContinue} />
    </StepWrapper>
  );
}

/* -------------------------------------------------------------------------- */
/*                         STEP 3: PACKAGE DETAILS                            */
/* -------------------------------------------------------------------------- */

interface PackageStepProps {
  country: { name: string; flag?: string | null };
  onBack: () => void;
  onContinue: () => void;
}

function PackageStep({ country, onBack, onContinue }: PackageStepProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader onBack={onBack} />
      <main className="flex-1 pb-6">
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-6 flex size-24 items-center justify-center rounded-full bg-white text-6xl shadow-md sm:size-28"
            aria-label={country.name}
          >
            {country.flag}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#342490] sm:text-3xl">
            {country.packageName}
          </h1>
        </div>

        <section
          className="mt-8 rounded-3xl bg-[#f6f4ff] p-6 text-neutral-800"
          aria-label="Package price and inclusions"
        >
          <p className="text-base text-neutral-600">Price</p>
          <div className="mb-6 mt-2 flex flex-wrap items-baseline gap-2">
            <strong className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
              ₦930,000
            </strong>
            <span className="text-base text-neutral-400">($700)</span>
          </div>
          <ul className="space-y-4">
            {includedServices.map((service) => (
              <li
                key={service}
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
        </section>
      </main>
      <StepFooter onClick={onContinue} />
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
      <StepFooter onClick={onContinue} />
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
      <StepFooter onClick={onContinue} />
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
      <StepFooter onClick={onContinue} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                     STEP 7: BUSINESS STRUCTURE                             */
/* -------------------------------------------------------------------------- */

interface StructureStepProps {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function StructureStep({
  value,
  onChange,
  onBack,
  onContinue,
}: StructureStepProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader label="Business details" tone="business" onBack={onBack} />
      <main className="flex-1">
        <h1 className="mb-8 text-2xl font-bold leading-snug tracking-tight text-[#342490] sm:text-3xl">
          Choose your preferred Business Structure
        </h1>
        <RadioChoices
          name="businessStructure"
          options={businessStructures}
          value={value}
          onChange={onChange}
        />
      </main>
      <StepFooter onClick={onContinue} />
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
  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader label="Business details" tone="business" onBack={onBack} />
      <main className="flex-1">
        <h1 className="mb-8 text-2xl font-bold leading-snug tracking-tight text-[#342490] sm:text-3xl">
          Give us a brief description of the business (business activities and
          purpose)
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
      <StepFooter onClick={onContinue} />
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
      <StepFooter onClick={onContinue} />
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
      <StepFooter onClick={onContinue} />
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
      <StepFooter onClick={onContinue} />
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
      <StepFooter onClick={onContinue} />
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
      <StepFooter onClick={onContinue} />
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
  onSubmit: () => void;
}

function ShareholdersStep({
  shareholders,
  onAddShareholderClick,
  onEditShareholder,
  onRemoveShareholder,
  onBack,
  onSubmit,
}: ShareholdersStepProps) {
  const [selectedShareholderIndex, setSelectedShareholderIndex] = useState<
    number | null
  >(null);

  const selectedShareholder =
    selectedShareholderIndex !== null
      ? shareholders[selectedShareholderIndex]
      : null;

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
        >
          <Plus className="size-5 stroke-[2.5]" aria-hidden="true" /> Add
          shareholder
        </Button>
      </main>
      <StepFooter buttonText="Submit" onClick={onSubmit} />

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
                onChange("state", "");
                setShareholderCountryId(country?.id as number | undefined);
              }}
              className="h-16 rounded-2xl px-5 text-lg text-left"
            />
          </FormField>
          <FormField label="State">
            <SelectState
              fetchStates={fetchStates}
              countryOriginalId={shareholderCountryId}
              update={(state) => onChange("state", state?.name ?? "")}
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
  const [countryName, setCountryName] = useState("United Kingdom");
  const [details, setDetails] = useState<BusinessDetails>({
    registeredElsewhere: "Yes",
    registeredCountries: "",
    businessName: "",
    structure: businessStructures[0] ?? "Limited Liability Company",
    briefDescription: "",
    activityPurpose: "",
    businessKind: businessKinds[0] ?? "A new business",
    startYear: "",
    startMonth: "",
  });
  const [personal, setPersonal] = useState<PersonalInformation>({
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
  });
  const [personalError, setPersonalError] = useState("");
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
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
      emoji: null,
      originalId: undefined,
    };

  const updateDetails = <K extends keyof BusinessDetails>(
    key: K,
    value: BusinessDetails[K],
  ) => {
    setDetails((current) => ({ ...current, [key]: value }));
  };

  const updatePersonal = <K extends keyof PersonalInformation>(
    key: K,
    value: PersonalInformation[K],
  ) => {
    setPersonal((current) => ({ ...current, [key]: value }));
    setPersonalError("");
  };

  const updateNewShareholder = <K extends keyof Shareholder>(
    key: K,
    value: Shareholder[K],
  ) => {
    setNewShareholder((current) => ({ ...current, [key]: value }));
    setShareholderError("");
  };

  const stepsList: RegistrationStep[] = [
    "registered-elsewhere",
    ...(details.registeredElsewhere === "Yes"
      ? ["registered-countries" as const]
      : []),
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
      setShareholders((current) =>
        current.map((item, idx) =>
          idx === editingShareholderIndex ? newShareholder : item,
        ),
      );
    } else {
      setShareholders((current) => [...current, newShareholder]);
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
            onSelectCountry={setCountryName}
            onBack={goBack}
            onContinue={() => setStep("package")}
          />
        )}

        {step === "package" && (
          <PackageStep
            country={{ name: country.name, flag: country.emoji }}
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "registered-elsewhere" && (
          <RegisteredElsewhereStep
            value={details.registeredElsewhere}
            onChange={(val) => updateDetails("registeredElsewhere", val)}
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "registered-countries" && (
          <RegisteredCountriesStep
            value={details.registeredCountries}
            onChange={(val) => updateDetails("registeredCountries", val)}
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "business-name" && (
          <BusinessNameStep
            value={details.businessName}
            onChange={(val) => updateDetails("businessName", val)}
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "structure" && (
          <StructureStep
            value={details.structure}
            onChange={(val) => updateDetails("structure", val)}
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "brief-description" && (
          <BriefDescriptionStep
            value={details.briefDescription}
            onChange={(val) => updateDetails("briefDescription", val)}
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "activity-purpose" && (
          <ActivityPurposeStep
            value={details.activityPurpose}
            onChange={(val) => updateDetails("activityPurpose", val)}
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "business-kind" && (
          <BusinessKindStep
            value={details.businessKind}
            onChange={(val) => updateDetails("businessKind", val)}
            onBack={goBack}
            onContinue={continueFromStep}
          />
        )}

        {step === "start-date" && (
          <StartDateStep
            startYear={details.startYear}
            startMonth={details.startMonth}
            onYearChange={(year) => updateDetails("startYear", year)}
            onMonthChange={(month) => updateDetails("startMonth", month)}
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
              setShareholders((current) =>
                current.filter((_, idx) => idx !== index),
              );
            }}
            onBack={goBack}
            onSubmit={continueFromStep}
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
