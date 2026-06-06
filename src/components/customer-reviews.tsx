import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createCustomerReview, getCustomerReviews } from "@/lib/api";

export function CustomerReviews() {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["customer-reviews"],
    queryFn: getCustomerReviews,
    staleTime: 2 * 60_000,
  });
  const mutation = useMutation({
    mutationFn: createCustomerReview,
    onSuccess: async () => {
      setMessage("Bedankt. Je review is ontvangen en wordt eerst gecontroleerd.");
      await queryClient.invalidateQueries({ queryKey: ["customer-reviews"] });
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : "Review kon niet worden verstuurd.");
    },
  });

  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="eyebrow mb-3">Reviews</div>
          <h2 className="font-serif text-4xl md:text-5xl">Laat je ervaring achter.</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Reviews worden eerst gecontroleerd voordat ze zichtbaar worden op Mafash.
          </p>
          <form
            className="mt-8 space-y-4 border border-border bg-card p-5"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              mutation.mutate({
                name: String(form.get("name") || ""),
                email: String(form.get("email") || ""),
                rating,
                message: String(form.get("message") || ""),
              });
              event.currentTarget.reset();
            }}
          >
            <label className="block">
              <span className="eyebrow mb-1.5 block">Naam</span>
              <input
                name="name"
                required
                className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
              />
            </label>
            <label className="block">
              <span className="eyebrow mb-1.5 block">Email</span>
              <input
                name="email"
                type="email"
                required
                className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
              />
            </label>
            <div>
              <span className="eyebrow mb-2 block">Sterren</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    aria-label={`${star} sterren`}
                    className={`h-11 w-11 border border-border text-lg ${star <= rating ? "bg-foreground text-background" : "bg-background"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="eyebrow mb-1.5 block">Bericht</span>
              <textarea
                name="message"
                rows={4}
                required
                className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
              />
            </label>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
            <button
              disabled={mutation.isPending}
              className="w-full bg-foreground py-4 text-xs uppercase tracking-[0.22em] text-background disabled:opacity-60"
            >
              {mutation.isPending ? "Versturen..." : "Review versturen"}
            </button>
          </form>
        </div>
        <div className="grid gap-4">
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse bg-secondary" />
            ))}
          {!isLoading && data.length === 0 && (
            <div className="border border-border bg-card p-6 text-sm text-muted-foreground">
              Nog geen goedgekeurde reviews.
            </div>
          )}
          {data.map((review) => (
            <article key={review.review_id} className="border border-border bg-card p-6">
              <div className="mb-3 text-sm text-[var(--color-gold)]">
                {"★".repeat(review.rating)}
                <span className="text-muted-foreground">{"★".repeat(5 - review.rating)}</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{review.message}</p>
              <div className="mt-4 font-serif text-lg">{review.name}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
