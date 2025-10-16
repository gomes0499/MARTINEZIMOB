import { ProprietariosDataTable } from "@/components/proprietarios/proprietarios-data-table";
import { getProprietarios } from "@/lib/actions/proprietarios";

export default async function ProprietariosPage() {
  const result = await getProprietarios();
  const proprietarios = result.success ? result.data || [] : [];

  return <ProprietariosDataTable initialData={proprietarios} />;
}
