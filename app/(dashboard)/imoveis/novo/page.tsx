import { ImovelForm } from "@/components/imoveis/imovel-form";
import { getProprietarios } from "@/lib/actions/proprietarios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NovoImovelPage() {
  const proprietariosResult = await getProprietarios();
  const proprietarios = proprietariosResult.success ? proprietariosResult.data || [] : [];

  return (
    <div className="">
      <Card className="border-black/10">
        <CardHeader>
          <CardTitle>Novo Imóvel</CardTitle>
          <CardDescription>
            Preencha as informações abaixo para cadastrar um novo imóvel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImovelForm proprietarios={proprietarios} />
        </CardContent>
      </Card>
    </div>
  );
}
