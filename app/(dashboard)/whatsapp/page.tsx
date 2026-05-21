"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, QrCode, Send, Link2 } from "lucide-react";
import Link from "next/link";

export default function WhatsAppPage() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const openChat = () => {
    const clean = phone.replace(/\D/g, "");
    const text = encodeURIComponent(message);
    window.open(`https://wa.me/${clean}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-emerald-600" />
          WhatsApp CRM
        </h1>
        <p className="text-slate-500 mt-1">Connect WhatsApp & message leads from CRM</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-5 w-5 text-emerald-600" />
              Session Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square max-w-[200px] mx-auto bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200">
              <p className="text-xs text-slate-400 text-center px-4">QR scan — connect WhatsApp Business API in Settings</p>
            </div>
            <Button variant="outline" className="w-full rounded-xl" asChild>
              <Link href="/settings">Configure WABA Token</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-base">Quick Send</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Phone with country code (91...)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <textarea
              className="w-full min-h-[120px] border rounded-xl p-3 text-sm"
              placeholder="Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={openChat} className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700">
                <Send className="h-4 w-4 mr-2" />
                Open WhatsApp
              </Button>
              <Button variant="outline" asChild className="rounded-xl">
                <Link href="/templates">
                  <Link2 className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="text-xs text-slate-500">Use templates with variables like {"{{student_name}}"} from Templates page.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
