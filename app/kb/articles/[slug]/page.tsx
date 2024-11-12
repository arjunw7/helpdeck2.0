"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, User, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { KnowledgeBaseLayout } from "@/components/knowledge-base/shared/layout";
import { Header } from "@/components/knowledge-base/shared/header";
import { ContactSupport } from "@/components/knowledge-base/shared/contact-support";
import { KnowledgeBaseSettings } from "@/stores/customize";

interface Article {
  id: string;
  title: string;
  content: any;
  slug: string;
  category_id: string;
  views: number;
  upvotes: number;
  downvotes: number;
  created_at: string;
  profiles: {
    full_name: string;
  };
  categories: {
    id: string;
    name: string;
    icon: string;
    slug: string;
  };
}

interface ArticleVotes {
  upvotes: number;
  downvotes: number;
}

const VOTE_STORAGE_KEY = 'article_votes';

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const [settings, setSettings] = useState<KnowledgeBaseSettings | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [organization, setOrganization] = useState<{ name: string } | null>(null);
  const [votes, setVotes] = useState<ArticleVotes>({ upvotes: 0, downvotes: 0 });
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Get settings from response headers
        const response = await fetch("/api/kb/settings");
        const data = await response.json();
        
        if (data.settings) {
          setSettings(data.settings);
        }

        if (data.organizationId) {
          const { data: org } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', data.organizationId)
            .single();

          setOrganization(org);
        }

        // Get article
        const { data: articleData } = await supabase
          .from('articles')
          .select(`
            *,
            profiles:created_by (
              full_name
            ),
            categories:category_id (
              id,
              name,
              icon,
              slug
            )
          `)
          .eq('slug', params.slug)
          .single();

        if (articleData) {
          setArticle(articleData);
          setVotes({
            upvotes: articleData.upvotes || 0,
            downvotes: articleData.downvotes || 0,
          });

          // Load user's vote
          const storedUserVote = localStorage.getItem(`${VOTE_STORAGE_KEY}_user_${articleData.id}`);
          if (storedUserVote) {
            setUserVote(storedUserVote as 'up' | 'down');
          }

          // Increment view count
          await supabase
            .from('articles')
            .update({ views: (articleData.views || 0) + 1 })
            .eq('id', articleData.id);
        }
      } catch (error) {
        console.error('Error loading article:', error);
        toast.error('Failed to load article');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [params.slug]);

  const handleVote = async (type: 'up' | 'down') => {
    if (!article || userVote === type) return;

    const newVotes = { ...votes };

    // Remove previous vote if exists
    if (userVote) {
      if (userVote === 'up') newVotes.upvotes--;
      if (userVote === 'down') newVotes.downvotes--;
    }

    // Add new vote
    if (type === 'up') newVotes.upvotes++;
    if (type === 'down') newVotes.downvotes++;

    try {
      // Update votes in database
      const { error } = await supabase
        .from('articles')
        .update({
          upvotes: newVotes.upvotes,
          downvotes: newVotes.downvotes,
        })
        .eq('id', article.id);

      if (error) throw error;

      // Save votes locally
      localStorage.setItem(`${VOTE_STORAGE_KEY}_${article.id}`, JSON.stringify(newVotes));
      localStorage.setItem(`${VOTE_STORAGE_KEY}_user_${article.id}`, type);

      setVotes(newVotes);
      setUserVote(type);
    } catch (error) {
      console.error('Error updating votes:', error);
      toast.error('Failed to update vote');
    }
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
            case 'bulletList':
              return `<ul>${node.content?.map((item: any) => 
                `<li>${item.content?.map((p: any) => 
                  p.content?.map((c: any) => c.text).join('')
                ).join('')}</li>`
              ).join('')}</ul>`;
            case 'orderedList':
              return `<ol>${node.content?.map((item: any) => 
                `<li>${item.content?.map((p: any) => 
                  p.content?.map((c: any) => c.text).join('')
                ).join('')}</li>`
              ).join('')}</ol>`;
            case 'blockquote':
              return `<blockquote>${node.content?.map((p: any) => 
                p.content?.map((c: any) => c.text).join('')
              ).join('')}</blockquote>`;
            default:
              return '';
          }
        })
        .join('');
    }
    
    return '';
  };

  if (!settings || !article) {
    return null;
  }

  return (
    <KnowledgeBaseLayout settings={settings}>
      <Header settings={settings} organizationName={organization?.name} />
      
      {/* Article Banner */}
      <div 
        className="px-[5%] py-12"
        style={{ backgroundColor: settings.theme.accentColor }}
      >
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm mb-8 text-white/90">
            <Link href="/kb" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-white/50" />
            <Link 
              href={`/kb/categories/${article.categories.slug}`}
              className="hover:text-white"
            >
              {article.categories.name}
            </Link>
            <ChevronRight className="h-4 w-4 text-white/50" />
            <span>{article.title}</span>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4 text-white">{article.title}</h1>
            <div className="flex items-center gap-4">
              <Badge 
                variant="secondary" 
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                {article.categories.name}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-white/75">
                <User className="h-4 w-4" />
                {article.profiles.full_name}
              </div>
              <div className="flex items-center gap-1 text-sm text-white/75">
                <Eye className="h-4 w-4" />
                {article.views} views
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-[5%] py-10">
        <Card className="p-6">
          <div 
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
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
      </div>
      {settings.content.showContactSupport && settings.content.contactEmail && (
          <ContactSupport settings={settings} />
        )}
    </KnowledgeBaseLayout>
  );
}