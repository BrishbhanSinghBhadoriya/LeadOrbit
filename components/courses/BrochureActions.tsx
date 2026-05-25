"use client";

import { Button } from "@/components/ui/button";
import { FileText, Download, Share2, Check } from "lucide-react";
import { useState } from "react";

interface BrochureActionsProps {
  url: string;
  courseName: string;
}

export function BrochureActions({ url, courseName }: BrochureActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${courseName} Brochure`,
          text: `Check out the brochure for ${courseName}`,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Error copying to clipboard:", err);
      }
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${courseName.replace(/\s+/g, "_")}_Brochure.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex gap-2 w-full">
      <Button 
        variant="outline" 
        className="flex-1 rounded-xl border-slate-200 hover:bg-primary/5 hover:text-primary hover:border-primary/30 group/btn" 
        asChild
      >
        <a href={url} target="_blank" rel="noopener noreferrer">
          <FileText className="mr-2 h-4 w-4 text-primary group-hover/btn:animate-bounce" />
          View
        </a>
      </Button>

      <Button 
        variant="outline" 
        size="icon"
        onClick={handleDownload}
        className="rounded-xl border-slate-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
        title="Download Brochure"
      >
        <Download className="h-4 w-4" />
      </Button>

      <Button 
        variant="outline" 
        size="icon"
        onClick={handleShare}
        className="rounded-xl border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
        title="Share Brochure"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
