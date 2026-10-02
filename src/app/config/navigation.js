import {
  LayoutDashboard,
  Inbox,
  BadgeDollarSign,
  FolderKanban,
  CalendarRange,
  MapPin,
  PencilRuler,
  Receipt,
  Database,
} from "lucide-react";

export const NAV_DASHBOARD = {
  label: "Dashboard",
  icon: LayoutDashboard,
  to: "/dashboard",
};

export const NAV_GROUPS = [
  {
    label: "Enquiry",
    icon: Inbox,
    items: [
      { label: "Enquiry Registration", to: "/enquiries" },
      { label: "Internal Requests", to: "/requests" },
    ],
  },
  {
    label: "Sales",
    icon: BadgeDollarSign,
    items: [
      { label: "Sales Quotation", to: "/quotations" },
      { label: "Sales Orders", to: "/coming-soon/sales-orders" },
      { label: "Direct Sales", to: "/coming-soon/direct-sales" },
      { label: "Sales Follow Up", to: "/follow-ups" },
    ],
  },
  {
    label: "Project Management",
    icon: FolderKanban,
    items: [
      { label: "Project Dashboard", to: "/coming-soon/project-dashboard" },
      { label: "Register Comments", to: "/coming-soon/register-comments" },
      {
        label: "Generate Completion Letter",
        to: "/coming-soon/completion-letter",
      },
      {
        label: "Resource Manager",
        to: "/coming-soon/resource-manager-projects",
      },
    ],
  },
  {
    label: "Planning Management",
    icon: CalendarRange,
    items: [
      { label: "Project Dashboard", to: "/coming-soon/planning-dashboard" },
      {
        label: "Resource Manager",
        to: "/coming-soon/resource-manager-planning",
      },
    ],
  },
  {
    label: "Site Management",
    icon: MapPin,
    items: [
      { label: "Today's Schedules", to: "/coming-soon/todays-schedules" },
      { label: "Site Visit Log", to: "/coming-soon/site-visit-log" },
      { label: "Material Request", to: "/coming-soon/material-request" },
      { label: "Monthly & Weekly Hiring", to: "/coming-soon/hiring" },
    ],
  },
  {
    label: "Design Management",
    icon: PencilRuler,
    items: [
      { label: "Projects Dashboard", to: "/coming-soon/design-dashboard" },
      {
        label: "Cloud Point Register",
        to: "/coming-soon/cloud-point-register",
      },
      {
        label: "Setting-Out Register",
        to: "/coming-soon/setting-out-register",
      },
      { label: "QA/QC Register", to: "/coming-soon/qaqc-register" },
      { label: "Production Manager", to: "/coming-soon/production-manager" },
      { label: "Create Certificates", to: "/coming-soon/create-certificates" },
    ],
  },
  {
    label: "Billing Management",
    icon: Receipt,
    items: [
      { label: "Invoice Requests", to: "/coming-soon/invoice-requests" },
      { label: "Payment Tracking", to: "/coming-soon/payment-tracking" },
    ],
  },
  {
    label: "Masters",
    icon: Database,
    items: [
      { label: "Customer Master", to: "/coming-soon/customer-master" },
      { label: "Activity Master", to: "/activities" },
      { label: "UOM", to: "/coming-soon/uom-master" },
      { label: "Resource Master", to: "/coming-soon/resource-master" },
      { label: "Quotation Master", to: "/quotation-templates" },
      {
        label: "Survey Report Master",
        to: "/coming-soon/survey-report-master",
      },
      { label: "Benchmark Master", to: "/coming-soon/benchmark-master" },
      { label: "Project Master", to: "/coming-soon/project-master" },
    ],
  },
];
