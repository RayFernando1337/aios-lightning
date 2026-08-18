import { UserIdentity } from "convex/server";
import { ConvexError } from "convex/values";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { isHostEmail } from "./hosts";

export async function requireIdentity(
  ctx: QueryCtx | MutationCtx,
): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new ConvexError("Sign in to continue.");
  }
  return identity;
}

export function identityIsHost(identity: UserIdentity): boolean {
  return identity.email !== undefined && isHostEmail(identity.email);
}

export async function requireHost(
  ctx: QueryCtx | MutationCtx,
): Promise<UserIdentity> {
  const identity = await requireIdentity(ctx);

  if (!identity.email) {
    throw new ConvexError(
      "This session token carries no email, so host access cannot be checked. Add an email claim to the convex JWT template in Clerk.",
    );
  }
  if (!isHostEmail(identity.email)) {
    throw new ConvexError("Host access only.");
  }

  return identity;
}
