"use client";

import DashboardProvider from "@/providers/DashboardProvider";

export default function DashboardLayout({ children }) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
