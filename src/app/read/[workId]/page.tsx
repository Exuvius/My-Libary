import { dataWorks } from "@/data/library/works";
import ReadPage from "./client";

export function generateStaticParams() {
  return dataWorks.map((w) => ({ workId: w.id }));
}

export default function Page({ params }: { params: Promise<{ workId: string }> }) {
  return <ReadPage params={params} />;
}
