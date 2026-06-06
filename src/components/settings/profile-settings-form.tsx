"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { profileSchema } from "@/lib/validations";
import { updateProfile } from "@/app/(app)/settings/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

type Values = z.infer<typeof profileSchema>;

export function ProfileSettingsForm({
  fullName,
  username,
  email,
}: {
  fullName: string;
  username: string;
  email: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const { register, handleSubmit } = useForm<Values>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: fullName, username },
  });

  async function onSubmit(data: Values) {
    setSaving(true);
    const res = await updateProfile(data);
    setSaving(false);
    if (res.error) return toast.error(res.error);
    toast.success("Profile updated.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Email">
        <Input value={email} disabled />
      </Field>
      <Field label="Full name" htmlFor="s-name">
        <Input id="s-name" {...register("full_name")} />
      </Field>
      <Field label="Username" htmlFor="s-username">
        <Input
          id="s-username"
          placeholder="Optional"
          {...register("username")}
        />
      </Field>
      <Button type="submit" disabled={saving}>
        {saving ? <Spinner /> : null}
        {saving ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
