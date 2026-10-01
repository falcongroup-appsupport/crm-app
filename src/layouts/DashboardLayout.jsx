import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar, MobileSidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Breadcrumbs } from "./components/Breadcrumbs";

function titleFor(pathname) {
  if (pathname === "/") return "Dashboard";
  if (pathname.match(/^\/enquiries\/[^/]+\/quotation/)) return "Quotation";
  if (pathname.match(/^\/quotations\/[^/]+\/edit/)) return "Edit quotation";
  if (pathname.startsWith("/quotations/")) return "Quotation";
  if (pathname.startsWith("/quotations")) return "Sales quotations";
  if (pathname.startsWith("/follow-ups")) return "Sales follow-ups";
  if (pathname.startsWith("/quotation-templates")) return "Quotation templates";
  if (pathname.startsWith("/enquiries/new")) return "Enquiry registration";
  if (pathname.match(/\/enquiries\/.+\/edit/)) return "Edit enquiry";
  if (pathname.match(/\/enquiries\/.+/)) return "Enquiry view";
  if (pathname.startsWith("/enquiries")) return "Enquiries";
  if (pathname.startsWith("/requests/")) return "Site visit request";
  if (pathname.startsWith("/requests")) return "Internal requests";
  if (pathname.startsWith("/activities")) return "Activity master";
  return "Falcon Survey Engineering";
}

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-paper dark:bg-ink-950">
      <Sidebar collapsed={collapsed} onExpand={() => setCollapsed(false)} />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={titleFor(pathname)}
          onMenuClick={() => setMobileOpen(true)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full">
            <div className="mb-4">
              <Breadcrumbs />
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
