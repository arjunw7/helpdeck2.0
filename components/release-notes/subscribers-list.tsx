"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { SubscriberModal } from "./subscriber-modal";
import { Subscriber } from "@/lib/api/subscribers";

interface SubscribersListProps {
  subscribers: Subscriber[];
}

export function SubscribersList({ subscribers }: SubscribersListProps) {
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setShowEditModal(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell>
                  {subscriber.first_name} {subscriber.last_name}
                </TableCell>
                <TableCell>{subscriber.email}</TableCell>
                <TableCell>{subscriber.contact || "-"}</TableCell>
                <TableCell>{subscriber.company || "-"}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(subscriber)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SubscriberModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        subscriber={selectedSubscriber}
      />
    </>
  );
}