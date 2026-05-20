import type { ReactNode } from "react";

/** Simple placeholder body for public site sections not built yet. */
export function PublicSitePage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="py-12 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-500">
        Awards
      </p>
      <h1 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight text-white md:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
        {description}
      </p>
      {children ? <div className="mt-10">{children}</div> : null}
    </div>
  );
}
