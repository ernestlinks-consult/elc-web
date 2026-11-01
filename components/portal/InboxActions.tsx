"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  assignMessage,
  setMessageHandled,
  unsubscribeSubscriber,
  type ActionResult,
} from "@/app/(portal)/portal/(staff)/actions";
import { Button, Select, toast } from "@/components/ui";

const nobody = "nobody";

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

export function MessageControls({
  messageId,
  assignedTo,
  handled,
  staff,
  label,
}: {
  messageId: string;
  assignedTo: string | null;
  handled: boolean;
  staff: { id: string; name: string }[];
  label: string;
}) {
  const { pending, save } = useSave();

  return (
    <div className="flex flex-wrap items-end gap-space-2">
      <Select
        label={`Assign ${label}`}
        className="min-w-48"
        value={assignedTo ?? nobody}
        disabled={pending}
        onValueChange={(next) =>
          save(
            () => assignMessage(messageId, next === nobody ? null : next),
            "Message assigned.",
          )
        }
        options={[
          { value: nobody, label: "Unassigned" },
          ...staff.map(({ id, name }) => ({ value: id, label: name })),
        ]}
      />
      <Button
        variant="secondary"
        aria-label={`${handled ? "Reopen" : "Mark handled"}: ${label}`}
        loading={pending}
        loadingText="Saving…"
        onClick={() =>
          save(
            () => setMessageHandled(messageId, !handled),
            handled ? "Message reopened." : "Message marked handled.",
          )
        }
      >
        {handled ? "Reopen" : "Mark handled"}
      </Button>
    </div>
  );
}

export function UnsubscribeButton({
  subscriberId,
  label,
}: {
  subscriberId: string;
  label: string;
}) {
  const { pending, save } = useSave();

  return (
    <Button
      variant="secondary"
      aria-label={`Unsubscribe ${label}`}
      loading={pending}
      loadingText="Saving…"
      onClick={() =>
        save(() => unsubscribeSubscriber(subscriberId), "Number unsubscribed.")
      }
    >
      Unsubscribe
    </Button>
  );
}
