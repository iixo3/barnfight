import Navbar from "@/widgets/layouts/navbar/navbar";
import ToasterWrapper from "@/widgets/layouts/toaster-wrapper/toaster-wrapper";
import type { Metadata } from "next";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen relative h-full w-full max-w-[1688px] flex flex-col gap-5 mx-auto px-2 lg:px-5">
      <Navbar />
      <ToasterWrapper />
      {children}
    </main>
  );
}
