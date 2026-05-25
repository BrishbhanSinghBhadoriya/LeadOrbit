"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send, ExternalLink, Phone, Copy, Check,
  Smartphone, MessageSquare, Users, Link2,
  ChevronRight, Info,
} from "lucide-react";
import Link from "next/link";

// ── WhatsApp SVG Icon ─────────────────────────────────────────────────────────
function WhatsAppIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ── Quick message templates ───────────────────────────────────────────────────
const QUICK_TEMPLATES = [
  { label: "Follow-up",    text: "Hi! I'm following up regarding your enquiry about our courses. Are you still interested?" },
  { label: "Callback",     text: "Hi! We tried reaching you. Please call us back at your convenience or reply here." },
  { label: "Admission",    text: "Hi! Your admission process is pending. Please contact us to complete the formalities." },
  { label: "Fee Reminder", text: "Hi! This is a reminder that your fee payment is due. Please contact us for details." },
  { label: "Welcome",      text: "Welcome to Unifost Edu! We're excited to help you with your educational journey. 🎓" },
  { label: "Documents",    text: "Hi! We need your documents to proceed with the admission. Please share them at the earliest." },
];

export default function WhatsAppPage() {
  const [phone,   setPhone]   = useState("");
  const [message, setMessage] = useState("");
  const [copied,  setCopied]  = useState(false);
  const [sent,    setSent]    = useState(false);
  const [bulkNumbers, setBulkNumbers] = useState("");
  const [bulkMsg,     setBulkMsg]     = useState("");
  const [bulkTab,     setBulkTab]     = useState<"single" | "bulk">("single");

  // Format phone — add country code if missing
  const formatPhone = (p: string) => {
    const digits = p.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) return digits;
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const openWhatsApp = (num: string, msg: string) => {
    const clean = formatPhone(num);
    const text  = encodeURIComponent(msg);
    window.open(`https://wa.me/${clean}?text=${text}`, "_blank");
  };

  const handleSend = () => {
    if (!phone.trim()) return;
    openWhatsApp(phone, message);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const handleBulkSend = () => {
    const numbers = bulkNumbers
      .split(/[\n,;]+/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (!numbers.length || !bulkMsg.trim()) return;
    // Open first — browser may block multiple popups
    numbers.forEach((num, i) => {
      setTimeout(() => openWhatsApp(num, bulkMsg), i * 800);
    });
  };

  const copyLink = () => {
    const clean = formatPhone(phone);
    const text  = encodeURIComponent(message);
    navigator.clipboard.writeText(`https://wa.me/${clean}?text=${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyTemplate = (text: string) => setMessage(text);

  return (
    <div className="flex flex-col gap-5 pb-8 pl-10 md:pl-0 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
          <WhatsAppIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">WhatsApp Messaging</h1>
          <p className="text-xs text-slate-400 mt-0.5">Send messages directly to leads via WhatsApp Web</p>
        </div>
      </div>

      {/* ── How it works banner ── */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-800 leading-relaxed">
          <span className="font-bold">How it works:</span> Enter a phone number and message → Click Send → WhatsApp Web opens in a new tab with the message pre-filled → Just press Send in WhatsApp. No API key needed — works with your personal or business WhatsApp.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left: Send Message ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            {(["single", "bulk"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setBulkTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  bulkTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "single" ? "Single Message" : "Bulk Send"}
              </button>
            ))}
          </div>

          {bulkTab === "single" ? (
            <div className="rounded-xl border border-slate-100 bg-white shadow-sm p-5 flex flex-col gap-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                Send Message
              </h2>

              {/* Phone input */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 h-9 rounded-lg border border-slate-200 bg-slate-50 shrink-0">
                    <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs font-semibold text-slate-600">+91</span>
                  </div>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-9 text-sm border-slate-200 rounded-lg flex-1"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Enter 10-digit number. Country code added automatically.</p>
              </div>

              {/* Message */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none transition-all"
                />
                <p className="text-[10px] text-slate-400 mt-1">{message.length} characters</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSend}
                  disabled={!phone.trim()}
                  className="flex-1 h-9 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white border-0 gap-1.5"
                >
                  {sent ? (
                    <><Check className="h-3.5 w-3.5" /> Opened!</>
                  ) : (
                    <><WhatsAppIcon className="h-3.5 w-3.5" /> Send via WhatsApp</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyLink}
                  disabled={!phone.trim()}
                  className="h-9 px-3 rounded-lg border-slate-200 text-xs font-semibold gap-1.5"
                  title="Copy WhatsApp link"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-100 bg-white shadow-sm p-5 flex flex-col gap-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-500" />
                Bulk Send
              </h2>
              <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                ⚠️ Browser may block multiple popups. Allow popups for this site. Each number opens a new WhatsApp tab.
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                  Phone Numbers (one per line or comma separated)
                </label>
                <textarea
                  rows={4}
                  placeholder={"9876543210\n9123456789\n9000000001"}
                  value={bulkNumbers}
                  onChange={(e) => setBulkNumbers(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Type your bulk message..."
                  value={bulkMsg}
                  onChange={(e) => setBulkMsg(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>
              <Button
                onClick={handleBulkSend}
                disabled={!bulkNumbers.trim() || !bulkMsg.trim()}
                className="h-9 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white border-0 gap-1.5"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                Send to All Numbers
              </Button>
            </div>
          )}

          {/* Quick Templates */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-slate-400" />
              Quick Templates
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => applyTemplate(t.text)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50 transition-all text-left group"
                >
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700">{t.label}</span>
                  <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-emerald-500 shrink-0" />
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-3">Click a template to use it in the message box above.</p>
          </div>
        </div>

        {/* ── Right: Connect & Info ── */}
        <div className="flex flex-col gap-4">

          {/* WhatsApp Web Connect */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-sm p-5 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-emerald-500" />
              Connect WhatsApp
            </h2>

            {/* QR placeholder — links to WhatsApp Web */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-40 w-40 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-400 transition-all"
                onClick={() => window.open("https://web.whatsapp.com", "_blank")}
              >
                <WhatsAppIcon className="h-10 w-10 text-emerald-500" />
                <p className="text-[10px] font-bold text-emerald-600 text-center px-2">Click to open WhatsApp Web</p>
              </div>
              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Open WhatsApp Web, scan QR with your phone, then come back here to send messages.
              </p>
            </div>

            <Button
              onClick={() => window.open("https://web.whatsapp.com", "_blank")}
              className="w-full h-9 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white border-0 gap-1.5"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              Open WhatsApp Web
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
          </div>

          {/* Stats / Info */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-sm p-5 flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900">Quick Actions</h2>
            <Link
              href="/templates"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-primary">Message Templates</p>
                  <p className="text-[10px] text-slate-400">Manage reusable templates</p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary" />
            </Link>
            <Link
              href="/leads"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Phone className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-primary">Message from Leads</p>
                  <p className="text-[10px] text-slate-400">Click phone icon on any lead</p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary" />
            </Link>
          </div>

          {/* How to use */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-bold text-emerald-800 mb-2">Steps to send:</p>
            <ol className="text-[11px] text-emerald-700 space-y-1.5 list-none">
              {[
                "Enter phone number (10 digits)",
                "Type or select a template",
                "Click 'Send via WhatsApp'",
                "WhatsApp Web opens with message",
                "Press Send in WhatsApp ✓",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-4 w-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
