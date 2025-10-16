import { ProprietarioForm } from "@/components/proprietarios/proprietario-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NovoProprietarioPage() {
  return (
    <div className="">
      <Card className="border-black/10">
        <CardHeader>
          <CardTitle>Novo Proprietário</CardTitle>
          <CardDescription>
            Preencha as informações abaixo para cadastrar um novo proprietário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProprietarioForm />
        </CardContent>
      </Card>
    </div>
  );
}
