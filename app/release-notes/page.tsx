"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Filter, Plus, FileText } from "lucide-react";
import Link from "next/link";
import { useReleaseNotes } from "@/hooks/use-release-notes";
import { useReleaseNotesStore } from "@/stores/release-notes";
import { ReleaseNotesList } from "@/components/release-notes/release-notes-list";
import { ReleaseNotesListSkeleton } from "@/components/skeletons/release-notes-list-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReleaseNotesPage() {
  const { releaseNotes, isLoading } = useReleaseNotes();
  const {
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    filteredReleaseNotes,
  } = useReleaseNotesStore();

  const filteredResults = filteredReleaseNotes(releaseNotes);

  if (isLoading) {
    return <ReleaseNotesListSkeleton />;
  }

  return (
    <div className="px-[20px] space-y-8">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search change logs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="major">Major</SelectItem>
            <SelectItem value="minor">Minor</SelectItem>
            <SelectItem value="patch">Patch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredResults.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No Change Logs Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery
              ? "No change log match your search criteria."
              : "Get started by creating your first change log."}
          </p>
          {!searchQuery && (
            <Link href="/release-notes/new">
              <Button className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Create Change Log
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <ReleaseNotesList releaseNotes={filteredResults} />
      )}
    </div>
  );
}