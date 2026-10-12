import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // -------------- CURRENCIES --------------
  currencies: defineTable({
    code: v.string(), // AED
    name: v.string(),
    symbol: v.string(),
    numericCode: v.string(),
    minorUnit: v.number(),
    isActive: v.boolean(),
  })
    .index("by_code", ["code"])
    .index("by_numeric_code", ["numericCode"]),

  // -------------- REGIONS --------------
  regions: defineTable({
    originalId: v.number(), // Original SQL ID
    name: v.string(),
    translations: v.optional(v.record(v.string(), v.any())),
    wikiDataId: v.string(),
  }).index("by_originalId", ["originalId"]),

  // -------------- SUBREGIONS --------------
  subregions: defineTable({
    originalId: v.optional(v.number()), // Original SQL ID
    name: v.string(),
    translations: v.optional(v.record(v.string(), v.any())),
    originalRegionId: v.optional(v.number()), // Original SQL region ID for linking
    wikiDataId: v.optional(v.string()),
  }).index("originalRegionId", ["originalRegionId"]),

  // -------------- COUNTRIES --------------
  countries: defineTable({
    originalId: v.optional(v.number()), // Original SQL ID
    name: v.string(),
    iso3: v.union(v.string(), v.null()),
    iso2: v.union(v.string(), v.null()),
    numericCode: v.union(v.string(), v.null()),
    phoneCode: v.union(v.string(), v.null()),
    capital: v.union(v.string(), v.null()),
    currency: v.union(v.string(), v.null()), // AED
    currencyName: v.union(v.string(), v.null()),
    currencySymbol: v.union(v.string(), v.null()),
    tld: v.union(v.string(), v.null()),
    native: v.union(v.string(), v.null()),
    region: v.union(v.string(), v.null()),
    subregion: v.union(v.string(), v.null()),
    originalRegionId: v.union(v.number(), v.null()), // Original SQL region ID for linking
    originalSubregionId: v.union(v.number(), v.null()), // Original SQL subregion ID for linking
    nationality: v.union(v.string(), v.null()),
    timezones: v.array(v.any()),
    translations: v.union(v.record(v.string(), v.any()), v.null()),
    latitude: v.union(v.number(), v.string(), v.null()),
    longitude: v.union(v.number(), v.string(), v.null()),
    emoji: v.union(v.string(), v.null()),
    emojiU: v.union(v.string(), v.null()),
    isRegistrationAvailable: v.optional(v.boolean()),
  })
    .index("by_originalId", ["originalId"])
    .index("by_name", ["name"])
    .index("by_originalRegionId", ["originalRegionId"])
    .index("by_originalSubregionId", ["originalSubregionId"])
    .index("by_isRegistrationAvailable", ["isRegistrationAvailable"])
    .searchIndex("search_name", {
      searchField: "name",
    }),

  // -------------- STATES --------------
  states: defineTable({
    originalId: v.optional(v.number()), // Original SQL ID
    name: v.string(),
    originalCountryId: v.optional(v.number()), // Original SQL country ID for linking
    countryCode: v.string(),
    countryName: v.string(),
    iso2: v.union(v.string(), v.null()),
    iso31662: v.union(v.string(), v.null()),
    fipsCode: v.union(v.string(), v.null()),
    type: v.union(v.string(), v.null()),
    level: v.union(v.string(), v.null()),
    originalParentId: v.union(v.string(), v.null()), // Original SQL parent state ID for linking
    latitude: v.union(v.number(), v.string(), v.null()),
    longitude: v.union(v.number(), v.string(), v.null()),
    timezone: v.union(v.string(), v.null()),
  })
    .index("by_originalId", ["originalId"])
    .index("by_originalCountryId", ["originalCountryId"])
    .index("by_name", ["name"])
    .index("by_originalParentId", ["originalParentId"])
    .searchIndex("search_name", {
      searchField: "name",
    }),

  // -------------- FILES --------------
  files: defineTable({
    // Core file properties
    originalName: v.string(),
    mimeType: v.string(),
    fileSize: v.number(),
    fileKey: v.string(),
    publicUrl: v.string(),
    folder: v.string(),
    isPublic: v.boolean(),
    status: v.optional(v.string()), // "uploading", "uploaded", "failed"
    uploadedAt: v.optional(v.number()),

    // Course material properties (optional - only for course materials)
    materialType: v.optional(v.string()), // "lecture", "assignment", "reading", "video", "quiz", "exam"
    displayTitle: v.optional(v.string()), // Display name for course materials
    order: v.optional(v.number()), // Order within the module/course
    uploadedBy: v.optional(v.id("profile")), // Who uploaded the file
  })
    .index("by_folder", ["folder"])
    .index("by_status", ["status"])
    .index("by_materialType", ["materialType"])
    .index("by_uploadedBy", ["uploadedBy"]),

  // -------------- PROFILES --------------
  profile: defineTable({
    userId: v.string(), // Better Auth user ID
    firstName: v.string(),
    middleName: v.optional(v.string()),
    lastName: v.string(),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    whatsappPhoneNumber: v.optional(v.string()),
    residentialAddress: v.optional(v.string()),
    countryOriginalId: v.optional(v.number()),
    dateOfBirth: v.optional(v.string()), // e.g. "YYYY-MM-DD" or ISO string
    governmentIds: v.optional(
      v.object({
        driversLicense: v.optional(v.string()),
        nin: v.optional(v.string()),
        passport: v.optional(v.string()),
      }),
    ),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_countryOriginalId", ["countryOriginalId"]),

  // -------------- BUSINESSES --------------
  businesses: defineTable({
    userId: v.string(), // Better Auth user ID of business owner/creator
    name: v.string(),
    logo: v.optional(v.string()), // URL or file key
    countryOriginalId: v.number(),
    stateOriginalId: v.optional(v.number()),
    isAStartup: v.optional(v.boolean()),
    status: v.string(), // e.g., "draft", "pending", "in_review", "registered", "rejected"
    paymentStatus: v.string(), // e.g., "unpaid", "pending", "paid", "refunded"
    otherCountriesRegisteredIn: v.optional(v.array(v.number())), // Array of countryOriginalIds
    entityTypeId: v.optional(v.id("entityTypes")),
    businessDescription: v.optional(v.string()),
    businessActivitiesAndPurpose: v.optional(v.string()),
    businessStartDate: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_countryOriginalId", ["countryOriginalId"])
    .index("by_stateOriginalId", ["stateOriginalId"])
    .index("by_status", ["status"])
    .index("by_paymentStatus", ["paymentStatus"])
    .index("by_entityTypeId", ["entityTypeId"])
    .searchIndex("search_name", {
      searchField: "name",
    }),

  // -------------- SHAREHOLDERS --------------
  shareholders: defineTable({
    businessId: v.id("businesses"),
    userId: v.optional(v.string()), // Linked Better Auth user ID if user exists
    avatarUrl: v.optional(v.string()),
    firstName: v.string(),
    middleName: v.optional(v.string()),
    lastName: v.string(),
    email: v.string(),
    ownershipPercentage: v.number(), // e.g., 50.0
    countryOriginalId: v.optional(v.number()),
    countryStateOriginalId: v.optional(v.number()),
    city: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    address: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_businessId", ["businessId"])
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_business_and_email", ["businessId", "email"]),

  // -------------- PACKAGES --------------
  packages: defineTable({
    countryOriginalId: v.number(),
    name: v.string(),
    displayOrder: v.number(),
    offerings: v.any(), // Flexible JSON offerings/features list
    currency: v.string(), // e.g. "USD", "NGN", "GBP"
    price: v.number(),
    priceInNaira: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_countryOriginalId", ["countryOriginalId"])
    .index("by_country_and_displayOrder", ["countryOriginalId", "displayOrder"])
    .index("by_name", ["name"]),

  // -------------- ENTITY TYPES --------------
  entityTypes: defineTable({
    shortName: v.string(), // e.g. "LLC", "LTD", "PLC"
    name: v.string(), // e.g. "Limited Liability Company"
    description: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_shortName", ["shortName"])
    .index("by_name", ["name"]),

  // -------------- COUNTRY ENTITY TYPES --------------
  countryEntityTypes: defineTable({
    countryOriginalId: v.number(),
    entityId: v.id("entityTypes"),
    displayOrder: v.number(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_countryOriginalId", ["countryOriginalId"])
    .index("by_entityId", ["entityId"])
    .index("by_country_and_entity", ["countryOriginalId", "entityId"])
    .index("by_country_and_displayOrder", ["countryOriginalId", "displayOrder"]),

  // -------------- NOTIFICATIONS --------------
  notifications: defineTable({
    userId: v.optional(v.string()), // Target user if user-specific
    name: v.string(), // Notification title or type name
    entityId: v.optional(v.string()), // ID of related entity (e.g. businessId, shareholderId)
    entityType: v.optional(v.string()), // "business", "profile", "package", etc.
    displayOrder: v.optional(v.number()),
    message: v.optional(v.string()),
    isRead: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_entityId", ["entityId"])
    .index("by_isRead", ["isRead"])
    .index("by_userId_and_isRead", ["userId", "isRead"]),
});
