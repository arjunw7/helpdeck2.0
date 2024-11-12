"use client";

import { KnowledgeBaseSettings } from "@/stores/customize";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, User, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useArticles } from "@/hooks/use-articles";
import { useCategories } from "@/hooks/use-categories";
import { useEffect, useState } from "react";

interface ArticlePreviewProps {
  settings: KnowledgeBaseSettings;
  organizationName?: string;
  articleId?: string;
  onCategoryClick: (categoryId: string) => void;
  onViewChange: (view: "home" | "category" | "article") => void;
}

interface ArticleVotes {
  upvotes: number;
  downvotes: number;
}

const VOTE_STORAGE_KEY = 'article_votes';

export function ArticlePreview({ 
  settings, 
  organizationName,
  articleId,
  onCategoryClick,
  onViewChange,
}: ArticlePreviewProps) {
  const { articles } = useArticles();
  const { categories } = useCategories();
  const [votes, setVotes] = useState<ArticleVotes>({ upvotes: 0, downvotes: 0 });
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  // Get article and its category
  const article = articleId 
    ? articles.find(a => a.id === articleId)
    : articles.find(a => a.status === "published" && a.visibility === "public");
  const category = article ? categories.find(c => c.id === article.category_id) : null;

  useEffect(() => {
    if (article?.id) {
      // Load votes from localStorage
      const storedVotes = localStorage.getItem(`${VOTE_STORAGE_KEY}_${article.id}`);
      if (storedVotes) {
        setVotes(JSON.parse(storedVotes));
      } else {
        setVotes({ upvotes: article.upvotes || 0, downvotes: article.downvotes || 0 });
      }
      
      // Load user's vote
      const storedUserVote = localStorage.getItem(`${VOTE_STORAGE_KEY}_user_${article.id}`);
      if (storedUserVote) {
        setUserVote(storedUserVote as 'up' | 'down');
      }
    }
  }, [article?.id]);

  const handleVote = (type: 'up' | 'down') => {
    if (!article?.id || userVote === type) return;

    const newVotes = { ...votes };

    // Remove previous vote if exists
    if (userVote) {
      if (userVote === 'up') newVotes.upvotes--;
      if (userVote === 'down') newVotes.downvotes--;
    }

    // Add new vote
    if (type === 'up') newVotes.upvotes++;
    if (type === 'down') newVotes.downvotes++;

    // Save votes
    localStorage.setItem(`${VOTE_STORAGE_KEY}_${article.id}`, JSON.stringify(newVotes));
    localStorage.setItem(`${VOTE_STORAGE_KEY}_user_${article.id}`, type);

    setVotes(newVotes);
    setUserVote(type);
  };

  const getTextColor = (bgColor: string) => {
    const rgb = hexToRgb(bgColor);
    if (!rgb) return 'black';
    const luminance = getLuminance(rgb);
    return luminance < 0.5 ? 'white' : 'black';
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const getLuminance = ({ r, g, b }: { r: number, g: number, b: number }) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const formatContent = (content: any) => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    
    // Handle TipTap JSON content
    if (content.type === 'doc') {
      return content.content
        .map((node: any) => {
          switch (node.type) {
            case 'paragraph':
              return `<p>${node.content?.map((c: any) => c.text).join('') || ''}</p>`;
            case 'heading':
              const level = node.attrs?.level || 1;
              return `<h${level}>${node.content?.map((c: any) => c.text).join('') || ''}</h${level}>`;
            default:
              return '';
          }
        })
        .join('');
    }
    
    return '';
  };

  return (
    <>
      {/* Fixed Header */}
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.general.logo ? (
              <Image
                src={settings.general.logo}
                alt="Logo"
                width={120}
                height={30}
                className="h-8 w-auto"
              />
            ) : (
              <span className="text-lg font-bold">
                {organizationName || settings.general.title}
              </span>
            )}
          </div>
          <nav className="flex items-center gap-4">
            {settings.navigation.menuItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                className="text-sm hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Banner */}
      <div 
        className="px-6 py-12"
        style={{ 
          backgroundColor: settings.theme.accentColor,
          color: getTextColor(settings.theme.accentColor)
        }}
      >
        <div className="container mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm mb-8 opacity-90">
            <button 
              onClick={() => onViewChange("home")}
              className="hover:opacity-80 cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="h-4 w-4 opacity-50" />
            <button
              onClick={() => {
                if (category) {
                  onCategoryClick(category.id);
                }
              }}
              className="hover:opacity-80 cursor-pointer"
            >
              {category?.name || "Sample Category"}
            </button>
            <ChevronRight className="h-4 w-4 opacity-50" />
            <span>{article?.title || "Sample Article"}</span>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4">{article?.title || "Sample Article Title"}</h1>
            <div className="flex items-center gap-4">
              <Badge 
                variant="secondary" 
                className="bg-white/10 hover:bg-white/20"
                style={{ color: getTextColor(settings.theme.accentColor) }}
              >
                {category?.name || "Sample Category"}
              </Badge>
              <div className="flex items-center gap-1 text-sm opacity-75">
                <User className="h-4 w-4" />
                {article?.profiles?.full_name || "John Doe"}
              </div>
              <div className="flex items-center gap-1 text-sm opacity-75">
                <Eye className="h-4 w-4" />
                {article?.views || 0} views
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto pb-12">
        <Card className="max-w-4xl mx-auto p-6">
          <div 
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(article?.content) }}
          />

          {/* Voting Section */}
          <div className="mt-8 flex flex-col items-center gap-4 pt-8 border-t">
            <p className="text-sm text-muted-foreground">Was this article helpful?</p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleVote('up')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  userVote === 'up' 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'hover:bg-muted'
                }`}
                disabled={userVote === 'up'}
              >
                <ThumbsUp className="h-5 w-5" />
                <span>{votes.upvotes}</span>
              </button>
              <button
                onClick={() => handleVote('down')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  userVote === 'down' 
                    ? 'bg-red-500/10 text-red-500' 
                    : 'hover:bg-muted'
                }`}
                disabled={userVote === 'down'}
              >
                <ThumbsDown className="h-5 w-5" />
                <span>{votes.downvotes}</span>
              </button>
            </div>
          </div>
        </Card>

        {/* Contact Support */}
        {settings.content.showContactSupport && settings.content.contactEmail && (
          <div className="mt-8 max-w-4xl mx-auto rounded-lg bg-muted p-8 text-center">
            <h2 className="mb-2 text-lg font-semibold">Need More Help?</h2>
            <p className="text-sm text-muted-foreground">
              Contact our support team at{" "}
              <Link
                href={`mailto:${settings.content.contactEmail}`}
                className="text-primary hover:underline"
              >
                {settings.content.contactEmail}
              </Link>
            </p>
          </div>
        )}
      </div>
    </>
  );
}