"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import { importLeadsAction } from "@/actions/leads";

export function LeadImport({ pipelineId }: { pipelineId?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; error: number; duplicates: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      console.log("File selected:", selectedFile.name);
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error("Could not read file data");
          
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          if (jsonData.length === 0) {
            alert("The selected file is empty or invalid.");
            setLoading(false);
            return;
          }

          // Force to plain objects to avoid serialization errors with Server Actions
          const plainData = JSON.parse(JSON.stringify(jsonData));

          const res = await importLeadsAction(plainData, pipelineId);
          setResult(res);
        } catch (err: any) {
          console.error("Error processing file data:", err);
          alert(`Failed to process file: ${err.message}`);
        } finally {
          setLoading(false);
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.onerror = () => {
        alert("Error reading file");
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      alert("Import process failed");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className="p-8 border-2 border-dashed rounded-lg text-center space-y-2 hover:bg-muted/50 transition-colors cursor-pointer relative bg-white/50"
        onClick={() => fileInputRef.current?.click()}
      >
        <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground" />
        <div className="text-sm font-medium">
          {file ? file.name : "Click here to select Excel/CSV file"}
        </div>
        <p className="text-xs text-muted-foreground">Supports .xlsx, .xls, .csv</p>
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept=".csv,.xlsx,.xls" 
          onChange={handleFileChange}
        />
      </div>

      {result && (
        <div className="p-4 rounded-lg bg-muted text-sm space-y-1">
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Import Complete
          </div>
          <p>Successfully imported: {result.success}</p>
          <p>Duplicates skipped: {result.duplicates}</p>
          <p className="text-destructive">Errors: {result.error}</p>
        </div>
      )}

      <Button 
        onClick={handleImport} 
        disabled={!file || loading} 
        className="w-full"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
        {loading ? "Importing..." : "Start Import"}
      </Button>
    </div>
  );
}
