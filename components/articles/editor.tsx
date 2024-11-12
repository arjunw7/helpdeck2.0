"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "./editor-toolbar";
import { AiMenu } from "./ai-menu";
import { uploadImage } from "@/lib/storage";
import { toast } from "sonner";
import { ResizableImage } from "./editor-extensions";

interface EditorProps {
  onChange: (content: any) => void;
  initialContent?: any;
}

export function Editor({ onChange, initialContent }: EditorProps) {
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [showAiOptions, setShowAiOptions] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Highlight,
      Link.configure({
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4 hover:text-primary/80",
        },
        openOnClick: false,
      }),
      ResizableImage.configure({
        HTMLAttributes: {
          class: "rounded-lg border max-w-full h-auto my-4",
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return "What is the title?";
          }
          return "Press Cmd + / (Mac) or Ctrl + / (Windows) for AI commands or start writing...";
        },
        showOnlyCurrent: false,
        includeChildren: true,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-[500px] p-4 focus:outline-none",
      },
      handleKeyDown: (view, event) => {
        // Allow all keys to work normally
        return false;
      },
      handlePaste: (view, event) => {
        // Handle paste events normally
        return false;
      },
      handleDrop: (view, event) => {
        // Handle drop events normally
        return false;
      },
    },
    onUpdate: ({ editor, transaction }) => {
      // Only emit content changes if they're not selection-only updates
      if (!transaction.docChanged) {
        return;
      }
      
      // Get the current content
      const content = editor.getJSON();
      onChange(content);
    },
  });

  useEffect(() => {
    if (editor && initialContent) {
      // Store current selection
      const { from, to } = editor.state.selection;
      
      // Set content
      if (typeof initialContent === 'string') {
        editor.commands.setContent(initialContent, false);
      } else {
        editor.commands.setContent(initialContent, false);
      }
      
      // Restore selection if it was within bounds
      const docSize = editor.state.doc.content.size;
      if (from <= docSize && to <= docSize) {
        editor.commands.setTextSelection({ from, to });
      }
    }
  }, [editor, initialContent]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        
        if (editor) {
          const hasSelection = !editor.state.selection.empty && 
            editor.state.doc.textBetween(
              editor.state.selection.from, 
              editor.state.selection.to
            ).trim().length > 0;

          setShowAiOptions(hasSelection);
          setShowAiMenu(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  const handleImageUpload = async (file: File) => {
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size should be less than 5MB");
      }

      const { publicUrl } = await uploadImage(file, "helpdeck", "articles");
      editor?.chain().focus().setImage({ src: publicUrl }).run();
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    }
  };

  const handleVideoEmbed = (url: string) => {
    try {
      if (!url.includes("youtube.com") && !url.includes("youtu.be") && !url.includes("vimeo.com")) {
        throw new Error("Please provide a valid YouTube or Vimeo URL");
      }

      let embedHtml = "";
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = url.includes("youtu.be")
          ? url.split("/").pop()
          : new URL(url).searchParams.get("v");
        embedHtml = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen class="w-full aspect-video rounded-lg"></iframe>`;
      } else if (url.includes("vimeo.com")) {
        const videoId = url.split("/").pop();
        embedHtml = `<iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen class="w-full aspect-video rounded-lg"></iframe>`;
      }

      editor?.chain().focus().setContent(embedHtml).run();
      toast.success("Video embedded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to embed video");
    }
  };

  const handleAiCommand = () => {
    if (editor) {
      const hasSelection = !editor.state.selection.empty && 
        editor.state.doc.textBetween(
          editor.state.selection.from, 
          editor.state.selection.to
        ).trim().length > 0;

      setShowAiOptions(hasSelection);
      setShowAiMenu(true);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="relative rounded-md border">
      <EditorToolbar 
        editor={editor} 
        onImageUpload={handleImageUpload} 
        onVideoEmbed={handleVideoEmbed}
        onAiCommand={handleAiCommand}
      />
      <EditorContent editor={editor} />
      <AiMenu
        editor={editor}
        show={showAiMenu}
        showAiOptions={showAiOptions}
        onHide={() => {
          setShowAiMenu(false);
          setShowAiOptions(false);
        }}
      />
    </div>
  );
}