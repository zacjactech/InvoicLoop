import { Sidebar } from "@/components/features/sidebar";
import { DashboardTopBar } from "@/components/features/dashboard-topbar";
import { ToastProvider } from "@/components/ui/toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="h-screen overflow-hidden p-3 sm:p-4 md:p-6">
        <div className="shell flex h-full w-full overflow-hidden rounded-[32px] shadow-2xl">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <DashboardTopBar />
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 sm:p-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
