"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image,
  Video,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import "@/app/styles/ai-button.css";

interface EditorToolbarProps {
  editor: Editor;
  onImageUpload: (file: File) => Promise<void>;
  onVideoEmbed: (url: string) => void;
  onAiCommand?: () => void;
}

export function EditorToolbar({ editor, onImageUpload, onVideoEmbed, onAiCommand }: EditorToolbarProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isImageUrlDialogOpen, setIsImageUrlDialogOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleImageUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setIsImageUrlDialogOpen(false);
    }
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setIsLinkDialogOpen(false);
    }
  };

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoUrl) {
      onVideoEmbed(videoUrl);
      setVideoUrl("");
      setIsVideoDialogOpen(false);
    }
  };

  const handleAiClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAiCommand?.();
  };

  const getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    if (editor.isActive("heading", { level: 4 })) return "Heading 4";
    if (editor.isActive("heading", { level: 5 })) return "Heading 5";
    if (editor.isActive("heading", { level: 6 })) return "Heading 6";
    return "Paragraph";
  };

  return (
    <TooltipProvider>
      <div className="border-b p-1 flex flex-wrap gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              {getCurrentHeading()}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
              className="flex items-center"
            >
              Paragraph
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className="flex items-center"
            >
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className="flex items-center"
            >
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className="flex items-center"
            >
              Heading 3
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
              className="flex items-center"
            >
              Heading 4
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
              className="flex items-center"
            >
              Heading 5
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
              className="flex items-center"
            >
              Heading 6
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("code")}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Toggle
          size="sm"
          pressed={editor.isActive("blockquote")}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("link")}
            >
              <LinkIcon className="h-4 w-4" />
            </Toggle>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Link</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Add Link</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Toggle size="sm">
              <Image className="h-4 w-4" />
            </Toggle>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <Label
              htmlFor="image-upload"
              className="flex cursor-pointer items-center px-2 py-1.5 text-sm"
            >
              Upload Image
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageInput}
              />
            </Label>
            <DropdownMenuItem onSelect={() => setIsImageUrlDialogOpen(true)}>
              Image URL
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={isImageUrlDialogOpen} onOpenChange={setIsImageUrlDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Image URL</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleImageUrlSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Add Image</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
          <DialogTrigger asChild>
            <Toggle size="sm">
              <Video className="h-4 w-4" />
            </Toggle>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Embed Video</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleVideoSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="YouTube or Vimeo URL"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Embed Video</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Toggle
          size="sm"
          onPressedChange={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onPressedChange={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              className={cn(
                "gap-2 ai-button",
                "hover:text-primary hover:bg-transparent"
              )}
              onClick={handleAiClick}
            >
              <Sparkles className="h-4 w-4" />
              Ask AI
              <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span> /
              </kbd>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Press {isMac ? '⌘' : 'Ctrl'} + / to open AI assistant
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}