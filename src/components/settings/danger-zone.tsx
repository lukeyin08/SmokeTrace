"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { deleteAccountData } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export function DangerZone() {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState(false);

  async function onConfirm() {
    setDeleting(true);
    const res = await deleteAccountData();
    if (res.error) {
      toast.error(res.error);
      setDeleting(false);
      return;
    }
    toast.success("Your data has been deleted.");
    router.push("/");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" /> Delete my data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete your data?
          </DialogTitle>
          <DialogDescription>
            This permanently removes your cravings, smoking events, triggers,
            contacts, and quit profile, then signs you out. This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? <Spinner /> : null}
            {deleting ? "Deleting…" : "Yes, delete everything"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
