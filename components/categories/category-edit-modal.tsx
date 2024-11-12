"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Globe, Lock, Smile } from "lucide-react";
import { Category } from "@/lib/api/categories";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface CategoryEditModalProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (category: Category) => void;
}

const visibilityOptions = [
  { value: "public", label: "Public", icon: Globe },
  { value: "private", label: "Private", icon: Lock },
] as const;

export function CategoryEditModal({
  category,
  open,
  onOpenChange,
  onSuccess,
}: CategoryEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    accessibility: category.accessibility,
    icon: category.icon || "📚",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        accessibility: category.accessibility,
        icon: category.icon || "📚",
      });
    }
  }, [open, category]);

  const handleEmojiSelect = (emoji: any) => {
    setFormData(prev => ({ ...prev, icon: emoji.native }));
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const { data, error } = await supabase
        .from("categories")
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          accessibility: formData.accessibility,
          icon: formData.icon,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", category.id)
        .select(`
          *,
          profiles:created_by (
            full_name
          )
        `)
        .single();

      if (error) throw error;

      toast.success("Category updated successfully");
      onSuccess(data);
    } catch (error) {
      toast.error("Failed to update category");
      console.error("Error updating category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update your category details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="flex gap-2">
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-10 p-0 flex items-center justify-center"
                  >
                    {formData.icon || <Smile className="h-4 w-4" />}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme="light"
                  />
                </PopoverContent>
              </Popover>
  
              <div className="flex-1">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter category name"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              placeholder="category-slug"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Enter category description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessibility">Visibility</Label>
            <Select
              value={formData.accessibility}
              onValueChange={(value: "public" | "private") =>
                setFormData((prev) => ({ ...prev, accessibility: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visibility">
                  {formData.accessibility && (
                    <div className="flex items-center">
                      {formData.accessibility === "public" ? (
                        <Globe className="mr-2 h-4 w-4" />
                      ) : (
                        <Lock className="mr-2 h-4 w-4" />
                      )}
                      {formData.accessibility.charAt(0).toUpperCase() + formData.accessibility.slice(1)}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <option.icon className="mr-2 h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}