import type { ReactNode } from "react";
import { Sprout } from "lucide-react";

export function SiteEmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="site-empty">
      <span className="site-empty-icon" aria-hidden="true">
        <Sprout size={28} />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}
