"use client";

import { useState, useEffect } from "react";
import { Check, Monitor, Image as ImageIcon, Type, RotateCcw, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Data ─────────────────────────────────────────────────────────────────────
const COLOR_THEMES = [
  { id: "minimal",  name: "Clean White",   dot: "bg-white border border-slate-300",  desc: "Pure white, minimal look" },
  { id: "ocean",    name: "Ocean Blue",    dot: "bg-blue-500",                        desc: "Cool blue tones" },
  { id: "sunset",   name: "Sunset Coral",  dot: "bg-orange-500",                      desc: "Warm coral & orange" },
  { id: "forest",   name: "Forest Green",  dot: "bg-emerald-600",                     desc: "Deep emerald green" },
  { id: "lavender", name: "Royal Lavender",dot: "bg-purple-500",                      desc: "Rich purple tones" },
  { id: "midnight", name: "Midnight Dark", dot: "bg-slate-900",                       desc: "Full dark mode" },
  { id: "rose",     name: "Rose Gold",     dot: "bg-rose-400",                        desc: "Soft rose & pink" },
  { id: "teal",     name: "Deep Teal",     dot: "bg-teal-600",                        desc: "Teal & cyan" },
];

const BG_THEMES = [
  // Gradients
  { id: "bg-none",      name: "None",           group: "Plain",     preview: "bg-slate-100",                                                              desc: "No background" },
  { id: "bg-gradient1", name: "Aurora",         group: "Gradient",  preview: "bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500",             desc: "Violet → Purple → Blue" },
  { id: "bg-gradient2", name: "Sunset",         group: "Gradient",  preview: "bg-gradient-to-br from-orange-400 via-rose-500 to-purple-600",             desc: "Pink → Rose → Gold" },
  { id: "bg-gradient3", name: "Ocean Depth",    group: "Gradient",  preview: "bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700",               desc: "Cyan → Navy" },
  { id: "bg-gradient4", name: "Forest Mist",    group: "Gradient",  preview: "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600",              desc: "Emerald → Teal" },
  { id: "bg-mesh1",     name: "Mesh Purple",    group: "Mesh",      preview: "bg-gradient-to-tr from-pink-300 via-purple-300 to-indigo-400",             desc: "Radial purple mesh" },
  { id: "bg-mesh2",     name: "Mesh Gold",      group: "Mesh",      preview: "bg-gradient-to-tr from-yellow-300 via-orange-300 to-rose-400",             desc: "Radial gold mesh" },
  { id: "bg-geo1",      name: "Dark Grid",      group: "Pattern",   preview: "bg-slate-800",                                                              desc: "Dark geometric grid" },
  { id: "bg-geo2",      name: "Light Dots",     group: "Pattern",   preview: "bg-slate-50",                                                               desc: "Subtle dot pattern" },
  { id: "bg-glass",     name: "Glass",          group: "Special",   preview: "bg-gradient-to-br from-white/40 via-blue-100/40 to-purple-100/40",         desc: "Frosted glass effect",  img: null },
  // Images — Unsplash thumbnails (small size for fast loading)
  { id: "bg-img-city",     name: "City Skyline",  group: "Image", preview: "bg-slate-700",  desc: "NYC night skyline",    img: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=70&auto=format&fit=crop" },
  { id: "bg-img-mountain", name: "Mountain Peak", group: "Image", preview: "bg-blue-900",   desc: "Alpine landscape",     img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70&auto=format&fit=crop" },
  { id: "bg-img-office",   name: "Modern Office", group: "Image", preview: "bg-slate-600",  desc: "Open workspace",       img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=70&auto=format&fit=crop" },
  { id: "bg-img-abstract", name: "Abstract Art",  group: "Image", preview: "bg-purple-800", desc: "Colorful abstract",    img: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=70&auto=format&fit=crop" },
  { id: "bg-img-nature",   name: "Forest",        group: "Image", preview: "bg-green-800",  desc: "Dense green forest",   img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70&auto=format&fit=crop" },
  { id: "bg-img-tech",     name: "Tech Circuit",  group: "Image", preview: "bg-indigo-900", desc: "Circuit board",        img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=70&auto=format&fit=crop" },
  { id: "bg-img-ocean",    name: "Ocean Waves",   group: "Image", preview: "bg-blue-700",   desc: "Aerial ocean view",    img: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70&auto=format&fit=crop" },
  { id: "bg-img-space",    name: "Deep Space",    group: "Image", preview: "bg-slate-950",  desc: "Galaxy & stars",       img: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=70&auto=format&fit=crop" },
  { id: "bg-img-minimal",  name: "Architecture",  group: "Image", preview: "bg-gray-100",   desc: "Minimal lines",        img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=70&auto=format&fit=crop" },
  { id: "bg-img-dark",     name: "Dark Luxury",   group: "Image", preview: "bg-zinc-900",   desc: "Dark marble",          img: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=70&auto=format&fit=crop" },
];

const TEXT_COLORS = [
  { id: "txt-default",  name: "Auto",         hex: null,      desc: "Follows color theme" },
  { id: "txt-black",    name: "Pure Black",   hex: "#0a0a0a", desc: "Maximum contrast" },
  { id: "txt-charcoal", name: "Charcoal",     hex: "#1e293b", desc: "Soft dark" },
  { id: "txt-navy",     name: "Deep Navy",    hex: "#0f172a", desc: "Dark blue-black" },
  { id: "txt-blue",     name: "Royal Blue",   hex: "#1d4ed8", desc: "Vibrant blue" },
  { id: "txt-indigo",   name: "Indigo",       hex: "#4338ca", desc: "Deep indigo" },
  { id: "txt-purple",   name: "Deep Purple",  hex: "#6d28d9", desc: "Rich violet" },
  { id: "txt-teal",     name: "Teal",         hex: "#0f766e", desc: "Cool teal" },
  { id: "txt-green",    name: "Forest Green", hex: "#15803d", desc: "Natural green" },
  { id: "txt-brown",    name: "Warm Brown",   hex: "#78350f", desc: "Earthy tone" },
  { id: "txt-rose",     name: "Deep Rose",    hex: "#9f1239", desc: "Bold rose" },
  { id: "txt-white",    name: "White",        hex: "#f1f5f9", desc: "For dark backgrounds" },
  { id: "txt-silver",   name: "Silver",       hex: "#94a3b8", desc: "Muted silver" },
  { id: "txt-gold",     name: "Gold",         hex: "#b45309", desc: "Warm gold" },
  { id: "txt-custom",   name: "Custom",       hex: null,      desc: "Pick any color" },
];

const BG_GROUPS = ["Plain", "Gradient", "Mesh", "Pattern", "Special", "Image"];

// ── Helper ────────────────────────────────────────────────────────────────────
function applyAll(color: string, bg: string, txt: string, custom: string) {
  const root = document.documentElement;
  root.setAttribute("data-theme", color);
  root.setAttribute("data-bg", bg);
  root.setAttribute("data-txt", txt);
  const preset = TEXT_COLORS.find((t) => t.id === txt);
  if (txt === "txt-custom") {
    root.style.setProperty("--user-text", custom);
  } else if (preset?.hex) {
    root.style.setProperty("--user-text", preset.hex);
  } else {
    root.style.removeProperty("--user-text");
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ThemeSettings() {
  const [colorTheme, setColorTheme] = useState("minimal");
  const [bgTheme,    setBgTheme]    = useState("bg-none");
  const [textColor,  setTextColor]  = useState("txt-default");
  const [customTxt,  setCustomTxt]  = useState("#1e293b");
  const [saved,      setSaved]      = useState(false);
  const [bgGroup,    setBgGroup]    = useState("Plain");

  useEffect(() => {
    setColorTheme(localStorage.getItem("crm-theme")      || "minimal");
    setBgTheme(   localStorage.getItem("crm-bg-theme")   || "bg-none");
    setTextColor( localStorage.getItem("crm-txt-color")  || "txt-default");
    setCustomTxt( localStorage.getItem("crm-txt-custom") || "#1e293b");
  }, []);

  function apply(c = colorTheme, b = bgTheme, t = textColor, ct = customTxt) {
    applyAll(c, b, t, ct);
    setSaved(false);
  }

  function save() {
    localStorage.setItem("crm-theme",      colorTheme);
    localStorage.setItem("crm-bg-theme",   bgTheme);
    localStorage.setItem("crm-txt-color",  textColor);
    localStorage.setItem("crm-txt-custom", customTxt);
    applyAll(colorTheme, bgTheme, textColor, customTxt);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function reset() {
    setColorTheme("minimal"); setBgTheme("bg-none"); setTextColor("txt-default"); setCustomTxt("#1e293b");
    apply("minimal", "bg-none", "txt-default", "#1e293b");
    localStorage.removeItem("crm-theme");
    localStorage.removeItem("crm-bg-theme");
    localStorage.removeItem("crm-txt-color");
    localStorage.removeItem("crm-txt-custom");
  }

  const filteredBg = BG_THEMES.filter((b) => b.group === bgGroup);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Section 1: Color Theme ── */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <Monitor className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-bold text-slate-900">Color Theme</p>
            <p className="text-[11px] text-slate-400">Overall color palette of the app</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COLOR_THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => { setColorTheme(t.id); apply(t.id, bgTheme, textColor, customTxt); }}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                colorTheme === t.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className={`h-8 w-8 rounded-full ${t.dot}`} />
              <div className="text-center">
                <p className={`text-xs font-semibold leading-tight ${colorTheme === t.id ? "text-primary" : "text-slate-700"}`}>
                  {t.name}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t.desc}</p>
              </div>
              {colorTheme === t.id && (
                <span className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 2: Background Style ── */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <ImageIcon className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-bold text-slate-900">Background Style</p>
            <p className="text-[11px] text-slate-400">Full-screen background behind the app</p>
          </div>
        </div>

        {/* Group tabs */}
        <div className="flex gap-1 px-5 pt-4 flex-wrap">
          {BG_GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setBgGroup(g)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                bgGroup === g ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredBg.map((t: any) => (
            <button
              key={t.id}
              onClick={() => { setBgTheme(t.id); apply(colorTheme, t.id, textColor, customTxt); }}
              className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                bgTheme === t.id
                  ? "border-primary shadow-md"
                  : "border-slate-100 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-full h-16 rounded-lg overflow-hidden">
                {t.img ? (
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className={`block w-full h-full ${t.preview}`} />
                )}
                {bgTheme === t.id && (
                  <div className="absolute inset-0 bg-primary/25 flex items-center justify-center">
                    <span className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </span>
                  </div>
                )}
              </div>
              <div className="text-center w-full px-1">
                <p className={`text-xs font-semibold leading-tight truncate ${bgTheme === t.id ? "text-primary" : "text-slate-700"}`}>
                  {t.name}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 3: Text Color ── */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <Type className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-bold text-slate-900">Text Color</p>
            <p className="text-[11px] text-slate-400">Override text color across the entire app</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {TEXT_COLORS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTextColor(t.id); apply(colorTheme, bgTheme, t.id, customTxt); }}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                textColor === t.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span
                className={`h-8 w-8 rounded-full border border-slate-200 ${!t.hex ? "bg-gradient-to-br from-slate-300 to-slate-500" : ""}`}
                style={t.hex ? { backgroundColor: t.hex } : undefined}
              />
              <div className="text-center">
                <p className={`text-xs font-semibold leading-tight ${textColor === t.id ? "text-primary" : "text-slate-700"}`}>
                  {t.name}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t.desc}</p>
              </div>
              {textColor === t.id && (
                <span className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Custom color picker */}
        {textColor === "txt-custom" && (
          <div className="mx-5 mb-5 p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <p className="text-xs font-bold text-slate-700 mb-0.5">Custom Text Color</p>
              <p className="text-[11px] text-slate-400">Pick any color from the palette</p>
            </div>
            <div className="flex items-center gap-3 flex-1">
              <input
                type="color"
                value={customTxt}
                onChange={(e) => {
                  setCustomTxt(e.target.value);
                  apply(colorTheme, bgTheme, "txt-custom", e.target.value);
                }}
                className="h-10 w-20 rounded-lg border border-slate-200 cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={customTxt}
                  onChange={(e) => {
                    if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) {
                      setCustomTxt(e.target.value);
                      if (e.target.value.length === 7) apply(colorTheme, bgTheme, "txt-custom", e.target.value);
                    }
                  }}
                  placeholder="#1e293b"
                  className="w-full h-9 px-3 text-sm font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {/* Live preview */}
              <div className="shrink-0 px-3 py-1.5 rounded-lg border border-slate-200 bg-white">
                <p className="text-xs font-bold" style={{ color: customTxt }}>Preview Text</p>
                <p className="text-[10px]" style={{ color: customTxt, opacity: 0.6 }}>Sample body</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Live Preview Strip ── */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <Palette className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold text-slate-900">Live Preview</p>
        </div>
        <div className="p-5 flex flex-wrap gap-3 items-center">
          <div className="flex flex-col gap-1">
            <p className="text-slate-900 text-sm font-bold">Heading Text</p>
            <p className="text-slate-700 text-xs font-medium">Body text sample</p>
            <p className="text-slate-500 text-xs">Muted / secondary text</p>
            <p className="text-slate-400 text-[11px]">Placeholder / hint text</p>
          </div>
          <div className="flex flex-col gap-1.5 ml-6">
            <div className="h-8 w-32 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-xs font-semibold text-white">Primary Button</span>
            </div>
            <div className="h-8 w-32 rounded-lg border border-slate-200 bg-white flex items-center justify-center">
              <span className="text-xs font-semibold text-slate-700">Outline Button</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 ml-6">
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Card Label</p>
              <p className="text-lg font-bold text-slate-900">42</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          className="h-8 rounded-lg text-xs font-semibold gap-1.5 text-slate-600"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to Default
        </Button>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Saved!
            </span>
          )}
          <Button
            size="sm"
            onClick={save}
            className="h-8 rounded-lg text-xs font-semibold px-5"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
