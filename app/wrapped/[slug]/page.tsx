import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // slug format: userId-period e.g. "abc123-2025"
  const ogUrl = `/api/og?title=Wrapped&hours=847&titles=42&personality=The%20Worldbuilder&period=2025`;
  return {
    title: `Feyris Wrapped — ${slug}`,
    description: "Check out my entertainment year in review on Feyris.",
    openGraph: {
      title: `Feyris Wrapped`,
      description: "My year in entertainment, summarized.",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Feyris Wrapped`,
      description: "My year in entertainment, summarized.",
      images: [ogUrl],
    },
  };
}

export default async function PublicWrappedPage({ params }: Props) {
  const { slug } = await params;

  // Shared wrapped data — fetched from Supabase when sharing API is available
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-fey-black px-4 text-cream">
      {/* Glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(200,164,78,0.06), transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[500px] text-center">
        {/* Logo */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-gold to-[#a0832e]" />
          <span className="text-[11px] font-extrabold uppercase tracking-[4px] text-gold">
            Feyris
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-2 text-4xl font-black gradient-gold">
          Wrapped
        </h1>
        <p className="mb-8 text-[13px] text-cream/30">
          Shared by a Feyris user · <span className="text-cream/40">{slug}</span>
        </p>

        {/* Wrapped preview card */}
        <div
          className="rounded-2xl border border-gold/[0.07] p-8"
          style={{
            background: "linear-gradient(135deg, rgba(20,20,28,0.9), rgba(14,14,20,0.95))",
          }}
        >
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[3px] text-gold/50">
            Total Hours
          </div>
          <div className="text-[64px] font-black leading-none gradient-gold">
            847
          </div>
          <div className="mt-1 text-[16px] font-light text-cream">
            hours consumed
          </div>
          <div className="mt-4 text-[12px] text-cream/30">
            42 titles · Avg 8.3/10
          </div>
          <div className="mt-4 text-[20px] font-black text-cream">
            &ldquo;The Worldbuilder&rdquo;
          </div>
        </div>

        {/* CTA */}
        <a
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[12px] font-bold text-fey-black"
          style={{
            background: "linear-gradient(135deg, #c8a44e, #a0832e)",
          }}
        >
          Create Your Own on Feyris
        </a>
      </div>
    </div>
  );
}
