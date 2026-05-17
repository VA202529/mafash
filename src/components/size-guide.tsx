import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

const apparel = [
  { size: "XS", chest: "86–89",  waist: "71–74",  hips: "89–92"  },
  { size: "S",  chest: "90–94",  waist: "75–79",  hips: "93–97"  },
  { size: "M",  chest: "95–100", waist: "80–85",  hips: "98–103" },
  { size: "L",  chest: "101–107",waist: "86–92",  hips: "104–110"},
  { size: "XL", chest: "108–115",waist: "93–100", hips: "111–118"},
];

const footwear = [
  { eu: "40", uk: "6",  us: "7",  cm: "25.0" },
  { eu: "41", uk: "7",  us: "8",  cm: "25.5" },
  { eu: "42", uk: "8",  us: "9",  cm: "26.5" },
  { eu: "43", uk: "9",  us: "10", cm: "27.5" },
  { eu: "44", uk: "10", us: "11", cm: "28.0" },
  { eu: "45", uk: "11", us: "12", cm: "29.0" },
];

export function SizeGuide({ category }: { category: string }) {
  const [tab, setTab] = useState<"apparel" | "footwear">(category === "Footwear" ? "footwear" : "apparel");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs underline-offset-4 hover:underline">Size guide</button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Size guide</DialogTitle>
          <DialogDescription className="text-xs uppercase tracking-[0.18em]">
            Measurements in centimetres. If you are between sizes, we recommend sizing up.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex gap-1 border-b border-border">
          {(["apparel","footwear"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "px-4 py-2 text-xs uppercase tracking-[0.18em] " +
                (tab === t ? "border-b-2 border-foreground" : "text-muted-foreground")
              }
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "apparel" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="py-3">Size</th><th>Chest</th><th>Waist</th><th>Hips</th>
                </tr>
              </thead>
              <tbody>
                {apparel.map((r) => (
                  <tr key={r.size} className="border-t border-border">
                    <td className="py-3 font-serif text-base">{r.size}</td>
                    <td>{r.chest} cm</td><td>{r.waist} cm</td><td>{r.hips} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="py-3">EU</th><th>UK</th><th>US</th><th>Foot length</th>
                </tr>
              </thead>
              <tbody>
                {footwear.map((r) => (
                  <tr key={r.eu} className="border-t border-border">
                    <td className="py-3 font-serif text-base">{r.eu}</td>
                    <td>{r.uk}</td><td>{r.us}</td><td>{r.cm} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <p><strong className="text-foreground">Chest:</strong> measure under the arms, around the fullest part of the chest.</p>
          <p><strong className="text-foreground">Waist:</strong> measure around the natural waistline, keeping the tape relaxed.</p>
          <p><strong className="text-foreground">Hips:</strong> measure around the fullest part of the hips, feet together.</p>
          <p><strong className="text-foreground">Foot:</strong> stand on paper, mark heel and longest toe, measure the distance.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
