/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as events from "../events.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_eventLookup from "../lib/eventLookup.js";
import type * as lib_hosts from "../lib/hosts.js";
import type * as lib_limits from "../lib/limits.js";
import type * as lib_slug from "../lib/slug.js";
import type * as lib_text from "../lib/text.js";
import type * as seedCopy from "../seedCopy.js";
import type * as submissions from "../submissions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  events: typeof events;
  "lib/auth": typeof lib_auth;
  "lib/eventLookup": typeof lib_eventLookup;
  "lib/hosts": typeof lib_hosts;
  "lib/limits": typeof lib_limits;
  "lib/slug": typeof lib_slug;
  "lib/text": typeof lib_text;
  seedCopy: typeof seedCopy;
  submissions: typeof submissions;
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
