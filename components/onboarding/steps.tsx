"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { OrganizationForm } from "./organization-form";
import { ProfileForm } from "./profile-form";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Steps() {
  const [step, setStep] = useState(1);
  const [organizationData, setOrganizationData] = useState({
    name: "",
    logo: "",
  });

  const handleOrganizationSubmit = (data: typeof organizationData) => {
    setOrganizationData(data);
    setStep(2);
  };

  const title = step === 1 ? "Setup Your Organization" : "Complete Your Profile";

  return (
    <Dialog open={true}>
      <DialogContent
        className="max-h-[90vh] max-w-2xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Step {step} of 2
            </p>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round((step / 2) * 100)}% completed
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        <ScrollArea className="max-h-[calc(90vh-10rem)]">
          {step === 1 ? (
            <OrganizationForm onSubmit={handleOrganizationSubmit} />
          ) : (
            <ProfileForm organizationData={organizationData} />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}