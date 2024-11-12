"use client";

import { useEffect, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Circle, ChevronDown, Trash2, Globe, Lock } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/hooks/use-categories";
import { useArticles } from "@/hooks/use-articles";
import { Editor } from "@/components/articles/editor";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ArticleEditSkeleton } from "@/components/skeletons/article-edit-skeleton";

const statusOptions = [
  { value: "published", label: "Published", color: "text-green-500" },
  { value: "draft", label: "Draft", color: "text-gray-500" },
  { value: "archived", label: "Archived", color: "text-red-500" },
] as const;

const visibilityOptions = [
  { value: "public", label: "Public", icon: Globe },
  { value: "private", label: "Private", icon: Lock },
] as const;

type ArticleStatus = "published" | "draft" | "archived";

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { categories } = useCategories();
  const { getArticle, updateArticle, deleteArticle, isUpdating } = useArticles();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: {},
    visibility: "private" as "public" | "private",
    category_id: "",
    slug: "",
    status: "draft" as ArticleStatus,
  });

  useEffect(() => {
    async function fetchArticle() {
      try {
        const article = await getArticle(params.id);
        setFormData({
          title: article.title,
          subtitle: article.subtitle || "",
          content: article.content,
          visibility: article.visibility,
          category_id: article.category_id,
          slug: article.slug,
          status: article.status as ArticleStatus,
        });
      } catch (error) {
        toast.error("Failed to load article");
        router.push("/knowledge-base/articles");
      } finally {
        setIsLoading(false);
      }
    }
    fetchArticle();
  }, [params.id]);

  if (isLoading) {
    return <ArticleEditSkeleton />;
  }

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

  const handleStatusChange = async (newStatus: ArticleStatus) => {
    try {
      await updateArticle({
        id: params.id,
        data: {
          ...formData,
          status: newStatus,
        },
      });
      setFormData(prev => ({ ...prev, status: newStatus }));
      toast.success(`Article ${newStatus === "archived" ? "archived" : `marked as ${newStatus}`}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update article status");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteArticle(params.id);
      toast.success("Article deleted successfully");
      router.push("/knowledge-base/articles");
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.category_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await updateArticle({
        id: params.id,
        data: formData,
      });
      
      router.push("/knowledge-base/articles");
    } catch (error) {
      console.error("Error updating article:", error);
      toast.error("Failed to update article");
    }
  };

  const getCurrentStatus = () => {
    return statusOptions.find(option => option.value === formData.status) || statusOptions[1];
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
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Edit Article</h1>
              <p className="text-sm text-muted-foreground">
                Update your article content and settings
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Circle className={cn("h-2 w-2 fill-current", getCurrentStatus().color)} />
                    {getCurrentStatus().label}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {statusOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className="gap-2"
                    >
                      <Circle className={cn("h-2 w-2 fill-current", option.color)} />
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="destructive"
                size="icon"
                type="button"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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

            <div className="grid gap-2">
              <Label>Content</Label>
              <Editor
                initialContent={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the article.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Article
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}