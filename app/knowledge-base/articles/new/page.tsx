"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/hooks/use-categories";
import { useArticles } from "@/hooks/use-articles";
import { Editor } from "@/components/articles/editor";
import { toast } from "sonner";
import { Globe, Lock } from "lucide-react";

const visibilityOptions = [
  { value: "public", label: "Public", icon: Globe },
  { value: "private", label: "Private", icon: Lock },
] as const;

export default function NewArticlePage() {
  const router = useRouter();
  const { categories } = useCategories();
  const { createArticle, isCreating } = useArticles();
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: {},
    visibility: "public" as "public" | "private",
    category_id: "",
    slug: "",
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent, status: "draft" | "published") => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.category_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createArticle({
        ...formData,
        status,
      });
      
      router.push("/knowledge-base/articles");
      router.refresh();
    } catch (error) {
      console.error("Error creating article:", error);
      toast.error("Failed to create article");
    }
  };

  return (
    <div className="container max-w-5xl py-4 px-4">
      <div className="mb-4">
        <Link
          href="/knowledge-base/articles"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Link>
      </div>

      <Card className="border-0">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold">New Article</h1>
            <p className="text-sm text-muted-foreground">
              Create a new article for your knowledge base
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Enter article title"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="article-slug"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subtitle">Subtitle (Optional)</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                placeholder="Enter article subtitle"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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

            <div className="grid gap-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value: "public" | "private") =>
                  setFormData((prev) => ({ ...prev, visibility: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  
                  {
                    visibilityOptions?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <option.icon className="mr-2 h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Content</Label>
              <Editor
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={isCreating}
            >
              Save as Draft
            </Button>
            <Button
              onClick={(e) => handleSubmit(e, "published")}
              disabled={isCreating}
            >
              {isCreating ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}