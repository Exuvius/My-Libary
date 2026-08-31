import { TabBar } from "@/components/ui/TabBar";
import { Sidebar } from "@/components/ui/Sidebar";

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg-page">
      <Sidebar />
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <TabBar />
    </div>
  );
}
