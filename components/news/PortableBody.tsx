import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";

type PortableBlock = Parameters<typeof PortableText>[0]["value"];

const components: PortableTextComponents = {
  types: {
    image: ({ value }: { value: Record<string, unknown> }) => (
      <figure className="my-8 overflow-hidden rounded-lg border border-surface-700">
        <Image
          src={urlFor(value).width(1400).fit("max").url()}
          alt={(value.alt as string) ?? ""}
          width={1400}
          height={900}
          className="w-full h-auto"
        />
      </figure>
    ),
  },
  block: {
    normal: ({ children }) => <p className="text-surface-100 leading-relaxed text-lg my-4">{children}</p>,
    h2: ({ children }) => <h2 className="font-heading text-3xl md:text-4xl text-surface-50 mt-10 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="font-heading text-2xl text-surface-50 mt-8 mb-3">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-cones-orange pl-6 my-8 italic text-surface-100">{children}</blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: { children: React.ReactNode; value?: { href?: string } }) => (
      <a href={value?.href} className="text-cones-blue hover:text-cones-orange underline underline-offset-4">{children}</a>
    ),
    strong: ({ children }) => <strong className="text-surface-50 font-semibold">{children}</strong>,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 my-4 text-surface-100 space-y-2">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 my-4 text-surface-100 space-y-2">{children}</ol>,
  },
};

export default function PortableBody({ value }: { value: PortableBlock }) {
  if (!value) return null;
  return <PortableText value={value} components={components} />;
}
