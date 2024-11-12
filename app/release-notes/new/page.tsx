"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { useReleaseNotes } from "@/hooks/use-release-notes";
import { Editor } from "@/components/articles/editor";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const typeOptions = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
  { value: "patch", label: "Patch" },
] as const;

export default function NewReleaseNotePage() {
  const router = useRouter();
  const { createReleaseNote, isCreating } = useReleaseNotes();
  const [formData, setFormData] = useState({
    title: "",
    version: "",
    description: {},
    type: [] as string[],
  });
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent, status: "draft" | "published") => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.version.trim() || formData.type.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createReleaseNote({
        ...formData,
        status,
        changes: [], // Empty array as we're not using the changes list
      });
      
      router.push("/release-notes");
      router.refresh();
    } catch (error) {
      console.error("Error creating change log:", error);
      toast.error("Failed to create change log");
    }
  };

  const toggleType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter(t => t !== type)
        : [...prev.type, type]
    }));
  };

  return (
    <div className="container max-w-5xl py-4 px-4">
      <div className="mb-4">
        <Link
          href="/release-notes"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Change Logs
        </Link>
      </div>

      <Card className="border-0">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold">New Change Log</h1>
            <p className="text-sm text-muted-foreground">
              Create a new change log to document your changes
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, version: e.target.value }))
                }
                placeholder="e.g., 2.1.0"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Change log title"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Type</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between"
                  >
                    {formData.type.length === 0 
                      ? "Select types..." 
                      : `${formData.type.length} selected`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search types..." />
                    <CommandEmpty>No type found.</CommandEmpty>
                    <CommandGroup>
                      {typeOptions.map((type) => (
                        <CommandItem
                          key={type.value}
                          onSelect={() => toggleType(type.value)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.type.includes(type.value) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {type.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {formData.type.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {formData.type.map(type => (
                    <Badge 
                      key={type}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleType(type)}
                    >
                      {type}
                      <Check className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Editor
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, description: content }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={isCreating}
            >
              Save as Draft
            </Button>
            <Button
              onClick={(e) => handleSubmit(e, "published")}
              disabled={isCreating}
            >
              {isCreating ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}