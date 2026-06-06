"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  accountabilityContactSchema,
  type AccountabilityContactValues,
} from "@/lib/validations";
import { addContact } from "@/app/(app)/accountability/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddContactDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AccountabilityContactValues>({
    resolver: zodResolver(accountabilityContactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      relationship: "",
      notify_on_emergency: false,
    },
  });

  const notify = watch("notify_on_emergency");

  async function onSubmit(data: AccountabilityContactValues) {
    setSubmitting(true);
    const res = await addContact(data);
    setSubmitting(false);
    if (res.error) return toast.error(res.error);
    toast.success("Contact added.");
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Add contact
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add an accountability contact</DialogTitle>
          <DialogDescription>
            Someone who has your back when a craving hits hard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Name" htmlFor="c-name" error={errors.name?.message}>
            <Input id="c-name" placeholder="e.g. Sam" {...register("name")} />
          </Field>
          <Field label="Relationship" htmlFor="c-rel">
            <Input
              id="c-rel"
              placeholder="Partner, friend, sponsor…"
              {...register("relationship")}
            />
          </Field>
          <Field label="Phone" htmlFor="c-phone">
            <Input
              id="c-phone"
              type="tel"
              placeholder="Optional"
              {...register("phone")}
            />
          </Field>
          <Field label="Email" htmlFor="c-email" error={errors.email?.message}>
            <Input
              id="c-email"
              type="email"
              placeholder="Optional"
              {...register("email")}
            />
          </Field>
          <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
            <Label htmlFor="c-notify" className="text-sm">
              Suggest reaching out in emergencies
            </Label>
            <Switch
              id="c-notify"
              checked={notify}
              onCheckedChange={(v) => setValue("notify_on_emergency", v)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Spinner /> : null}
            {submitting ? "Saving…" : "Save contact"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
