import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, Sparkles, ArrowLeft, X, Circle, Check } from "lucide-react";

import tshirt from "@/assets/tshirt.jpg";
import jeans from "@/assets/jeans.jpg";
import coat from "@/assets/coat.jpg";
import sneakers from "@/assets/sneakers.jpg";
import sweater from "@/assets/sweater.jpg";
import belt from "@/assets/belt.jpg";
import newshirt from "@/assets/newshirt.jpg";
import styledlook from "@/assets/styledlook.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atelier — AI Personal Styling" },
      { name: "description", content: "Your AI-powered wardrobe and virtual try-on stylist." },
    ],
  }),
  component: App,
});

type Screen = "wardrobe" | "camera" | "loading" | "look";

type Garment = { id: string; name: string; tag: string; img: string };

const INITIAL: Garment[] = [
  { id: "1", name: "Cotton Tee", tag: "Top", img: tshirt },
  { id: "2", name: "Slim Jeans", tag: "Bottom", img: jeans },
  { id: "3", name: "Trench Coat", tag: "Outer", img: coat },
  { id: "4", name: "White Sneakers", tag: "Shoes", img: sneakers },
  { id: "5", name: "Cable Knit", tag: "Top", img: sweater },
  { id: "6", name: "Leather Belt", tag: "Accessory", img: belt },
];

function App() {
  const [screen, setScreen] = useState<Screen>("wardrobe");
  const [items, setItems] = useState<Garment[]>(INITIAL);
  const [newItemId, setNewItemId] = useState<string | null>(null);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8" style={{ background: "var(--gradient-warm)" }}>
      <div className="relative w-full max-w-[420px] h-[860px] bg-background rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-foreground/90">
        {/* status bar */}
        <div className="absolute top-0 inset-x-0 h-8 flex items-center justify-between px-6 text-xs font-medium z-50 text-foreground">
          <span>9:41</span>
          <div className="flex gap-1 items-center">
            <span>●●●</span>
          </div>
        </div>

        {screen === "wardrobe" && (
          <Wardrobe
            items={items}
            newItemId={newItemId}
            onAdd={() => setScreen("camera")}
            onGenerate={() => setScreen("loading")}
          />
        )}
        {screen === "camera" && (
          <CameraScreen
            onClose={() => setScreen("wardrobe")}
            onCaptured={() => {
              const id = `new-${Date.now()}`;
              setItems((prev) => [{ id, name: "Striped Shirt", tag: "Top", img: newshirt }, ...prev]);
              setNewItemId(id);
              setScreen("wardrobe");
              setTimeout(() => setNewItemId(null), 1500);
            }}
          />
        )}
        {screen === "loading" && <LoadingScreen onDone={() => setScreen("look")} />}
        {screen === "look" && <LookScreen onBack={() => setScreen("wardrobe")} />}
      </div>
    </div>
  );
}

function Wardrobe({ items, newItemId, onAdd, onGenerate }: { items: Garment[]; newItemId: string | null; onAdd: () => void; onGenerate: () => void }) {
  return (
    <div key="wardrobe" className="animate-screen-in h-full flex flex-col pt-10">
      <header className="px-6 pt-4 pb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Atelier</p>
        <h1 className="text-3xl font-semibold mt-1">My Wardrobe</h1>
        <p className="text-sm text-muted-foreground mt-1">{items.length} pieces · curated by you</p>
      </header>

      <div className="px-6 pb-3">
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-foreground text-background py-3.5 text-sm font-medium active:scale-[0.98] transition-transform hover:opacity-90"
        >
          <Camera className="w-4 h-4" />
          Add Garment
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32">
        <div className="grid grid-cols-2 gap-3">
          {items.map((g, i) => (
            <div
              key={g.id}
              className={`group relative aspect-[3/4] rounded-2xl bg-secondary overflow-hidden shadow-soft ${g.id === newItemId ? "animate-pop-in ring-2 ring-accent" : ""}`}
              style={{ animation: g.id !== newItemId ? `screen-in 0.5s ${i * 0.04}s both` : undefined }}
            >
              <img src={g.img} alt={g.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply" />
              <div className="absolute top-2 left-2 text-[10px] uppercase tracking-wider bg-background/80 backdrop-blur px-2 py-0.5 rounded-full">
                {g.tag}
              </div>
              {g.id === newItemId && (
                <div className="absolute top-2 right-2 bg-accent text-accent-foreground rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-background/95 to-transparent">
                <p className="text-xs font-medium">{g.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-5 pt-8 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={onGenerate}
          className="w-full flex items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold text-primary-foreground shadow-glow active:scale-[0.98] transition-transform"
          style={{ background: "var(--gradient-magic)" }}
        >
          <Sparkles className="w-4 h-4" />
          Generate Outfit
        </button>
      </div>
    </div>
  );
}

function CameraScreen({ onClose, onCaptured }: { onClose: () => void; onCaptured: () => void }) {
  const [phase, setPhase] = useState<"aim" | "flash" | "processing">("aim");

  const capture = () => {
    setPhase("flash");
    setTimeout(() => setPhase("processing"), 350);
    setTimeout(() => onCaptured(), 1400);
  };

  return (
    <div key="camera" className="animate-screen-in h-full bg-foreground text-background flex flex-col pt-10">
      <div className="flex items-center justify-between px-5 pb-3">
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
        <p className="text-xs uppercase tracking-[0.2em] opacity-70">Capture Garment</p>
        <div className="w-9" />
      </div>

      <div className="flex-1 mx-5 relative rounded-3xl overflow-hidden bg-neutral-900">
        {/* viewfinder background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={newshirt} alt="" className="w-3/4 object-contain opacity-90" />
        </div>

        {/* grid overlay */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border border-background/10" />
          ))}
        </div>

        {/* corner brackets */}
        {["top-4 left-4 border-l-2 border-t-2", "top-4 right-4 border-r-2 border-t-2", "bottom-4 left-4 border-l-2 border-b-2", "bottom-4 right-4 border-r-2 border-b-2"].map((c) => (
          <div key={c} className={`absolute ${c} w-8 h-8 border-accent rounded-sm`} />
        ))}

        {phase === "processing" && (
          <>
            <div className="absolute inset-x-0 top-0 h-1 bg-accent/70 animate-scan shadow-[0_0_20px_oklch(0.78_0.14_55)]" />
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-2 border-background/20 border-t-accent animate-spin-slow" />
                <Sparkles className="w-5 h-5 absolute inset-0 m-auto text-accent" />
              </div>
              <p className="text-sm font-medium">AI Removing Background…</p>
              <p className="text-xs opacity-60">Isolating garment edges</p>
            </div>
          </>
        )}

        {phase === "flash" && <div className="absolute inset-0 bg-background animate-shutter" />}
      </div>

      <div className="px-6 pt-5 pb-8">
        <p className="text-center text-xs opacity-60 mb-4">Center the garment within the frame</p>
        <div className="flex items-center justify-center gap-10">
          <div className="w-10 h-10 rounded-lg bg-background/10" />
          <button
            onClick={capture}
            disabled={phase !== "aim"}
            className="w-20 h-20 rounded-full border-4 border-background flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
          >
            <Circle className="w-14 h-14 fill-background text-background" />
          </button>
          <div className="w-10 h-10 rounded-lg bg-background/10" />
        </div>
        <p className="text-center text-xs mt-3 font-medium">Take Photo</p>
      </div>
    </div>
  );
}

function LoadingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div key="loading" className="animate-screen-in h-full flex flex-col items-center justify-center text-center px-8" style={{ background: "var(--gradient-magic)" }}>
      <div className="relative animate-float">
        <div className="w-32 h-32 rounded-full border-2 border-background/30 animate-spin-slow" />
        <div className="absolute inset-2 rounded-full border-2 border-dashed border-background/50 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "3s" }} />
        <Sparkles className="w-10 h-10 absolute inset-0 m-auto text-background" />
      </div>
      <h2 className="text-2xl font-semibold text-background mt-10">Dressing you up</h2>
      <p className="text-sm text-background/80 mt-3 max-w-xs">
        Connecting to <span className="font-mono">Hugging Face IDM-VTON</span>… Composing fabric, light and silhouette.
      </p>
      <div className="mt-8 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-background/80 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
}

function LookScreen({ onBack }: { onBack: () => void }) {
  return (
    <div key="look" className="animate-screen-in h-full flex flex-col pt-10 bg-secondary">
      <div className="flex items-center justify-between px-5 pb-2">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full bg-background shadow-soft active:scale-95 transition-transform">
          <ArrowLeft className="w-3.5 h-3.5" />
          Wardrobe
        </button>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">My Styled Look</p>
        <div className="w-[88px]" />
      </div>

      <div className="flex-1 relative overflow-hidden mx-4 mt-2 rounded-3xl bg-background shadow-soft">
        <img src={styledlook} alt="Your styled look" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-background/85 backdrop-blur px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3 text-accent" />
          <span className="text-[10px] font-medium uppercase tracking-wider">IDM-VTON</span>
        </div>

        {/* Assistant card */}
        <div className="absolute bottom-3 inset-x-3 rounded-2xl bg-background/95 backdrop-blur-xl p-4 shadow-soft border border-border" style={{ animation: "screen-in 0.6s 0.3s both" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-magic)" }}>
              <Sparkles className="w-3.5 h-3.5 text-background" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">AI Fashion Assistant</p>
              <p className="text-sm font-semibold">Why this works</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-foreground/80">
            The crisp striped shirt brings vertical structure, balanced by the relaxed mid-wash denim. A camel trench softens the palette and adds elongated lines, while clean white sneakers keep the whole look effortless — polished, but never trying.
          </p>
          <div className="flex gap-2 mt-3">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground font-medium">Smart Casual</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border font-medium">Spring</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border font-medium">94% match</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-foreground text-background py-3.5 text-sm font-medium active:scale-[0.98] transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Wardrobe
        </button>
      </div>
    </div>
  );
}
