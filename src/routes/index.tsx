import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Sparkles,
  ArrowLeft,
  Check,
  MoreVertical,
  Pencil,
  Trash2,
  Upload,
  User,
} from "lucide-react";

import tshirt from "@/assets/tshirt.jpg";
import jeans from "@/assets/jeans.jpg";
import coat from "@/assets/coat.jpg";
import sneakers from "@/assets/sneakers.jpg";
import sweater from "@/assets/sweater.jpg";
import belt from "@/assets/belt.jpg";
import styledlook from "@/assets/styledlook.jpg";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atelier — AI Personal Styling" },
      { name: "description", content: "Your AI-powered wardrobe and virtual try-on stylist." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
  }),
  component: App,
});

type Screen = "onboarding" | "wardrobe" | "loading" | "look";
type Category = "Top" | "Bottom" | "Outer" | "Shoes" | "Accessory";
type Garment = {
  id: string;
  name: string;
  tag: Category;
  img: string;
  selected?: boolean;
};

const CATEGORIES: Category[] = ["Top", "Bottom", "Outer", "Shoes", "Accessory"];

const STARTER: Garment[] = [
  { id: "s1", name: "Cotton Tee", tag: "Top", img: tshirt },
  { id: "s2", name: "Slim Jeans", tag: "Bottom", img: jeans },
  { id: "s3", name: "Trench Coat", tag: "Outer", img: coat },
  { id: "s4", name: "White Sneakers", tag: "Shoes", img: sneakers },
  { id: "s5", name: "Cable Knit", tag: "Top", img: sweater },
  { id: "s6", name: "Leather Belt", tag: "Accessory", img: belt },
];

const LS_USER = "atelier.userPhoto";
const LS_WARDROBE = "atelier.wardrobe";

function App() {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [items, setItems] = useState<Garment[]>([]);
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [newItemId, setNewItemId] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const photo = localStorage.getItem(LS_USER);
      const wardrobeRaw = localStorage.getItem(LS_WARDROBE);
      if (photo) {
        setUserPhoto(photo);
        setScreen("wardrobe");
      }
      setItems(wardrobeRaw ? (JSON.parse(wardrobeRaw) as Garment[]) : STARTER);
    } catch {
      setItems(STARTER);
    }
    setBootstrapped(true);
  }, []);

  // Persist wardrobe
  useEffect(() => {
    if (!bootstrapped) return;
    try {
      localStorage.setItem(LS_WARDROBE, JSON.stringify(items));
    } catch {
      /* quota */
    }
  }, [items, bootstrapped]);

  const completeOnboarding = (photo: string) => {
    setUserPhoto(photo);
    try {
      localStorage.setItem(LS_USER, photo);
    } catch {
      /* quota — photo too big; keep in memory */
    }
    setScreen("wardrobe");
  };

  const addGarment = (img: string) => {
    const id = `g-${Date.now()}`;
    setItems((prev) => [{ id, name: "New Garment", tag: "Top", img, selected: true }, ...prev]);
    setNewItemId(id);
    setTimeout(() => setNewItemId(null), 1600);
  };

  const updateGarment = (id: string, patch: Partial<Garment>) =>
    setItems((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const removeGarment = (id: string) =>
    setItems((prev) => prev.filter((g) => g.id !== id));

  const toggleSelect = (id: string) =>
    setItems((prev) => prev.map((g) => (g.id === id ? { ...g, selected: !g.selected } : g)));

  if (!bootstrapped) {
    return <div className="min-h-[100svh] bg-background" />;
  }

  return (
    <div className="min-h-[100svh] w-full bg-background text-foreground antialiased">
      {screen === "onboarding" && <Onboarding onDone={completeOnboarding} />}
      {screen === "wardrobe" && userPhoto && (
        <Wardrobe
          items={items}
          newItemId={newItemId}
          userPhoto={userPhoto}
          onAdd={addGarment}
          onUpdate={updateGarment}
          onRemove={removeGarment}
          onToggleSelect={toggleSelect}
          onGenerate={() => setScreen("loading")}
          onResetUser={() => {
            localStorage.removeItem(LS_USER);
            setUserPhoto(null);
            setScreen("onboarding");
          }}
        />
      )}
      {screen === "loading" && (
        <LoadingScreen onDone={() => setScreen("look")} />
      )}
      {screen === "look" && userPhoto && (
        <LookScreen
          userPhoto={userPhoto}
          selected={items.filter((g) => g.selected)}
          onBack={() => setScreen("wardrobe")}
        />
      )}
    </div>
  );
}

/* ------------------------------- ONBOARDING ------------------------------- */

function Onboarding({ onDone }: { onDone: (photo: string) => void }) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = (f?: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(String(e.target?.result ?? ""));
    reader.readAsDataURL(f);
  };

  const confirm = () => {
    if (!preview) return;
    setBusy(true);
    setTimeout(() => onDone(preview), 600);
  };

  return (
    <div
      className="min-h-[100svh] w-full flex flex-col px-6 pt-[max(env(safe-area-inset-top),2rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)] animate-screen-in"
      style={{ background: "var(--gradient-warm)" }}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto w-full">
        <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center mb-6 shadow-[var(--shadow-soft)]">
          <Sparkles className="w-7 h-7" />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-foreground/60">Welcome to Atelier</p>
        <h1 className="text-3xl sm:text-4xl font-semibold mt-3">Let's see you</h1>
        <p className="text-sm sm:text-base text-foreground/70 mt-3 max-w-sm">
          Add a full-body photo of yourself in good lighting. We'll use it to render outfits on
          your real silhouette.
        </p>

        <div className="mt-8 w-full">
          <div className="relative mx-auto w-56 h-72 rounded-3xl overflow-hidden bg-background/60 backdrop-blur border border-foreground/10 shadow-[var(--shadow-soft)] flex items-center justify-center">
            {preview ? (
              <img src={preview} alt="You" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-foreground/40 gap-2">
                <User className="w-12 h-12" />
                <span className="text-xs">No photo yet</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 w-full flex flex-col gap-3">
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            onClick={() => cameraRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-foreground text-background py-4 text-sm font-medium active:scale-[0.98] transition-transform"
          >
            <Camera className="w-4 h-4" /> Take Full-Body Photo
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-background/80 backdrop-blur text-foreground py-4 text-sm font-medium border border-foreground/10 active:scale-[0.98] transition-transform"
          >
            <Upload className="w-4 h-4" /> Upload from Gallery
          </button>
          {preview && (
            <button
              onClick={confirm}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] active:scale-[0.98] transition-transform disabled:opacity-70"
              style={{ background: "var(--gradient-magic)" }}
            >
              {busy ? "Saving…" : "Continue"} <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-[11px] text-foreground/50 mt-5 max-w-xs">
          Your photo is stored locally on this device. You can replace it anytime from the wardrobe.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------- WARDROBE -------------------------------- */

function Wardrobe({
  items,
  newItemId,
  userPhoto,
  onAdd,
  onUpdate,
  onRemove,
  onToggleSelect,
  onGenerate,
  onResetUser,
}: {
  items: Garment[];
  newItemId: string | null;
  userPhoto: string;
  onAdd: (img: string) => void;
  onUpdate: (id: string, patch: Partial<Garment>) => void;
  onRemove: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onGenerate: () => void;
  onResetUser: () => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [editing, setEditing] = useState<Garment | null>(null);

  const selectedCount = items.filter((g) => g.selected).length;

  const handleGarmentFile = async (f?: File | null) => {
    if (!f) return;
    setProcessing(true);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(f, { output: { format: "image/png" } });
      const img: string = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result ?? ""));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(blob);
      });
      onAdd(img);
    } catch (err) {
      console.error("Background removal failed", err);
      // fallback: use original image
      const img: string = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result ?? ""));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(f);
      });
      onAdd(img);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="animate-screen-in min-h-[100svh] flex flex-col pt-[max(env(safe-area-inset-top),1rem)]">
      <header className="px-5 sm:px-6 pt-3 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Atelier</p>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-1 truncate">My Wardrobe</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {items.length} pieces · {selectedCount} selected
          </p>
        </div>
        <button
          onClick={onResetUser}
          className="shrink-0 w-11 h-11 rounded-full overflow-hidden border border-border bg-secondary"
          aria-label="Change photo"
        >
          <img src={userPhoto} alt="You" className="w-full h-full object-cover" />
        </button>
      </header>

      <div className="px-5 sm:px-6 pb-3">
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            handleGarmentFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => cameraRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-foreground text-background py-3.5 text-sm font-medium active:scale-[0.98] transition-transform"
        >
          <Camera className="w-4 h-4" /> Add Garment
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-5 pb-40">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((g, i) => (
            <GarmentCard
              key={g.id}
              g={g}
              isNew={g.id === newItemId}
              index={i}
              onToggleSelect={() => onToggleSelect(g.id)}
              onEdit={() => setEditing(g)}
              onDelete={() => onRemove(g.id)}
            />
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 px-5 sm:px-6 pt-8 pb-[max(env(safe-area-inset-bottom),1.25rem)] bg-gradient-to-t from-background via-background/95 to-transparent">
        <button
          onClick={onGenerate}
          disabled={selectedCount === 0}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:shadow-none"
          style={{ background: "var(--gradient-magic)" }}
        >
          <Sparkles className="w-4 h-4" />
          {selectedCount === 0
            ? "Select pieces to generate"
            : `Generate Outfit (${selectedCount})`}
        </button>
      </div>

      {/* BG removal overlay */}
      {processing && <BGRemovalOverlay />}

      {editing && (
        <EditDialog
          garment={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            onUpdate(editing.id, patch);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function GarmentCard({
  g,
  isNew,
  index,
  onToggleSelect,
  onEdit,
  onDelete,
}: {
  g: Garment;
  isNew: boolean;
  index: number;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group relative aspect-[3/4] rounded-2xl bg-secondary overflow-hidden shadow-[var(--shadow-soft)] cursor-pointer ${
        isNew ? "animate-pop-in ring-2 ring-accent" : ""
      } ${g.selected ? "ring-2 ring-foreground" : ""}`}
      style={{ animation: !isNew ? `screen-in 0.5s ${index * 0.03}s both` : undefined }}
      onClick={onToggleSelect}
    >
      <img
        src={g.img}
        alt={g.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
      />
      <div className="absolute top-2 left-2 text-[10px] uppercase tracking-wider bg-background/85 backdrop-blur px-2 py-0.5 rounded-full">
        {g.tag}
      </div>

      <div className="absolute top-1 right-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-full bg-background/85 backdrop-blur flex items-center justify-center active:scale-95"
              aria-label="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="w-4 h-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {g.selected && (
        <div className="absolute top-10 right-2 bg-foreground text-background rounded-full p-1">
          <Check className="w-3 h-3" />
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-background/95 to-transparent">
        <p className="text-xs font-medium truncate">{g.name}</p>
      </div>
    </div>
  );
}

function EditDialog({
  garment,
  onClose,
  onSave,
}: {
  garment: Garment;
  onClose: () => void;
  onSave: (patch: Partial<Garment>) => void;
}) {
  const [name, setName] = useState(garment.name);
  const [tag, setTag] = useState<Category>(garment.tag);

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-background rounded-3xl p-5 shadow-[var(--shadow-soft)] animate-screen-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Edit garment</h2>
        <p className="text-xs text-muted-foreground mt-1">Rename or recategorize this piece.</p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs text-muted-foreground">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="e.g. Linen Shirt"
            />
          </label>
          <div>
            <span className="text-xs text-muted-foreground">Category</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setTag(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    tag === c
                      ? "bg-foreground text-background border-foreground"
                      : "bg-secondary border-border"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-full py-3 text-sm font-medium bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ name: name.trim() || garment.name, tag })}
            className="flex-1 rounded-full py-3 text-sm font-semibold bg-foreground text-background"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function BGRemovalOverlay() {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-background animate-screen-in">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-background/20 border-t-accent animate-spin-slow" />
        <Sparkles className="w-6 h-6 absolute inset-0 m-auto text-accent" />
      </div>
      <p className="text-sm font-medium">AI Removing Background…</p>
      <p className="text-xs opacity-70">Isolating garment edges</p>
    </div>
  );
}

/* --------------------------------- LOADING -------------------------------- */

function LoadingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="min-h-[100svh] w-full flex flex-col items-center justify-center text-center px-8 animate-screen-in"
      style={{ background: "var(--gradient-magic)" }}
    >
      <div className="relative animate-float">
        <div className="w-32 h-32 rounded-full border-2 border-background/30 animate-spin-slow" />
        <div
          className="absolute inset-2 rounded-full border-2 border-dashed border-background/50 animate-spin-slow"
          style={{ animationDirection: "reverse", animationDuration: "3s" }}
        />
        <Sparkles className="w-10 h-10 absolute inset-0 m-auto text-background" />
      </div>
      <h2 className="text-2xl font-semibold text-background mt-10">Dressing you up</h2>
      <p className="text-sm text-background/85 mt-3 max-w-xs">
        Processing <span className="font-mono">Hugging Face IDM-VTON</span> model… Composing fabric,
        light and silhouette on your body.
      </p>
      <div className="mt-8 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-background/80 animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- LOOK ---------------------------------- */

function LookScreen({
  userPhoto,
  selected,
  onBack,
}: {
  userPhoto: string;
  selected: Garment[];
  onBack: () => void;
}) {
  const tags = selected.map((s) => s.tag);
  const has = (c: Category) => tags.includes(c);

  // Build a stylist note from picks
  const note = (() => {
    const bits: string[] = [];
    const top = selected.find((s) => s.tag === "Top");
    const bot = selected.find((s) => s.tag === "Bottom");
    const out = selected.find((s) => s.tag === "Outer");
    const sh = selected.find((s) => s.tag === "Shoes");
    if (top) bits.push(`The ${top.name.toLowerCase()} gives the look its anchor`);
    if (bot) bits.push(`balanced by the structure of the ${bot.name.toLowerCase()}`);
    if (out) bits.push(`while the ${out.name.toLowerCase()} adds elongated lines and warmth`);
    if (sh) bits.push(`finished with ${sh.name.toLowerCase()} for an effortless step`);
    return bits.length
      ? bits.join(", ") + "."
      : "A clean foundation — try adding a top, bottom and shoes for a complete look.";
  })();

  return (
    <div className="animate-screen-in min-h-[100svh] flex flex-col bg-secondary pt-[max(env(safe-area-inset-top),1rem)]">
      <div className="flex items-center justify-between px-4 sm:px-5 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full bg-background shadow-[var(--shadow-soft)] active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Wardrobe
        </button>
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          My Styled Look
        </p>
        <div className="w-[88px]" />
      </div>

      <div className="flex-1 relative overflow-hidden mx-3 sm:mx-4 mt-2 rounded-3xl bg-background shadow-[var(--shadow-soft)]">
        {/* User body */}
        <img
          src={userPhoto}
          alt="You"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Garment overlays — positioned roughly by category */}
        <GarmentLayer selected={selected} />

        {/* Fallback hero if absolutely nothing selected */}
        {selected.length === 0 && (
          <img
            src={styledlook}
            alt="Styled"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
        )}

        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-background/85 backdrop-blur px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3 text-accent" />
          <span className="text-[10px] font-medium uppercase tracking-wider">IDM-VTON</span>
        </div>

        {/* Stylist card */}
        <div
          className="absolute bottom-3 inset-x-3 rounded-2xl bg-background/95 backdrop-blur-xl p-4 shadow-[var(--shadow-soft)] border border-border"
          style={{ animation: "screen-in 0.6s 0.3s both" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--gradient-magic)" }}
            >
              <Sparkles className="w-3.5 h-3.5 text-background" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                AI Fashion Assistant
              </p>
              <p className="text-sm font-semibold truncate">Why this works</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-foreground/80">{note}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {has("Outer") && (
              <Chip className="bg-accent/20">Layered</Chip>
            )}
            {has("Top") && has("Bottom") && <Chip>Smart Casual</Chip>}
            <Chip>{selected.length} pieces</Chip>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
        <button
          onClick={onBack}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-2 rounded-full bg-foreground text-background py-3.5 text-sm font-medium active:scale-[0.98] transition-transform"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Wardrobe
        </button>
      </div>
    </div>
  );
}

function Chip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border font-medium ${className}`}
    >
      {children}
    </span>
  );
}

/* Overlay garments roughly on the body silhouette */
function GarmentLayer({ selected }: { selected: Garment[] }) {
  // map category -> layout box (percentages of container)
  const layoutFor = (tag: Category): React.CSSProperties => {
    switch (tag) {
      case "Outer":
        return { top: "18%", left: "8%", width: "84%", height: "46%", zIndex: 3 };
      case "Top":
        return { top: "22%", left: "20%", width: "60%", height: "32%", zIndex: 2 };
      case "Bottom":
        return { top: "52%", left: "24%", width: "52%", height: "34%", zIndex: 2 };
      case "Shoes":
        return { top: "84%", left: "26%", width: "48%", height: "12%", zIndex: 4 };
      case "Accessory":
        return { top: "46%", left: "30%", width: "40%", height: "10%", zIndex: 5 };
    }
  };

  // Sort so outer renders behind top
  const order: Record<Category, number> = {
    Outer: 0,
    Top: 1,
    Bottom: 1,
    Accessory: 2,
    Shoes: 2,
  };
  const sorted = [...selected].sort((a, b) => order[a.tag] - order[b.tag]);

  return (
    <>
      {sorted.map((g) => (
        <img
          key={g.id}
          src={g.img}
          alt={g.name}
          className="absolute object-contain mix-blend-multiply pointer-events-none drop-shadow-xl"
          style={{ ...layoutFor(g.tag), animation: "pop-in 0.6s both" }}
        />
      ))}
    </>
  );
}
