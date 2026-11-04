import Link from "next/link";

type SectionHeadingProps = {
  title: string;
  id?: string;
  link?: { href: string; label: string };
};

export function SectionHeading({ title, id, link }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 id={id} className="text-2xl font-bold tracking-tight text-gray-900">
        {title}
      </h2>
      {link && (
        <Link href={link.href} className="text-sm font-semibold text-accent-600 hover:text-accent-700 hover:underline">
          {link.label} →
        </Link>
      )}
    </div>
  );
}
