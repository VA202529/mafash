import { useQuery } from "@tanstack/react-query";
import { getProofReviews } from "@/lib/api";

export function CustomerProof() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["proof-reviews"],
    queryFn: getProofReviews,
    staleTime: 2 * 60_000,
  });

  if (!isLoading && data.length === 0) return null;

  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1400px] px-6 py-24">
        <div className="mb-10 max-w-xl">
          <div className="eyebrow mb-3">Customer Proof</div>
          <h2 className="font-serif text-4xl md:text-5xl">Worn by the Mafash community.</h2>
        </div>
        <div className="grid grid-cols-1 gap-x-5 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="aspect-[3/4] animate-pulse rounded-md bg-secondary" />
              ))
            : data.map((proof) => (
                <figure key={proof.proof_id} className="group relative">
                  <div className="overflow-hidden rounded-md border border-border bg-background shadow-[0_22px_55px_rgba(13,10,7,0.14)]">
                    <img
                      src={proof.thumbnail_url || proof.image_url}
                      alt={proof.product_name || "Customer proof"}
                      loading="lazy"
                      width={900}
                      height={1200}
                      className="aspect-[3/4] w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                    />
                    {proof.quote && (
                      <figcaption className="p-4 text-sm leading-relaxed text-muted-foreground">
                        {proof.quote}
                        {proof.customer_name && (
                          <span className="mt-3 block font-serif text-base text-foreground">
                            {proof.customer_name}
                          </span>
                        )}
                      </figcaption>
                    )}
                  </div>
                  <div className="absolute -bottom-5 left-4 right-6 rounded border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
                    <div className="font-serif text-lg leading-none">
                      {proof.product_name || "Mafash item"}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {proof.badge_text || "Binnenkort"}
                    </div>
                    {proof.link_url && (
                      <a
                        href={proof.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-[10px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
                      >
                        Bekijk item
                      </a>
                    )}
                  </div>
                </figure>
              ))}
        </div>
      </div>
    </section>
  );
}
