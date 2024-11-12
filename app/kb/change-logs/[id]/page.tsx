"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Bell, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { KnowledgeBaseLayout } from "@/components/knowledge-base/shared/layout";
import { Header } from "@/components/knowledge-base/shared/header";
import { ContactSupport } from "@/components/knowledge-base/shared/contact-support";
import { KnowledgeBaseSettings } from "@/stores/customize";
import { SubscribeModal } from "@/components/release-notes/subscribe-modal";
import { cn } from "@/lib/utils";

interface ReleaseNote {
  id: string;
  title: string;
  description: any;
  version: string;
  type: string[];
  status: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  profiles: {
    full_name: string;
  };
}

interface VoteState {
  upvotes: number;
  downvotes: number;
}

const VOTE_STORAGE_KEY = 'changelog_votes';

export default function ChangeLogPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [settings, setSettings] = useState<KnowledgeBaseSettings | null>(null);
  const [organization, setOrganization] = useState<{ name: string } | null>(null);
  const [releaseNote, setReleaseNote] = useState<ReleaseNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [votes, setVotes] = useState<VoteState>({ upvotes: 0, downvotes: 0 });
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

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

          // Get release note
          const { data: note } = await supabase
            .from('release_notes')
            .select(`
              *,
              profiles:created_by (
                full_name
              )
            `)
            .eq('id', params.id)
            .eq('status', 'published')
            .single();

          if (note) {
            setReleaseNote(note);
            setVotes({
              upvotes: note.upvotes || 0,
              downvotes: note.downvotes || 0,
            });

            // Load user's vote
            const storedUserVote = localStorage.getItem(`${VOTE_STORAGE_KEY}_user_${note.id}`);
            if (storedUserVote) {
              setUserVote(storedUserVote as 'up' | 'down');
            }
          } else {
            throw new Error('Change log not found');
          }
        }
      } catch (error) {
        console.error('Error loading change log:', error);
        toast.error('Failed to load change log');
        router.push('/kb/change-logs');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [params.id]);

  const handleVote = async (type: 'up' | 'down') => {
    if (!releaseNote || userVote === type) return;

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
        .from('release_notes')
        .update({
          upvotes: newVotes.upvotes,
          downvotes: newVotes.downvotes,
        })
        .eq('id', releaseNote.id);

      if (error) throw error;

      // Save votes locally
      localStorage.setItem(`${VOTE_STORAGE_KEY}_${releaseNote.id}`, JSON.stringify(newVotes));
      localStorage.setItem(`${VOTE_STORAGE_KEY}_user_${releaseNote.id}`, type);

      setVotes(newVotes);
      setUserVote(type);
    } catch (error) {
      console.error('Error updating votes:', error);
      toast.error('Failed to update vote');
    }
  };

  const formatContent = (content: any) => {
    if (!content) return '';
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        return content;
      }
    }
    
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

  if (!settings || !releaseNote) {
    return null;
  }

  return (
    <KnowledgeBaseLayout settings={settings}>
      <Header settings={settings} organizationName={organization?.name} />
      
      {/* Banner */}
      <div 
        className="px-[5%] py-12"
        style={{ backgroundColor: settings.theme.accentColor }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">v{releaseNote.version}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm text-white/75">
                <User className="h-4 w-4" />
                {releaseNote.profiles.full_name}
              </div>
              <div className="flex items-center gap-1 text-sm text-white/75">
                <Calendar className="h-4 w-4" />
                {new Date(releaseNote.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <Button 
            variant="secondary"
            onClick={() => setShowSubscribeModal(true)}
          >
            <Bell className="mr-2 h-4 w-4 bell-shake" />
            Subscribe to Updates
          </Button>
        </div>
      </div>

      <div className="px-[5%] py-12">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">{releaseNote.title}</h2>
              <div className="flex gap-2">
                {releaseNote.type.map((type) => (
                  <Badge key={type} variant="outline">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            <div 
              className="prose prose-neutral dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: formatContent(releaseNote.description) }}
            />

            {/* Voting Section */}
            <div className="mt-8 flex flex-col items-center gap-4 pt-8 border-t">
              <p className="text-sm text-muted-foreground">Was this change log helpful?</p>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleVote('up')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                    userVote === 'up' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'hover:bg-muted'
                  )}
                  disabled={userVote === 'up'}
                >
                  <ThumbsUp className="h-5 w-5" />
                  <span>{votes.upvotes}</span>
                </button>
                <button
                  onClick={() => handleVote('down')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                    userVote === 'down' 
                      ? 'bg-red-500/10 text-red-500' 
                      : 'hover:bg-muted'
                  )}
                  disabled={userVote === 'down'}
                >
                  <ThumbsDown className="h-5 w-5" />
                  <span>{votes.downvotes}</span>
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {settings.content.showContactSupport && settings.content.contactEmail && (
        <ContactSupport settings={settings} />
      )}

      <SubscribeModal
        open={showSubscribeModal}
        onOpenChange={setShowSubscribeModal}
      />
    </KnowledgeBaseLayout>
  );
}