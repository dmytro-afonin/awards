/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as campaignCategories from "../campaignCategories.js";
import type * as campaigns from "../campaigns.js";
import type * as files from "../files.js";
import type * as imageProcessing from "../imageProcessing.js";
import type * as lib_access from "../lib/access.js";
import type * as lib_campaignLifecycleNormalize from "../lib/campaignLifecycleNormalize.js";
import type * as lib_campaignLifecycleRules from "../lib/campaignLifecycleRules.js";
import type * as lib_campaignReady from "../lib/campaignReady.js";
import type * as lib_campaignSlug from "../lib/campaignSlug.js";
import type * as lib_categories from "../lib/categories.js";
import type * as lib_categoryWinner from "../lib/categoryWinner.js";
import type * as lib_imageTargets from "../lib/imageTargets.js";
import type * as lib_images from "../lib/images.js";
import type * as lib_publicCampaign from "../lib/publicCampaign.js";
import type * as lib_slug from "../lib/slug.js";
import type * as lib_users from "../lib/users.js";
import type * as lib_workspaces from "../lib/workspaces.js";
import type * as migrations from "../migrations.js";
import type * as publicCampaigns from "../publicCampaigns.js";
import type * as users from "../users.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  campaignCategories: typeof campaignCategories;
  campaigns: typeof campaigns;
  files: typeof files;
  imageProcessing: typeof imageProcessing;
  "lib/access": typeof lib_access;
  "lib/campaignLifecycleNormalize": typeof lib_campaignLifecycleNormalize;
  "lib/campaignLifecycleRules": typeof lib_campaignLifecycleRules;
  "lib/campaignReady": typeof lib_campaignReady;
  "lib/campaignSlug": typeof lib_campaignSlug;
  "lib/categories": typeof lib_categories;
  "lib/categoryWinner": typeof lib_categoryWinner;
  "lib/imageTargets": typeof lib_imageTargets;
  "lib/images": typeof lib_images;
  "lib/publicCampaign": typeof lib_publicCampaign;
  "lib/slug": typeof lib_slug;
  "lib/users": typeof lib_users;
  "lib/workspaces": typeof lib_workspaces;
  migrations: typeof migrations;
  publicCampaigns: typeof publicCampaigns;
  users: typeof users;
  workspaces: typeof workspaces;
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
