import { entries } from "@/data/entries";
import EntryDetailPage from "./client";

export function generateStaticParams() {
  return entries.map((e) => ({ entryId: e.id }));
}

export default function Page({ params }: { params: Promise<{ entryId: string }> }) {
  return <EntryDetailPage params={params} />;
}
