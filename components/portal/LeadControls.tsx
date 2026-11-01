"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  addLeadNote,
  changeLeadOwner,
  changeLeadStatus,
  resendAcknowledgement,
  type ActionResult,
} from "@/app/(portal)/portal/(staff)/actions";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  Field,
  Select,
  toast,
} from "@/components/ui";
import {
  leadStatuses,
  statusLabels,
  type LeadStatus,
} from "@/lib/portal/filters";

const unassigned = "unassigned";

function useSave() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function save(run: () => Promise<ActionResult>, success: string) {
    startTransition(async () => {
      try {
        const result = await run();
        if (result.ok) {
          toast(success);
          router.refresh();
        } else {
          toast(result.message, "error");
        }
      } catch {
        toast("Couldn't save. Check your connection and try again.", "error");
      }
    });
  }

  return { pending, save };
}

export function LeadStatusControl({
  leadId,
  status,
}: {
  leadId: string;
  status: LeadStatus;
}) {
  const { pending, save } = useSave();
  const [closing, setClosing] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function change(next: string) {
    if (next === "closed") {
      setError(null);
      setClosing(true);
      return;
    }
    save(
      () => changeLeadStatus({ leadId, status: next as LeadStatus }),
      `Status changed to ${statusLabels[next as LeadStatus]}.`,
    );
  }

  function close() {
    if (!reason.trim()) {
      setError("Give a reason for closing this lead.");
      return;
    }
    setClosing(false);
    save(
      () => changeLeadStatus({ leadId, status: "closed", closedReason: reason }),
      "Lead closed.",
    );
  }

  return (
    <>
      <Select
        label="Status"
        value={status}
        disabled={pending}
        onValueChange={change}
        options={leadStatuses.map((value) => ({
          value,
          label: statusLabels[value],
        }))}
      />
      <Dialog open={closing} onOpenChange={setClosing}>
        <DialogContent title="Close this lead">
          <Field
            multiline
            rows={3}
            label="Reason"
            required
            value={reason}
            error={error ?? undefined}
            onChange={(event) => setReason(event.target.value)}
          />
          <div className="flex flex-wrap justify-end gap-space-2">
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={close}>Close lead</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function LeadOwnerControl({
  leadId,
  ownerId,
  staff,
}: {
  leadId: string;
  ownerId: string | null;
  staff: { id: string; name: string }[];
}) {
  const { pending, save } = useSave();

  return (
    <Select
      label="Owner"
      value={ownerId ?? unassigned}
      disabled={pending}
      onValueChange={(next) =>
        save(
          () =>
            changeLeadOwner({
              leadId,
              ownerId: next === unassigned ? null : next,
            }),
          "Owner changed.",
        )
      }
      options={[
        { value: unassigned, label: "Unassigned" },
        ...staff.map(({ id, name }) => ({ value: id, label: name })),
      ]}
    />
  );
}

export function LeadNoteForm({ leadId }: { leadId: string }) {
  const { pending, save } = useSave();
  const [text, setText] = useState("");

  function submit() {
    if (!text.trim()) return;
    const note = text;
    setText("");
    save(() => addLeadNote({ leadId, text: note }), "Note added.");
  }

  return (
    <div className="flex flex-col gap-space-2">
      <Field
        multiline
        rows={3}
        label="Add a note"
        placeholder="e.g. Called, will bring documents Monday"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <Button
        variant="secondary"
        className="self-start"
        loading={pending}
        loadingText="Saving…"
        onClick={submit}
      >
        Save note
      </Button>
    </div>
  );
}

export function ResendSmsButton({ leadId }: { leadId: string }) {
  const { pending, save } = useSave();

  return (
    <Button
      variant="secondary"
      loading={pending}
      loadingText="Queuing…"
      onClick={() =>
        save(() => resendAcknowledgement(leadId), "Acknowledgement SMS queued.")
      }
    >
      Resend acknowledgement SMS
    </Button>
  );
}
