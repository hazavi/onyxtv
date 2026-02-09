import Link from "next/link";
import { ChevronRight, HomeLine } from "@untitledui/icons";

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-white/40 mb-6 flex-wrap">
      <Link
        href="/"
        className="hover:text-white/70 transition shrink-0 flex items-center gap-1"
      >
        <HomeLine className="w-4 h-4" strokeWidth={1.5} />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-white/15 shrink-0" strokeWidth={1.5} />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-white/70 transition truncate max-w-[200px]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white/60 truncate max-w-[200px] font-medium">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
