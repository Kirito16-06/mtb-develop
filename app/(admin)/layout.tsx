// app/layout.tsx
import AdminDashboardLayout from "@/components/layout/Admindashboardlayout";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
