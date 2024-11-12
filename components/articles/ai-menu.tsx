"use client";

import { Editor } from "@tiptap/react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Sparkles, Send, Loader2, Wand2, Minimize, Maximize, FileText, LightbulbIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { TypingIndicator } from "./typing-indicator";
import { convertMarkdownToTiptap } from "./editor-utils";
import { usePathname } from "next/navigation";

interface AiMenuProps {
  editor: Editor;
  show: boolean;
  showAiOptions: boolean;
  onHide: () => void;
}

const AI_COMMANDS = [
  {
    id: "improve",
    label: "Improve writing",
    description: "Make the selected text better",
    icon: Wand2,
  },
  {
    id: "shorten",
    label: "Make it concise",
    description: "Shorten the selected text",
    icon: Minimize,
  },
  {
    id: "expand",
    label: "Expand",
    description: "Add more details",
    icon: Maximize,
  },
  {
    id: "summarize",
    label: "Summarize",
    description: "Create a brief summary",
    icon: FileText,
  },
];

const SAMPLE_PROMPTS = [
  {
    title: "Write a document...",
    description: "Create a comprehensive document from scratch",
  },
  {
    title: "Write an onboarding guide for...",
    description: "Create a step-by-step onboarding guide",
  },
  {
    title: "Create SOP for...",
    description: "Write a detailed Standard Operating Procedure",
  },
  {
    title: "Write an overview of...",
    description: "Create a high-level overview document",
  },
  {
    title: "Write a troubleshooting guide for...",
    description: "Create a guide to solve common problems",
  },
  {
    title: "Create a best practices guide for...",
    description: "Document recommended best practices",
  },
];

export function AiMenu({ editor, show, showAiOptions, onHide }: AiMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedTextRef = useRef<string>("");
  const pathname = usePathname();
  const isReleaseNotes = pathname.includes("/release-notes");

  useEffect(() => {
    if (show && inputRef.current) {
      // Small delay to ensure the dialog is fully open
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [show]);

  useEffect(() => {
    return () => {
      // Cleanup: abort any ongoing requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getSelectedText = () => {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to);
  };

  const processStreamChunk = (chunk: string) => {
    accumulatedTextRef.current += chunk?.replaceAll('0:"', '').replaceAll('"\n', '');
    // Split accumulated text by newlines to find complete elements
    const lines = accumulatedTextRef.current.split('\\n');
    
    // Keep the last line (potentially incomplete) in accumulated text
    accumulatedTextRef.current = lines.pop() || '';

    // Process complete lines
    if (lines.length > 0) {
      const content = convertMarkdownToTiptap(lines.join('\n'));
      if (content.content && content.content.length > 0) {
        editor.chain().focus().insertContent(content).run();
      }
    }
  };

  const handleCommand = async (commandId: string) => {
    try {
      setIsLoading(true);
      setActiveCommand(commandId);
      const selectedText = getSelectedText();
      const isModifyingText = showAiOptions && selectedText.trim();
      
      if (showAiOptions && !selectedText.trim()) {
        throw new Error("Please select some text first");
      }

      // Store the current selection
      const { from, to } = editor.state.selection;

      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();

      // Close the AI menu
      onHide();
      setIsTyping(true);

      // Reset accumulated text
      accumulatedTextRef.current = '';

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: commandId,
          selectedText,
          prompt: customPrompt,
          context: isReleaseNotes ? "changelog" : "documentation",
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in to use AI features");
        }
        throw new Error("Failed to generate content");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // Delete selected text if modifying
      if (isModifyingText) {
        editor.chain().focus().deleteRange({ from, to }).run();
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        processStreamChunk(chunk);
      }

      // Process any remaining text
      if (accumulatedTextRef.current.trim()) {
        const content = convertMarkdownToTiptap(accumulatedTextRef.current);
        if (content.content && content.content.length > 0) {
          editor.chain().focus().insertContent(content).run();
        }
      }

      setCustomPrompt("");
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Content generation cancelled");
      } else {
        console.error("Error generating content:", error);
        toast.error(error instanceof Error ? error.message : "Failed to generate content");
      }
    } finally {
      setIsLoading(false);
      setActiveCommand(null);
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommand('custom');
    }
  };

  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setActiveCommand(null);
    setCustomPrompt("");
    onHide();
  };

  const handlePromptSelect = (prompt: string) => {
    setCustomPrompt(`${prompt} `);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <>
      <Dialog open={show} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl p-0">
          <VisuallyHidden>
            <DialogTitle>HelpDeck AI Assistant</DialogTitle>
          </VisuallyHidden>
          <Command className="rounded-lg border-0" shouldFilter={false}>
            <div className="flex items-center gap-2 border-b px-4 pb-3 pt-4">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-lg font-semibold text-muted-foreground">
                HelpDeck AI
              </span>
            </div>
            <div className="relative px-4 py-3 pb-0">
              <div className="relative flex items-center">
                <CommandInput 
                  ref={inputRef}
                  placeholder={showAiOptions 
                    ? "What would you like me to do with the selected text?" 
                    : isReleaseNotes
                      ? "Ask AI to write your change log..."
                      : "Ask AI to write anything or select one of the options below"
                  }
                  value={customPrompt}
                  onValueChange={setCustomPrompt}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="pr-12"
                />
                {(customPrompt || isLoading) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      disabled={isLoading}
                      onClick={() => handleCommand("custom")}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {showAiOptions ? (
              <CommandList className="max-h-[300px] px-2 py-3">
                <CommandGroup heading="Quick Actions">
                  {AI_COMMANDS.map((command) => (
                    <CommandItem
                      key={command.id}
                      onSelect={() => handleCommand(command.id)}
                      className="flex items-center gap-3 px-4 py-3"
                      disabled={isLoading}
                    >
                      {activeCommand === command.id ? (
                        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
                      ) : (
                        <command.icon className="h-5 w-5 shrink-0 text-primary" />
                      )}
                      <div>
                        <div className="font-medium">{command.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {command.description}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            ) : !isReleaseNotes && (
              <CommandList className="max-h-[400px] px-2 py-3">
                <CommandGroup heading="DRAFT WITH AI">
                  {SAMPLE_PROMPTS.map((prompt, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => handlePromptSelect(prompt.title?.slice(0, -3))}
                      className="flex items-center gap-3 px-4 py-3"
                      disabled={isLoading}
                    >
                      <LightbulbIcon className="h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <div className="font-medium">{prompt.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {prompt.description}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            )}
          </Command>
        </DialogContent>
      </Dialog>
      <TypingIndicator visible={isTyping} />
    </>
  );
}