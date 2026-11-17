import { Outlet } from "react-router-dom";

import { Toast } from "@/shared/components/Toast";
import { Footer } from "@/shared/layout/Footer";
import { Navbar } from "@/shared/layout/Navbar";

export function MainLayout() {
  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-blue-50 via-white to-amber-50 dark:from-blue-950 dark:via-slate-950 dark:to-slate-950">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
