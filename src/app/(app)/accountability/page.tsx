import type { Metadata } from "next";
import { Users, Info } from "lucide-react";

import { requireUser } from "@/lib/supabase/queries";
import type { AccountabilityContact } from "@/lib/types";

import { AccountabilityContactCard } from "@/components/accountability-contact-card";
import { AddContactDialog } from "@/components/add-contact-dialog";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Accountability" };

export default async function AccountabilityPage() {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("accountability_contacts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const contacts = (data ?? []) as AccountabilityContact[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Accountability
          </h1>
          <p className="text-sm text-muted-foreground">
            The people in your corner. One tap to reach out when it counts.
          </p>
        </div>
        <AddContactDialog />
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            SmokeTrace prepares a check-in message and opens your phone's
            text or email, so you stay in control of what's sent. No messages
            are sent on your behalf.
          </p>
        </CardContent>
      </Card>

      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts yet"
          description="Add someone you trust so you're never facing a craving alone."
          action={<AddContactDialog />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {contacts.map((c) => (
            <AccountabilityContactCard key={c.id} contact={c} />
          ))}
        </div>
      )}
    </div>
  );
}
