import type { ReactNode } from "react";

export function DemoBadge({ children = "Demo ma’lumotlar" }: { children?: ReactNode }) {
  return <span className="site-demo-badge">{children}</span>;
}

export function TrustBadge({
  icon,
  title,
  detail,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="site-trust-badge">
      <span className="site-trust-icon" aria-hidden="true">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
    </div>
  );
}
