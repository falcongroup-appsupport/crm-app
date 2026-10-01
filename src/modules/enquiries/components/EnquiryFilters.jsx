import { TaskFilterDrawer } from "../../../shared/components/ui/TaskFilterDrawer";
import { ENQUIRY_FILTER_TASKS } from "../constants/enquiryStatus";

export function EnquiryFilters({ open, onClose, activeTasks, onApply }) {
  return (
    <TaskFilterDrawer
      open={open}
      onClose={onClose}
      tasks={ENQUIRY_FILTER_TASKS}
      activeTasks={activeTasks}
      onApply={onApply}
      note="*Default view: pending enquiries — sales quotations not yet submitted."
    />
  );
}
