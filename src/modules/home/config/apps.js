// Launcher tiles. `ready` = the module has real screens; the rest open the
// shared "coming soon" page until they're built. Routes match the sidebar.
export const LAUNCHER_APPS = [
  { key: "dashboard", label: "Dashboard", to: "/dashboard", icon: "dashboard", ready: true },
  { key: "enquiries", label: "Enquiries", to: "/enquiries", icon: "enquiries", ready: true },
  { key: "quotations", label: "Quotations", to: "/quotations", icon: "quotations", ready: true },
  { key: "followUps", label: "Follow-ups", to: "/follow-ups", icon: "followUps", ready: true },
  { key: "requests", label: "Internal Requests", to: "/requests", icon: "requests", ready: true },
  { key: "salesOrders", label: "Sales Orders", to: "/coming-soon/sales-orders", icon: "salesOrders" },

  { key: "directSales", label: "Direct Sales", to: "/coming-soon/direct-sales", icon: "directSales" },
  { key: "projects", label: "Projects", to: "/coming-soon/project-dashboard", icon: "projects" },
  // { key: "comments", label: "Comments", to: "/coming-soon/register-comments", icon: "comments" },
  { key: "completionLetters", label: "Completion Letters", to: "/coming-soon/completion-letter", icon: "completionLetters" },
  { key: "planning", label: "Planning", to: "/coming-soon/planning-dashboard", icon: "planning" },
  { key: "schedules", label: "Site Schedules", to: "/coming-soon/todays-schedules", icon: "schedules" },

  { key: "siteVisits", label: "Site Visits", to: "/coming-soon/site-visit-log", icon: "siteVisits" },
  // { key: "materials", label: "Material Requests", to: "/coming-soon/material-request", icon: "materials" },
  { key: "hiring", label: "Hiring", to: "/coming-soon/hiring", icon: "hiring" },
  { key: "design", label: "Design", to: "/coming-soon/design-dashboard", icon: "design" },
  // { key: "pointClouds", label: "Point Clouds", to: "/coming-soon/cloud-point-register", icon: "pointClouds" },
  { key: "settingOut", label: "Setting-Out", to: "/coming-soon/setting-out-register", icon: "settingOut" },

  { key: "qaqc", label: "QA / QC", to: "/coming-soon/qaqc-register", icon: "qaqc" },
  { key: "certificates", label: "Certificates", to: "/coming-soon/create-certificates", icon: "certificates" },
  { key: "production", label: "Production", to: "/coming-soon/production-manager", icon: "production" },
  { key: "invoices", label: "Invoices", to: "/coming-soon/invoice-requests", icon: "invoices" },
  { key: "payments", label: "Payments", to: "/coming-soon/payment-tracking", icon: "payments" },
  { key: "customers", label: "Customers", to: "/coming-soon/customer-master", icon: "customers" },

  { key: "activities", label: "Activities", to: "/activities", icon: "activities", ready: true },
  { key: "templates", label: "Quote Templates", to: "/quotation-templates", icon: "templates", ready: true },
  // { key: "resources", label: "Resources", to: "/coming-soon/resource-master", icon: "resources" },
  { key: "surveyReports", label: "Survey Reports", to: "/coming-soon/survey-report-master", icon: "surveyReports" },
  // { key: "benchmarks", label: "Benchmarks", to: "/coming-soon/benchmark-master", icon: "benchmarks" },
  // { key: "uom", label: "Units (UOM)", to: "/coming-soon/uom-master", icon: "uom" },
];
