import { mutation } from "./_generated/server";

// Target countries originalIds:
// Nigeria: 161
// United Kingdom: 232
// United States: 233
// Portugal: 177
// China: 45
// Canada: 39
// Australia: 14
// United Arab Emirates: 231
// Japan: 109

export interface PackageSeedItem {
  countryOriginalId: number;
  name: string;
  displayOrder: number;
  currency: string;
  price: number;
  priceInNaira?: number;
  offerings: string[];
  isActive?: boolean;
}

export const SEED_PACKAGES: PackageSeedItem[] = [
  // 🇳🇬 Nigeria Essential Package
  {
    countryOriginalId: 161,
    name: "Nigeria Essential Package",
    displayOrder: 1,
    currency: "NGN",
    price: 100000,
    priceInNaira: 100000,
    isActive: true,
    offerings: [
      "Registration of business Name with CAC",
      "Company Registration (CAC Certificate)",
      "Status Report",
      "TIN registration",
      "NRS TIN",
      "ID card for CEO",
      "Name Search (one)",
      "Letterhead Paper",
      "Bank contacts for seamless business account opening",
      "Staff Documents (helps protect your business)",
      "Soft copies of all documents",
    ],
  },

  // 🇬🇧 UK Essential Package
  {
    countryOriginalId: 232,
    name: "UK Essential Package",
    displayOrder: 1,
    currency: "GBP",
    price: 500,
    priceInNaira: 890000,
    isActive: true,
    offerings: [
      "Company registration",
      "UK registered office + London address services",
      "Company documents & registers",
      "Free VAT registration",
      "Banking/fintech account opening assistance",
      "Compliance reminders/support",
      "Usually registered within 1 to 30 days",
    ],
  },

  // 🇺🇸 US Essential Package
  {
    countryOriginalId: 233,
    name: "US Essential Package",
    displayOrder: 1,
    currency: "USD",
    price: 700,
    priceInNaira: 930000,
    isActive: true,
    offerings: [
      "Company registration",
      "US Business Address",
      "Company documents & registers",
      "Mail scanning",
      "Privacy protection",
      "Compliance reminders/support",
      "Banking/fintech account opening assistance",
      "Usually registered within 1 to 7 days",
      "EIN (needed for bank account opening) processed within 2 to 4 weeks",
    ],
  },

  // 🇵🇹 Portugal Essential Package
  {
    countryOriginalId: 177,
    name: "Portugal Essential Package",
    displayOrder: 1,
    currency: "EUR",
    price: 1950,
    priceInNaira: 2900000,
    isActive: true,
    offerings: [
      "Portuguese company registration (Lda./Unipessoal Lda.)",
      "Company NIPC/NIF",
      "Company name registration",
      "Articles of Association & company documents",
      "RCBE beneficial-owner registration",
      "Portuguese registered office/address assistance",
      "Tax & Social Security registration",
      "Business bank account opening assistance",
      "Compliance & registration support",
      "Soft copies of all company documents",
      "Usually completed within 2–4 weeks",
    ],
  },

  // 🇨🇳 China Essential Package
  {
    countryOriginalId: 45,
    name: "China Essential Package",
    displayOrder: 1,
    currency: "USD",
    price: 5000,
    priceInNaira: 6900000,
    isActive: true,
    offerings: [
      "WFOE company registration",
      "China business licence",
      "Company name registration",
      "Registered address assistance",
      "Tax registration & setup",
      "Business bank account opening assistance",
      "Company documents & registers",
      "Compliance setup/support",
      "Soft copies of all documents",
      "Usually completed within 4–8 weeks",
    ],
  },

  // 🇨🇦 Canada Essential Package
  {
    countryOriginalId: 39,
    name: "Canada Essential Package",
    displayOrder: 1,
    currency: "CAD",
    price: 950,
    priceInNaira: 1050000,
    isActive: true,
    offerings: [
      "Federal or Provincial Corporation registration",
      "NUANS Name Search Report",
      "Articles of Incorporation & Certificate",
      "Corporate Minute Book & share register",
      "Business Number (BN) and Corporate Tax Account setup",
      "Registered office address assistance",
      "Canadian business banking assistance",
      "Ongoing annual compliance support",
    ],
  },

  // 🇦🇺 Australia Essential Package
  {
    countryOriginalId: 14,
    name: "Australia Essential Package",
    displayOrder: 1,
    currency: "AUD",
    price: 1200,
    priceInNaira: 1250000,
    isActive: true,
    offerings: [
      "Proprietary Limited (Pty Ltd) ASIC registration",
      "Australian Company Number (ACN)",
      "Australian Business Number (ABN) & TFN registration",
      "Company Constitution and Share Certificates",
      "Registered office address support",
      "Australian bank account opening assistance",
      "ASIC ongoing compliance reminders",
    ],
  },

  // 🇦🇪 UAE Free Zone Package
  {
    countryOriginalId: 231,
    name: "UAE Free Zone Essential Package",
    displayOrder: 1,
    currency: "AED",
    price: 12500,
    priceInNaira: 5200000,
    isActive: true,
    offerings: [
      "UAE Free Zone trade license (100% foreign ownership)",
      "Certificate of Incorporation & Memorandum of Association (MOA)",
      "Shared Desk / Virtual Office Lease agreement",
      "Establishment Card processing",
      "Investor/Partner Visa eligibility assistance",
      "Corporate bank account opening guidance in Dubai/UAE",
      "VAT & Corporate Tax registration support",
    ],
  },

  // 🇯🇵 Japan Essential Package
  {
    countryOriginalId: 109,
    name: "Japan Godo Kaisha (GK) Package",
    displayOrder: 1,
    currency: "JPY",
    price: 350000,
    priceInNaira: 3600000,
    isActive: true,
    offerings: [
      "Legal Affairs Bureau registration (Godo Kaisha / GK)",
      "Articles of Incorporation preparation & notarization",
      "Corporate seal (Hanko) registration and delivery",
      "Tax office, pension & labor office notifications",
      "Registered address assistance in Tokyo/Japan",
      "Japanese business bank account consultation",
      "Bilingual incorporation support (English & Japanese)",
    ],
  },
];

/**
 * Seed packages for registration countries idempotently
 */
export const seedPackages = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let created = 0;
    let updated = 0;

    for (const pkg of SEED_PACKAGES) {
      const existing = await ctx.db
        .query("packages")
        .withIndex("by_countryOriginalId", (q) =>
          q.eq("countryOriginalId", pkg.countryOriginalId),
        )
        .filter((q) => q.eq(q.field("name"), pkg.name))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          displayOrder: pkg.displayOrder,
          offerings: pkg.offerings,
          currency: pkg.currency,
          price: pkg.price,
          priceInNaira: pkg.priceInNaira,
          isActive: pkg.isActive ?? true,
          updatedAt: now,
        });
        updated++;
      } else {
        await ctx.db.insert("packages", {
          ...pkg,
          isActive: pkg.isActive ?? true,
          createdAt: now,
          updatedAt: now,
        });
        created++;
      }
    }

    return {
      success: true,
      packagesCreated: created,
      packagesUpdated: updated,
      totalPackages: SEED_PACKAGES.length,
    };
  },
});
