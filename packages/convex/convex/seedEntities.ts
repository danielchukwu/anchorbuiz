import { mutation, internalMutation } from "./_generated/server";

// Target countries from seed/locations/countries.jsonl:
// Australia: 14
// Canada: 39
// China: 45
// Japan: 109
// Nigeria: 161
// Portugal: 177
// United Arab Emirates: 231
// United Kingdom: 232
// United States: 233

const POPULAR_ENTITY_TYPES = [
  {
    shortName: "LLC",
    name: "Limited Liability Company",
    description:
      "Flexible business structure combining pass-through taxation with limited liability protection.",
  },
  {
    shortName: "C-Corp",
    name: "C Corporation",
    description:
      "Standard corporate entity with separate legal liability, taxation, and ability to issue shares.",
  },
  {
    shortName: "S-Corp",
    name: "S Corporation",
    description:
      "Corporation that elects pass-through taxation for eligible domestic shareholders.",
  },
  {
    shortName: "LTD",
    name: "Private Limited Company",
    description:
      "Standard private company limited by shares, popular in UK, Nigeria, and common law jurisdictions.",
  },
  {
    shortName: "PLC",
    name: "Public Limited Company",
    description:
      "Limited liability company whose shares can be publicly offered and traded.",
  },
  {
    shortName: "Corp",
    name: "Corporation / Inc.",
    description:
      "Incorporated federal or provincial company with shares and limited liability.",
  },
  {
    shortName: "Pty Ltd",
    name: "Proprietary Limited Company",
    description:
      "Standard private limited company in Australia with up to 50 non-employee shareholders.",
  },
  {
    shortName: "LDA",
    name: "Sociedade por Quotas (Lda)",
    description:
      "Most common private limited company structure in Portugal.",
  },
  {
    shortName: "SA",
    name: "Sociedade Anónima (SA)",
    description:
      "Public joint-stock corporation in Portugal and civil law jurisdictions.",
  },
  {
    shortName: "FZ-LLC",
    name: "Free Zone Limited Liability Company",
    description:
      "UAE Free Zone entity offering 100% foreign ownership and zero corporate/personal taxes.",
  },
  {
    shortName: "Mainland LLC",
    name: "UAE Mainland LLC",
    description:
      "Commercial entity licensed to trade directly inside the UAE mainland as well as internationally.",
  },
  {
    shortName: "WFOE",
    name: "Wholly Foreign-Owned Enterprise",
    description:
      "Limited liability company in China owned 100% by foreign investors.",
  },
  {
    shortName: "JV",
    name: "Joint Venture",
    description:
      "Sino-foreign equity or contractual joint venture enterprise in China.",
  },
  {
    shortName: "KK",
    name: "Kabushiki Kaisha",
    description:
      "Traditional joint-stock corporation in Japan with high prestige and investor credibility.",
  },
  {
    shortName: "GK",
    name: "Godo Kaisha",
    description:
      "Japanese limited liability company format offering simple setup and lower maintenance costs.",
  },
  {
    shortName: "Sole Prop",
    name: "Sole Proprietorship / Business Name",
    description:
      "Unincorporated business owned and operated by an individual.",
  },
];

// Many-to-many associations mapping country originalId -> list of entity type short names in display order
const COUNTRY_ENTITY_MAPPINGS: Record<number, string[]> = {
  // United States (originalId: 233)
  233: ["LLC", "C-Corp", "S-Corp", "Sole Prop"],

  // Canada (originalId: 39)
  39: ["Corp", "Sole Prop"],

  // Nigeria (originalId: 161)
  161: ["LTD", "PLC", "Sole Prop"],

  // United Kingdom (originalId: 232)
  232: ["LTD", "PLC", "Sole Prop"],

  // Portugal (originalId: 177)
  177: ["LDA", "SA", "Sole Prop"],

  // Australia (originalId: 14)
  14: ["Pty Ltd", "PLC", "Sole Prop"],

  // United Arab Emirates (originalId: 231)
  231: ["FZ-LLC", "Mainland LLC"],

  // China (originalId: 45)
  45: ["WFOE", "JV"],

  // Japan (originalId: 109)
  109: ["GK", "KK"],
};

/**
 * Seed or update entity types and country-entity relationships in Convex.
 * Safe to run multiple times (idempotent upsert).
 */
export const seedEntityTypesAndCountryRelations = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const entityTypeMap = new Map<string, any>();

    // 1. Upsert Entity Types
    for (const item of POPULAR_ENTITY_TYPES) {
      const existing = await ctx.db
        .query("entityTypes")
        .withIndex("by_shortName", (q) => q.eq("shortName", item.shortName))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          name: item.name,
          description: item.description,
          updatedAt: now,
        });
        entityTypeMap.set(item.shortName, existing._id);
      } else {
        const id = await ctx.db.insert("entityTypes", {
          ...item,
          createdAt: now,
          updatedAt: now,
        });
        entityTypeMap.set(item.shortName, id);
      }
    }

    // 2. Upsert Country Entity Types relationships
    let linksCreated = 0;
    let linksUpdated = 0;

    for (const [countryIdStr, shortNames] of Object.entries(
      COUNTRY_ENTITY_MAPPINGS,
    )) {
      const countryOriginalId = Number(countryIdStr);

      for (let index = 0; index < shortNames.length; index++) {
        const shortName = shortNames[index];
        const entityId = entityTypeMap.get(shortName);
        if (!entityId) continue;

        const displayOrder = index + 1;

        const existingLink = await ctx.db
          .query("countryEntityTypes")
          .withIndex("by_country_and_entity", (q) =>
            q
              .eq("countryOriginalId", countryOriginalId)
              .eq("entityId", entityId),
          )
          .first();

        if (existingLink) {
          await ctx.db.patch(existingLink._id, {
            displayOrder,
            updatedAt: now,
          });
          linksUpdated++;
        } else {
          await ctx.db.insert("countryEntityTypes", {
            countryOriginalId,
            entityId,
            displayOrder,
            createdAt: now,
            updatedAt: now,
          });
          linksCreated++;
        }
      }
    }

    return {
      success: true,
      entityTypesSeeded: POPULAR_ENTITY_TYPES.length,
      countryEntityLinksCreated: linksCreated,
      countryEntityLinksUpdated: linksUpdated,
    };
  },
});
