"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useCustomizeStore, MenuItem } from "@/stores/customize";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const MAX_MENU_ITEMS = 4;

export function NavigationSettings() {
  const { settings, updateNavigationSettings } = useCustomizeStore();
  const [newItem, setNewItem] = useState({ label: "", url: "" });

  const addMenuItem = () => {
    if (settings.navigation.menuItems.length >= MAX_MENU_ITEMS) {
      toast.error(`Maximum ${MAX_MENU_ITEMS} menu items allowed`);
      return;
    }

    if (newItem.label && newItem.url) {
      const updatedItems = [
        ...settings.navigation.menuItems,
        { ...newItem, id: uuidv4() },
      ];
      updateNavigationSettings({ menuItems: updatedItems });
      setNewItem({ label: "", url: "" });
    }
  };

  const removeMenuItem = (id: string) => {
    const updatedItems = settings.navigation.menuItems.filter(
      (item) => item.id !== id
    );
    updateNavigationSettings({ menuItems: updatedItems });
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    const updatedItems = settings.navigation.menuItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    updateNavigationSettings({ menuItems: updatedItems });
  };

  return (
    <Card>
      <CardContent className="space-y-6 pt-4">
        <Alert className="bg-primary/5 border-primary/10">
          <InfoIcon className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm text-primary">
            Add navigation links to help users quickly access important sections or external resources. 
            These links will appear in the header of your knowledge base.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between">
          <Label>Menu Items</Label>
          <span className="text-sm text-muted-foreground">
            {settings.navigation.menuItems.length}/{MAX_MENU_ITEMS} items
          </span>
        </div>

        <div className="space-y-4">
          {settings.navigation.menuItems.map((item) => (
            <div key={item.id} className="flex items-start gap-2">
              <div className="grid flex-1 gap-2">
                <Input
                  value={item.label}
                  onChange={(e) =>
                    updateMenuItem(item.id, { label: e.target.value })
                  }
                  placeholder="Menu label"
                />
                <Input
                  value={item.url}
                  onChange={(e) =>
                    updateMenuItem(item.id, { url: e.target.value })
                  }
                  placeholder="URL"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMenuItem(item.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {settings.navigation.menuItems.length < MAX_MENU_ITEMS && (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Add Menu Item</Label>
              <Input
                value={newItem.label}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="Menu label"
              />
              <Input
                value={newItem.url}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="URL"
              />
            </div>
            <Button onClick={addMenuItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}