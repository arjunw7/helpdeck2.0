"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSubscribers } from "@/hooks/use-subscribers";
import { Subscriber } from "@/lib/api/subscribers";

interface SubscriberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriber?: Subscriber | null;
}

export function SubscriberModal({ open, onOpenChange, subscriber }: SubscriberModalProps) {
  const { createSubscriber, updateSubscriber, isCreating, isUpdating } = useSubscribers();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    company: "",
  });

  useEffect(() => {
    if (subscriber) {
      setFormData({
        firstName: subscriber.first_name || "",
        lastName: subscriber.last_name || "",
        email: subscriber.email,
        contact: subscriber.contact || "",
        company: subscriber.company || "",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        contact: "",
        company: "",
      });
    }
  }, [subscriber, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (subscriber) {
        await updateSubscriber({
          id: subscriber.id,
          data: formData,
        });
      } else {
        await createSubscriber(formData);
      }
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{subscriber ? "Edit" : "Add"} Subscriber</DialogTitle>
          <DialogDescription>
            {subscriber ? "Update subscriber details" : "Add a new subscriber to your mailing list"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                }
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contact: e.target.value }))
              }
              placeholder="+1234567890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, company: e.target.value }))
              }
              placeholder="Acme Inc."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? "Saving..." : subscriber ? "Save Changes" : "Add Subscriber"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}