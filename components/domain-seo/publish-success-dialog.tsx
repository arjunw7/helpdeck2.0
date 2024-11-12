"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";

interface PublishSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
}

export function PublishSuccessDialog({
  open,
  onOpenChange,
  orgSlug,
}: PublishSuccessDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const knowledgeBaseUrl = `https://${orgSlug}.helpdeck.app`;

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(knowledgeBaseUrl);
      toast.success("URL copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🎉 Knowledge Base Published!</DialogTitle>
            <DialogDescription>
              Your knowledge base is now live and accessible to your users.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1 rounded-md border p-2">
                <p className="text-sm text-muted-foreground break-all">
                  {knowledgeBaseUrl}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-end">
              <a
                href={knowledgeBaseUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Knowledge Base
                </Button>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}