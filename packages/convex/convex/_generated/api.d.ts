/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as businesses from "../businesses.js";
import type * as countryEntityTypes from "../countryEntityTypes.js";
import type * as crons from "../crons.js";
import type * as currencies from "../currencies.js";
import type * as entityTypes from "../entityTypes.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as locations from "../locations.js";
import type * as notifications from "../notifications.js";
import type * as packages from "../packages.js";
import type * as profiles from "../profiles.js";
import type * as seedEntities from "../seedEntities.js";
import type * as seedPackages from "../seedPackages.js";
import type * as shareholders from "../shareholders.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  businesses: typeof businesses;
  countryEntityTypes: typeof countryEntityTypes;
  crons: typeof crons;
  currencies: typeof currencies;
  entityTypes: typeof entityTypes;
  files: typeof files;
  http: typeof http;
  locations: typeof locations;
  notifications: typeof notifications;
  packages: typeof packages;
  profiles: typeof profiles;
  seedEntities: typeof seedEntities;
  seedPackages: typeof seedPackages;
  shareholders: typeof shareholders;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
};
