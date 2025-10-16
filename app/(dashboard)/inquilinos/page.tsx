import { InquilinosDataTable } from "@/components/inquilinos/inquilinos-data-table";
import { getInquilinos } from "@/lib/actions/inquilinos";

export default async function InquilinosPage() {
  const result = await getInquilinos();
  const inquilinos = result.success ? result.data || [] : [];

  return <InquilinosDataTable initialData={inquilinos} />;
}
