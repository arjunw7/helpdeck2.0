"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Plus, Upload, FileText } from "lucide-react";
import { useSubscribers } from "@/hooks/use-subscribers";
import { SubscribersList } from "@/components/release-notes/subscribers-list";
import { SubscriberModal } from "@/components/release-notes/subscriber-modal";
import { ImportSubscribersModal } from "@/components/release-notes/import-subscribers-modal";
import { SubscribersListSkeleton } from "@/components/skeletons/subscribers-list-skeleton";

export default function SubscribersPage() {
  const { subscribers, isLoading } = useSubscribers();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSubscriberModal, setShowSubscriberModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscriber.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscriber.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscriber.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <SubscribersListSkeleton />;
  }

  return (
    <div className="px-[20px] space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subscribers..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            variant="outline"
            onClick={() => setShowImportModal(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button
            onClick={() => setShowSubscriberModal(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Subscriber
          </Button>
        </div>
      </div>

      {filteredSubscribers.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No Subscribers Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery
              ? "No subscribers match your search criteria."
              : "Get started by adding your first subscriber."}
          </p>
          {!searchQuery && (
            <Button
              className="mt-6"
              onClick={() => setShowSubscriberModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Subscriber
            </Button>
          )}
        </Card>
      ) : (
        <SubscribersList subscribers={filteredSubscribers} />
      )}

      <SubscriberModal
        open={showSubscriberModal}
        onOpenChange={setShowSubscriberModal}
      />

      <ImportSubscribersModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
      />
    </div>
  );
}