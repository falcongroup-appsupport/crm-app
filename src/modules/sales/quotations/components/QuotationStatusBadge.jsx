import { Badge } from "../../../../shared/components/ui/Badge";
import {
  QUOTATION_STATUS_STYLES,
  quotationStatusLabel,
} from "../constants/quotationConstants";

export function QuotationStatusBadge({ status, className }) {
  return (
    <Badge
      tone={QUOTATION_STATUS_STYLES[status] ?? QUOTATION_STATUS_STYLES.DRAFT}
      className={className}
    >
      {quotationStatusLabel(status)}
    </Badge>
  );
}
