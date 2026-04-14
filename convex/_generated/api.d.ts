/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as campaignPublic from "../campaignPublic.js";
import type * as campaigns from "../campaigns.js";
import type * as categories from "../categories.js";
import type * as fields from "../fields.js";
import type * as files from "../files.js";
import type * as invites from "../invites.js";
import type * as lib_access from "../lib/access.js";
import type * as lib_categoryStatus from "../lib/categoryStatus.js";
import type * as lib_tokens from "../lib/tokens.js";
import type * as lib_users from "../lib/users.js";
import type * as nominees from "../nominees.js";
import type * as users from "../users.js";
import type * as votes from "../votes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  campaignPublic: typeof campaignPublic;
  campaigns: typeof campaigns;
  categories: typeof categories;
  fields: typeof fields;
  files: typeof files;
  invites: typeof invites;
  "lib/access": typeof lib_access;
  "lib/categoryStatus": typeof lib_categoryStatus;
  "lib/tokens": typeof lib_tokens;
  "lib/users": typeof lib_users;
  nominees: typeof nominees;
  users: typeof users;
  votes: typeof votes;
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

export declare const components: {};
