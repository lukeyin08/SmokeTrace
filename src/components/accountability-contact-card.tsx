"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Copy, Mail, MessageSquare, Phone, Trash2, User } from "lucide-react";
import { toast } from "sonner";

import { deleteContact, toggleNotify } from "@/app/(app)/accountability/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { AccountabilityContact } from "@/lib/types";

const PREWRITTEN_MESSAGE =
  "Hey, I'm having a strong craving right now. Can you check in with me for a few minutes?";

export function AccountabilityContactCard({
  contact,
}: {
  contact: AccountabilityContact;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState(false);
  const [notify, setNotify] = React.useState(contact.notify_on_emergency);

  async function onDelete() {
    setDeleting(true);
    const res = await deleteContact(contact.id);
    if (res.error) {
      toast.error(res.error);
      setDeleting(false);
    } else {
      toast.success("Contact removed.");
      router.refresh();
    }
  }

  async function onToggle(value: boolean) {
    setNotify(value);
    const res = await toggleNotify(contact.id, value);
    if (res.error) {
      setNotify(!value);
      toast.error(res.error);
    }
  }

  function copyMessage() {
    navigator.clipboard
      .writeText(PREWRITTEN_MESSAGE)
      .then(() => toast.success("Message copied to clipboard."))
      .catch(() => toast.error("Couldn't copy. Please copy it manually."));
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-medium">{contact.name}</p>
              {contact.relationship && (
                <p className="text-sm text-muted-foreground">
                  {contact.relationship}
                </p>
              )}
              <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                {contact.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {contact.phone}
                  </p>
                )}
                {contact.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {contact.email}
                  </p>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={deleting}
            aria-label="Delete contact"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick reach actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {contact.phone && (
            <Button asChild size="sm" variant="outline">
              <a
                href={`sms:${contact.phone}?body=${encodeURIComponent(
                  PREWRITTEN_MESSAGE
                )}`}
              >
                <MessageSquare className="h-4 w-4" /> Text
              </a>
            </Button>
          )}
          {contact.email && (
            <Button asChild size="sm" variant="outline">
              <a
                href={`mailto:${contact.email}?subject=${encodeURIComponent(
                  "Quick check-in?"
                )}&body=${encodeURIComponent(PREWRITTEN_MESSAGE)}`}
              >
                <Mail className="h-4 w-4" /> Email
              </a>
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={copyMessage}>
            <Copy className="h-4 w-4" /> Copy message
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
          <Label
            htmlFor={`notify-${contact.id}`}
            className="text-sm text-muted-foreground"
          >
            Suggest reaching out in emergencies
          </Label>
          <Switch
            id={`notify-${contact.id}`}
            checked={notify}
            onCheckedChange={onToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
}
