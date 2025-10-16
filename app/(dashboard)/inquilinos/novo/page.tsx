import { InquilinoForm } from "@/components/inquilinos/inquilino-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NovoInquilinoPage() {
  return (
    <div className="">
      <Card className="border-black/10">
        <CardHeader>
          <CardTitle>Novo Inquilino</CardTitle>
          <CardDescription>
            Preencha as informações abaixo para cadastrar um novo inquilino
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InquilinoForm />
        </CardContent>
      </Card>
    </div>
  );
}
