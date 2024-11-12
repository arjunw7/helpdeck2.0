"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { ReleaseNote } from "@/lib/api/release-notes";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ReleaseNotesListProps {
  releaseNotes: ReleaseNote[];
}

export function ReleaseNotesList({ releaseNotes }: ReleaseNotesListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/10 text-green-500";
      case "draft":
        return "bg-yellow-500/10 text-yellow-500";
      case "archived":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
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
        .filter((text: string) => text.trim()) // Remove empty lines
        .join('\n') // Join with single newline
        .replace(/\n{3,}/g, '\n\n'); // Replace multiple newlines with double newline
    }
    
    return '';
  };

  return (
    <div className="grid gap-6">
      {releaseNotes.map((note) => (
        <Link key={note.id} href={`/release-notes/${note.id}/edit`}>
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
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
                  className={cn(getStatusColor(note.status))}
                >
                  {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}