import CopyLink from "@/components/CopyLink";
import {
  eventApplyPath,
  eventBoardPath,
  eventPath,
  hostEventPath,
} from "@/lib/paths";
import { card, eyebrow, fieldLabel } from "@/lib/styles";

export default function RouteCodes({
  slug,
  featured = false,
  bare = false,
}: {
  slug: string;
  featured?: boolean;
  bare?: boolean;
}) {
  const rows: { label: string; path: string }[] = [
    ...(featured
      ? [
          { label: "House", path: "/" },
          { label: "House apply", path: "/apply" },
          { label: "House board", path: "/board" },
        ]
      : []),
    { label: "Night", path: eventPath(slug) },
    { label: "Apply", path: eventApplyPath(slug) },
    { label: "Board", path: eventBoardPath(slug) },
    { label: "Host desk", path: "/host" },
    { label: "Triage", path: hostEventPath(slug) },
  ];

  return (
    <div className={bare ? "space-y-3" : `${card} space-y-3`}>
      <p className={eyebrow}>Route codes</p>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={`${row.label}:${row.path}`}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className={fieldLabel}>{row.label}</p>
            <CopyLink path={row.path} />
          </li>
        ))}
      </ul>
    </div>
  );
}
