import { characters } from "@/data/characters";
import CharDetailPage from "./client";

export function generateStaticParams() {
  return characters.map((c) => ({ charId: c.id }));
}

export default function Page({ params }: { params: Promise<{ charId: string }> }) {
  return <CharDetailPage params={params} />;
}
