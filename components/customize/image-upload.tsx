"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { uploadImage } from "@/lib/storage";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  maxSize?: number;
}

export function ImageUpload({
  value,
  onChange,
  accept = "image/*",
  maxSize = 2,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (in MB)
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Image size should be less than ${maxSize}MB`);
      return;
    }

    try {
      setIsUploading(true);
      const { publicUrl } = await uploadImage(file, "helpdeck", "customize");
      onChange(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {value && (
        <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-contain"
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept={accept}
          onChange={handleUpload}
          disabled={isUploading}
        />
        {value && (
          <Button
            variant="outline"
            onClick={() => onChange("")}
            disabled={isUploading}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}