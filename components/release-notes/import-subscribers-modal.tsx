"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSubscribers } from "@/hooks/use-subscribers";
import { toast } from "sonner";
import { Download } from "lucide-react";

interface ImportSubscribersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportSubscribersModal({ open, onOpenChange }: ImportSubscribersModalProps) {
  const { importSubscribers, isImporting } = useSubscribers();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
    } else {
      toast.error("Please select a valid CSV file");
      e.target.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    const template = "First Name,Last Name,Email,Contact,Company\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    try {
      await importSubscribers(file);
      onOpenChange(false);
      setFile(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Subscribers</DialogTitle>
          <DialogDescription>
            Import subscribers from a CSV file. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadTemplate}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>

            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!file || isImporting}>
              {isImporting ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}