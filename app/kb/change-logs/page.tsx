"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Bell } from "lucide-react";
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
  profiles: {
    full_name: string;
  };
}

export default function ChangeLogsPage() {
  const [settings, setSettings] = useState<KnowledgeBaseSettings | null>(null);
  const [organization, setOrganization] = useState<{ name: string } | null>(null);
  const [releasedNotes, setReleaseNotes] = useState<ReleaseNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

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

          // Get published release notes
          const { data: notes } = await supabase
            .from('release_notes')
            .select(`
              *,
              profiles:created_by (
                full_name
              )
            `)
            .eq('org_id', data.organizationId)
            .eq('status', 'published')
            .order('created_at', { ascending: false });

          if (notes) {
            setReleaseNotes(notes);
          }
        }
      } catch (error) {
        console.error('Error loading change logs:', error);
        toast.error('Failed to load change logs');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

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
              return node.content?.map((c: any) => c.text).join('') || '';
            case 'heading':
              return node.content?.map((c: any) => c.text).join('') || '';
            case 'bulletList':
              return node.content?.map((item: any) => 
                `• ${item.content?.map((p: any) => 
                  p.content?.map((c: any) => c.text).join('')
                ).join('')}`
              ).join('\n');
            case 'orderedList':
              return node.content?.map((item: any, index: number) => 
                `${index + 1}. ${item.content?.map((p: any) => 
                  p.content?.map((c: any) => c.text).join('')
                ).join('')}`
              ).join('\n');
            case 'blockquote':
              return node.content?.map((p: any) => 
                `"${p.content?.map((c: any) => c.text).join('')}"`
              ).join('\n');
            default:
              return '';
          }
        })
        .filter((text: string) => text.trim())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n');
    }
    
    return '';
  };

  if (!settings) {
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
            <h1 className="text-3xl font-bold text-white">Change Logs</h1>
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
        <div className="grid gap-6">
          {releasedNotes.map((note) => (
            <Link key={note.id} href={`/kb/change-logs/${note.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">v{note.version}</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          {note.profiles.full_name}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(note.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn("bg-green-500/10 text-green-500")}
                    >
                      Published
                    </Badge>
                  </div>
                  <div className="space-y-4 mt-4">
                    <h4 className="text-xl font-semibold">{note.title}</h4>
                    <div className="flex gap-2">
                      {note.type.map((type) => (
                        <Badge key={type} variant="outline">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    <div className="relative">
                      <div 
                        className="text-sm text-muted-foreground overflow-hidden"
                        style={{ 
                          maxHeight: '100px',
                          whiteSpace: 'pre-line',
                          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
                        }}
                      >
                        {formatContent(note.description)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
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