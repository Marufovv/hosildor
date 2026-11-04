import { Leaf } from "lucide-react";

export function SiteLogo({ small = false }: { small?: boolean }) {
  return (
    <span className={`logo ${small ? "small" : ""}`} aria-label="Hosilink">
      <span className="logo-icon" aria-hidden="true">
        <Leaf size={23} />
      </span>
      hosilink<span className="logo-period">.</span>
    </span>
  );
}
