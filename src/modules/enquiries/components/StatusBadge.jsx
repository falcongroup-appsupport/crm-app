import { Badge } from "../../../shared/components/ui/Badge";
import { STATUS_STYLES, STATUS_LABEL, PROJECT_STATUS_LABEL } from "../constants/enquiryStatus";

export function StatusBadge({ status, className }) {
  if (!status) {
    return (
      <Badge
        tone="bg-ink-50 text-ink-400 ring-1 ring-inset ring-ink-100 dark:bg-ink-800 dark:text-ink-500 dark:ring-ink-700"
        className={className}
      >
        Not set
      </Badge>
    );
  }
  return (
    <Badge tone={STATUS_STYLES[status] ?? STATUS_STYLES.SELECT} className={className}>
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
}

export function ProjectStatusPill({ status }) {
  return (
    <Badge tone="bg-ink-50 text-ink-600 ring-1 ring-inset ring-ink-100 dark:bg-ink-800 dark:text-ink-300 dark:ring-ink-700">
      {status ? (PROJECT_STATUS_LABEL[status] ?? status) : "Not set"}
    </Badge>
  );
}
