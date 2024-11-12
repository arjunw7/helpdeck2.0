"use client";

import { useEffect, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Circle, ChevronDown, Trash2, Check, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { useReleaseNotes } from "@/hooks/use-release-notes";
import { Editor } from "@/components/articles/editor";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ReleaseNoteEditSkeleton } from "@/components/skeletons/release-note-edit-skeleton";

const typeOptions = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
  { value: "patch", label: "Patch" },
] as const;

const statusOptions = [
  { value: "published", label: "Published", color: "text-green-500" },
  { value: "draft", label: "Draft", color: "text-gray-500" },
  { value: "archived", label: "Archived", color: "text-red-500" },
] as const;

export default function EditReleaseNotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getReleaseNote, updateReleaseNote, deleteReleaseNote, isUpdating } = useReleaseNotes();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    version: "",
    description: {},
    type: [] as string[],
    status: "draft" as "draft" | "published" | "archived",
    changes: [] as string[],
  });

  useEffect(() => {
    async function fetchReleaseNote() {
      try {
        const note = await getReleaseNote(params.id);
        
        // Parse description if it's a string
        let parsedDescription = note.description;
        if (typeof note.description === 'string') {
          try {
            parsedDescription = JSON.parse(note.description);
          } catch (e) {
            // If parsing fails, create a basic doc structure
            parsedDescription = {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: note.description }]
                }
              ]
            };
          }
        }

        setFormData({
          title: note.title,
          version: note.version,
          description: parsedDescription,
          type: Array.isArray(note.type) ? note.type : [note.type],
          status: note.status,
          changes: note.changes || [],
        });
      } catch (error) {
        toast.error("Failed to load change log");
        router.push("/release-notes");
      } finally {
        setIsLoading(false);
      }
    }
    fetchReleaseNote();
  }, [params.id]);

  if (isLoading) {
    return <ReleaseNoteEditSkeleton />;
  }

  const handleStatusChange = async (newStatus: typeof formData.status) => {
    try {
      await updateReleaseNote({
        id: params.id,
        data: {
          ...formData,
          status: newStatus,
        },
      });
      setFormData(prev => ({ ...prev, status: newStatus }));
      toast.success(`Change log ${newStatus === "archived" ? "archived" : `marked as ${newStatus}`}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update change log status");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReleaseNote(params.id);
      router.push("/release-notes");
    } catch (error) {
      console.error("Error deleting change log:", error);
      toast.error("Failed to delete change log");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.version.trim() || formData.type.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await updateReleaseNote({
        id: params.id,
        data: formData,
      });
      
      router.push("/release-notes");
    } catch (error) {
      console.error("Error updating change log:", error);
      toast.error("Failed to update change log");
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

  const getCurrentStatus = () => {
    return statusOptions.find(option => option.value === formData.status) || statusOptions[1];
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
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Edit Change Log</h1>
              <p className="text-sm text-muted-foreground">
                Update your change log content and settings
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Circle className={cn("h-2 w-2 fill-current", getCurrentStatus().color)} />
                    {getCurrentStatus().label}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {statusOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className="gap-2"
                    >
                      <Circle className={cn("h-2 w-2 fill-current", option.color)} />
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="destructive"
                size="icon"
                type="button"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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
                initialContent={formData.description}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, description: content }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the change log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Change Log
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}