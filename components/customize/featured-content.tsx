"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomizeStore } from "@/stores/customize";
import { useArticles } from "@/hooks/use-articles";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";

const MAX_FEATURED_ARTICLES = 6;

export function FeaturedContent() {
  const { settings, updateContentSettings } = useCustomizeStore();
  const { articles } = useArticles();

  const handlePinnedArticleSelect = (articleId: string) => {
    if (settings.content.pinnedArticles.length >= MAX_FEATURED_ARTICLES && 
        !settings.content.pinnedArticles.includes(articleId)) {
      toast.error(`Maximum ${MAX_FEATURED_ARTICLES} pinned articles allowed`);
      return;
    }

    const updatedPinned = settings.content.pinnedArticles.includes(articleId)
      ? settings.content.pinnedArticles.filter(id => id !== articleId)
      : [...settings.content.pinnedArticles, articleId];
    updateContentSettings({ pinnedArticles: updatedPinned });
  };

  const handlePopularArticleSelect = (articleId: string) => {
    if (settings.content.popularArticles.length >= MAX_FEATURED_ARTICLES && 
        !settings.content.popularArticles.includes(articleId)) {
      toast.error(`Maximum ${MAX_FEATURED_ARTICLES} popular articles allowed`);
      return;
    }

    const updatedPopular = settings.content.popularArticles.includes(articleId)
      ? settings.content.popularArticles.filter(id => id !== articleId)
      : [...settings.content.popularArticles, articleId];
    updateContentSettings({ popularArticles: updatedPopular });
  };

  const publishedArticles = articles.filter(article => article.status === "published");

  return (
    <Card>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Pinned Articles</Label>
            <span className="text-sm text-muted-foreground">
              {settings.content.pinnedArticles.length}/{MAX_FEATURED_ARTICLES} selected
            </span>
          </div>
          <div className="space-y-2">
            {settings.content.pinnedArticles.map(articleId => {
              const article = publishedArticles.find(a => a.id === articleId);
              if (!article) return null;
              return (
                <Badge 
                  key={articleId} 
                  variant="secondary"
                  className="mr-2 gap-2"
                >
                  {article.title}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handlePinnedArticleSelect(articleId)}
                  />
                </Badge>
              );
            })}
          </div>
          {settings.content.pinnedArticles.length < MAX_FEATURED_ARTICLES && (
            <Select onValueChange={handlePinnedArticleSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Add pinned article" />
              </SelectTrigger>
              <SelectContent>
                {publishedArticles
                  .filter(article => !settings.content.pinnedArticles.includes(article.id))
                  .map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Popular Articles</Label>
            <span className="text-sm text-muted-foreground">
              {settings.content.popularArticles.length}/{MAX_FEATURED_ARTICLES} selected
            </span>
          </div>
          <div className="space-y-2">
            {settings.content.popularArticles.map(articleId => {
              const article = publishedArticles.find(a => a.id === articleId);
              if (!article) return null;
              return (
                <Badge 
                  key={articleId} 
                  variant="secondary"
                  className="mr-2 gap-2"
                >
                  {article.title}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handlePopularArticleSelect(articleId)}
                  />
                </Badge>
              );
            })}
          </div>
          {settings.content.popularArticles.length < MAX_FEATURED_ARTICLES && (
            <Select onValueChange={handlePopularArticleSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Add popular article" />
              </SelectTrigger>
              <SelectContent>
                {publishedArticles
                  .filter(article => !settings.content.popularArticles.includes(article.id))
                  .map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoriesPerRow">Categories per Row</Label>
          <Select
            value={settings.content.categoriesPerRow.toString()}
            onValueChange={(value) =>
              updateContentSettings({ categoriesPerRow: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select number" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between space-y-0">
          <div className="space-y-1">
            <Label>Change Logs</Label>
            <p className="text-sm text-muted-foreground">
              Show change logs in the public knowledge base
            </p>
          </div>
          <Switch
            checked={settings.content.showChangeLogs}
            onCheckedChange={(checked) =>
              updateContentSettings({ showChangeLogs: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between space-y-0">
          <div className="space-y-1">
            <Label>Contact Support</Label>
            <p className="text-sm text-muted-foreground">
              Show contact support section
            </p>
          </div>
          <Switch
            checked={settings.content.showContactSupport}
            onCheckedChange={(checked) =>
              updateContentSettings({ showContactSupport: checked })
            }
          />
        </div>

        {settings.content.showContactSupport && (
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Support Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={settings.content.contactEmail}
              onChange={(e) =>
                updateContentSettings({ contactEmail: e.target.value })
              }
              placeholder="support@example.com"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}