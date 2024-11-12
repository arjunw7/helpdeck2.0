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
import { useCategories } from "@/hooks/use-categories";
import { Category } from "@/lib/api/categories";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
}

const visibilityOptions = [
  { value: "public", label: "Public", icon: Globe },
  { value: "private", label: "Private", icon: Lock },
] as const;

export function CategoryModal({ open, onOpenChange, categories }: CategoryModalProps) {
  const { createCategory, isCreating } = useCategories();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parent_id: null as string | null,
    accessibility: "public" as "public" | "private",
    icon: "📚" as string,
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        slug: "",
        description: "",
        parent_id: null,
        accessibility: "public",
        icon: "📚",
      });
    }
  }, [open]);

  useEffect(() => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData(prev => ({ ...prev, slug }));
  }, [formData.name]);

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      parent_id: null,
      accessibility: "public",
      icon: "📚",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    createCategory(formData, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      },
    });
  };

  const handleEmojiSelect = (emoji: any) => {
    setFormData(prev => ({ ...prev, icon: emoji.native }));
    setShowEmojiPicker(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize your knowledge base content
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
         <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="flex gap-2 items-start">
              <div>
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
              </div>
  
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
            <Label htmlFor="parent">Parent Category (Optional)</Label>
            <Select
              value={formData.parent_id || undefined}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, parent_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}