export function eventPath(slug: string): string {
  return `/e/${slug}`;
}

export function eventApplyPath(slug: string): string {
  return `/e/${slug}/apply`;
}

export function eventBoardPath(slug: string): string {
  return `/e/${slug}/board`;
}

export function hostEventPath(slug: string): string {
  return `/host/${slug}`;
}
