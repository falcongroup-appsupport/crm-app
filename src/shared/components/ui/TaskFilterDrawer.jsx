import { useState } from "react";
import { Drawer } from "./Drawer";
import { Button } from "./Button";
import { Checkbox } from "../forms/Checkbox";

/**
 * "Filter by task" checklist shown in a right-hand slide-over. The draft
 * selection is only committed when Apply is pressed; closing discards it.
 */
export function TaskFilterDrawer({ open, onClose, title = "Filter by task", tasks, activeTasks, onApply, note }) {
  const [draft, setDraft] = useState(activeTasks);
  const [wasOpen, setWasOpen] = useState(open);

  // Re-seed the draft from the applied filters each time the drawer opens.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(activeTasks);
  }

  const toggle = (key) => setDraft((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      subtitle="Pick one or more tasks to narrow the list"
      width="max-w-sm"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDraft([])}>
            Clear
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => onApply(draft)}>
              Apply
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-1">
        {tasks.map((task) => (
          <div key={task.key} className="rounded-lg px-2 py-2 hover:bg-ink-50 dark:hover:bg-ink-800">
            <Checkbox label={task.label} checked={draft.includes(task.key)} onChange={() => toggle(task.key)} />
          </div>
        ))}
      </div>
      {note && <p className="mt-5 text-xs italic text-ink-400">{note}</p>}
    </Drawer>
  );
}
