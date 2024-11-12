"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Globe, Lock, Filter, X, Check, Search } from "lucide-react";
import { Article } from "@/lib/api/articles";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/use-categories";

interface ArticlesListProps {
  articles: Article[];
}

const statusOptions = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const visibilityOptions = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

export function ArticlesList({ articles }: ArticlesListProps) {
  const router = useRouter();
  const { categories } = useCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: [] as string[],
    visibility: [] as string[],
    author: [] as string[],
    category: [] as string[],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/10 text-green-500";
      case "draft":
        return "bg-yellow-500/10 text-yellow-500";
      default:
        return "bg-blue-500/10 text-blue-500";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleRowClick = (articleId: string) => {
    router.push(`/knowledge-base/articles/${articleId}/edit`);
  };

  // Get unique authors
  const authors = Array.from(new Set(articles.map(article => article.profiles.full_name)));

  // Apply filters and search
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filters.status.length === 0 || filters.status.includes(article.status);
    const matchesVisibility = filters.visibility.length === 0 || filters.visibility.includes(article.visibility);
    const matchesAuthor = filters.author.length === 0 || filters.author.includes(article.profiles.full_name);
    const matchesCategory = filters.category.length === 0 || filters.category.includes(article.category_id);
    return matchesSearch && matchesStatus && matchesVisibility && matchesAuthor && matchesCategory;
  });

  const toggleFilter = useCallback((key: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value],
    }));
  }, []);

  const removeFilter = useCallback((key: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].filter(item => item !== value),
    }));
  }, []);

  const formatFilterValue = (key: string, value: string) => {
    if (key === "status" || key === "visibility") {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    if (key === "category") {
      return categories.find(cat => cat.id === value)?.name || value;
    }
    return value;
  };

  const getActiveFilters = useCallback(() => {
    return Object.entries(filters).flatMap(([key, values]) =>
      values.map(value => ({ key, value }))
    );
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters({ status: [], visibility: [], author: [], category: [] });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className={cn(getActiveFilters().length > 0 && "text-primary")}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="end">
            <Command>
              <CommandInput placeholder="Search filters..." />
              <CommandEmpty>No filters found.</CommandEmpty>
              <ScrollArea className="h-[400px]">
                <CommandGroup heading="Status">
                  {statusOptions.map(option => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleFilter("status", option.value)}
                    >
                      <div className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        filters.status.includes(option.value)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}>
                        <Check className="h-4 w-4" />
                      </div>
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Visibility">
                  {visibilityOptions.map(option => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleFilter("visibility", option.value)}
                    >
                      <div className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        filters.visibility.includes(option.value)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}>
                        <Check className="h-4 w-4" />
                      </div>
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Categories">
                  {categories.map(category => (
                    <CommandItem
                      key={category.id}
                      onSelect={() => toggleFilter("category", category.id)}
                    >
                      <div className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        filters.category.includes(category.id)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}>
                        <Check className="h-4 w-4" />
                      </div>
                      {category.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Author">
                  {authors.map(author => (
                    <CommandItem
                      key={author}
                      onSelect={() => toggleFilter("author", author)}
                    >
                      <div className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        filters.author.includes(author)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}>
                        <Check className="h-4 w-4" />
                      </div>
                      {author}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </ScrollArea>
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredArticles.length} of {articles.length} article{articles.length !== 1 ? 's' : ''}
        </p>
      </div>

      {getActiveFilters().length > 0 && (
        <div className="flex flex-wrap gap-2">
          {getActiveFilters().map(({ key, value }) => (
            <Badge
              key={`${key}-${value}`}
              variant="secondary"
              className="gap-1"
            >
              {formatFilterValue(key, value)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter(key as keyof typeof filters, value)}
              />
            </Badge>
          ))}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.map((article) => (
              <TableRow 
                key={article.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(article.id)}
              >
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium hover:text-primary">
                      {article.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {article.categories.name}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={getStatusColor(article.status)}
                    variant="secondary"
                  >
                    {formatStatus(article.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    {article.views}
                  </div>
                </TableCell>
                <TableCell>{article.profiles.full_name}</TableCell>
                <TableCell>
                  {new Date(article.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {article.visibility === "public" ? (
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}