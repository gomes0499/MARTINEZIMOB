"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { createContrato } from "@/lib/actions/contratos";

interface ContratoWizardProps {
  onClose?: () => void;
  onSave?: (data: any) => void;
  imoveis: Array<any>;
  inquilinos: Array<any>;
}

export function ContratoWizard({
  onClose,
  onSave,
  imoveis,
  inquilinos,
}: ContratoWizardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Imóvel e Inquilinos
    imovel_id: "",
    inquilino_principal_id: "",
    inquilinos_adicionais: [] as string[],

    // Step 2: Período e Valores
    data_inicio: "",
    data_fim: "",
    valor_aluguel: "",
    valor_condominio: "",
    valor_iptu: "",
    dia_vencimento: "10",

    // Step 3: Reajuste
    tipo_reajuste: "IGPM",
    percentual_reajuste: "",
    periodicidade_reajuste: "12",

    // Step 4: Garantias
    tipo_garantia: "nenhuma",
    valor_caucao: "",
    nome_fiador: "",
    cpf_fiador: "",
    telefone_fiador: "",

    // Step 5: Taxas
    taxa_administracao: "10",
    repasse_proprietario: "90",
    observacoes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    {
      number: 1,
      title: "Imóvel e Inquilinos",
      description: "Selecione o imóvel e os inquilinos",
    },
    {
      number: 2,
      title: "Período e Valores",
      description: "Defina datas e valores do contrato",
    },
    {
      number: 3,
      title: "Reajuste",
      description: "Configure o reajuste do aluguel",
    },
    { number: 4, title: "Garantias", description: "Defina o tipo de garantia" },
    {
      number: 5,
      title: "Taxas e Finalização",
      description: "Configure taxas e finalize",
    },
  ];

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleInquilinoAdicional = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      inquilinos_adicionais: prev.inquilinos_adicionais.includes(id)
        ? prev.inquilinos_adicionais.filter((i) => i !== id)
        : [...prev.inquilinos_adicionais, id],
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.imovel_id) newErrors.imovel_id = "Selecione um imóvel";
      if (!formData.inquilino_principal_id)
        newErrors.inquilino_principal_id = "Selecione o inquilino principal";
    } else if (step === 2) {
      if (!formData.data_inicio)
        newErrors.data_inicio = "Data de início é obrigatória";
      if (!formData.data_fim) newErrors.data_fim = "Data de fim é obrigatória";
      if (!formData.valor_aluguel)
        newErrors.valor_aluguel = "Valor do aluguel é obrigatório";
      if (!formData.dia_vencimento)
        newErrors.dia_vencimento = "Dia de vencimento é obrigatório";
    } else if (step === 4) {
      if (formData.tipo_garantia === "caucao" && !formData.valor_caucao) {
        newErrors.valor_caucao = "Valor da caução é obrigatório";
      }
      if (formData.tipo_garantia === "fianca") {
        if (!formData.nome_fiador)
          newErrors.nome_fiador = "Nome do fiador é obrigatório";
        if (!formData.cpf_fiador)
          newErrors.cpf_fiador = "CPF do fiador é obrigatório";
      }
    } else if (step === 5) {
      if (!formData.taxa_administracao)
        newErrors.taxa_administracao = "Taxa de administração é obrigatória";
      if (!formData.repasse_proprietario)
        newErrors.repasse_proprietario = "Percentual de repasse é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      if (onSave) {
        onSave(formData);
      } else {
        // Modo página - criar contrato diretamente
        // Transformar formData para o formato esperado
        const inquilinosArray = [
          { id: parseInt(formData.inquilino_principal_id), tipo: "principal" },
          ...formData.inquilinos_adicionais.map((id: string) => ({
            id: parseInt(id),
            tipo: "adicional",
          })),
        ];

        const contratoData = {
          imovel_id: parseInt(formData.imovel_id),
          inquilinos: inquilinosArray,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          valor_aluguel: parseFloat(formData.valor_aluguel),
          dia_vencimento: parseInt(formData.dia_vencimento),
          tipo_reajuste: formData.tipo_reajuste,
          indice_reajuste: formData.tipo_reajuste,
          periodicidade_reajuste: parseInt(formData.periodicidade_reajuste),
          tipo_garantia: formData.tipo_garantia,
          valor_garantia: formData.valor_caucao ? parseFloat(formData.valor_caucao) : undefined,
          taxa_administracao: parseFloat(formData.taxa_administracao),
          observacoes: formData.observacoes || undefined,
        };

        const result = await createContrato(contratoData);
        if (result.success) {
          toast({
            title: "Sucesso",
            description: "Contrato criado com sucesso",
          });
          router.push("/contratos");
        } else {
          toast({
            title: "Erro",
            description: result.error || "Erro ao criar contrato",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar contrato",
        variant: "destructive",
      });
    }
  };

  const selectedImovel = imoveis.find((i) => i.id === formData.imovel_id);

  const wizardContent = (
    <>
      {onClose && (
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle>Novo Contrato de Locação</CardTitle>
            <CardDescription>
              Preencha as informações do contrato em etapas
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
      )}

      {/* Progress Steps */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step.number < currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.number === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.number < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="text-xs mt-2 text-center hidden md:block">
                  <div className="font-medium">{step.title}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    step.number < currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <CardContent className="p-6">
        {/* Step 1: Imóvel e Inquilinos */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="imovel">Imóvel *</Label>
              <Select
                value={formData.imovel_id}
                onValueChange={(value) => handleChange("imovel_id", value)}
              >
                <SelectTrigger
                  className={errors.imovel_id ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Selecione o imóvel" />
                </SelectTrigger>
                <SelectContent>
                  {imoveis
                    .filter((i) => i.status === "disponivel")
                    .map((imovel) => (
                      <SelectItem key={imovel.id} value={imovel.id}>
                        {imovel.tipo} - {imovel.endereco_logradouro},{" "}
                        {imovel.endereco_numero} - {imovel.endereco_bairro}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.imovel_id && (
                <p className="text-sm text-red-500">{errors.imovel_id}</p>
              )}
              {selectedImovel && (
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Proprietário</p>
                        <p className="font-medium">
                          {selectedImovel.proprietario_nome}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor Aluguel</p>
                        <p className="font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(selectedImovel.valor_aluguel)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Condomínio</p>
                        <p className="font-medium">
                          {selectedImovel.valor_condominio
                            ? new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(selectedImovel.valor_condominio)
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Características</p>
                        <p className="font-medium">
                          {selectedImovel.quartos}Q • {selectedImovel.banheiros}
                          B • {selectedImovel.vagas_garagem}V
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inquilino_principal">Inquilino Principal *</Label>
              <Select
                value={formData.inquilino_principal_id}
                onValueChange={(value) =>
                  handleChange("inquilino_principal_id", value)
                }
              >
                <SelectTrigger
                  className={
                    errors.inquilino_principal_id ? "border-red-500" : ""
                  }
                >
                  <SelectValue placeholder="Selecione o inquilino principal" />
                </SelectTrigger>
                <SelectContent>
                  {inquilinos
                    .filter((i) => i.ativo)
                    .map((inquilino) => (
                      <SelectItem key={inquilino.id} value={inquilino.id}>
                        {inquilino.nome} - {inquilino.cpf_cnpj}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.inquilino_principal_id && (
                <p className="text-sm text-red-500">
                  {errors.inquilino_principal_id}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Inquilinos Adicionais (Opcional)</Label>
              <Card>
                <CardContent className="pt-6">
                  {inquilinos
                    .filter(
                      (i) => i.ativo && i.id !== formData.inquilino_principal_id
                    )
                    .map((inquilino) => (
                      <div
                        key={inquilino.id}
                        className="flex items-center space-x-2 py-2"
                      >
                        <Checkbox
                          id={`inquilino-${inquilino.id}`}
                          checked={formData.inquilinos_adicionais.includes(
                            inquilino.id
                          )}
                          onCheckedChange={() =>
                            toggleInquilinoAdicional(inquilino.id)
                          }
                        />
                        <label
                          htmlFor={`inquilino-${inquilino.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {inquilino.nome} - {inquilino.cpf_cnpj}
                        </label>
                      </div>
                    ))}
                  {inquilinos.filter(
                    (i) => i.ativo && i.id !== formData.inquilino_principal_id
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhum inquilino adicional disponível
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Período e Valores */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => handleChange("data_inicio", e.target.value)}
                  className={errors.data_inicio ? "border-red-500" : ""}
                />
                {errors.data_inicio && (
                  <p className="text-sm text-red-500">{errors.data_inicio}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_fim">Data de Fim *</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => handleChange("data_fim", e.target.value)}
                  className={errors.data_fim ? "border-red-500" : ""}
                />
                {errors.data_fim && (
                  <p className="text-sm text-red-500">{errors.data_fim}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor_aluguel">Valor do Aluguel *</Label>
                <Input
                  id="valor_aluguel"
                  type="number"
                  step="0.01"
                  value={formData.valor_aluguel}
                  onChange={(e) =>
                    handleChange("valor_aluguel", e.target.value)
                  }
                  placeholder="0.00"
                  className={errors.valor_aluguel ? "border-red-500" : ""}
                />
                {errors.valor_aluguel && (
                  <p className="text-sm text-red-500">{errors.valor_aluguel}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dia_vencimento">Dia de Vencimento *</Label>
                <Select
                  value={formData.dia_vencimento}
                  onValueChange={(value) =>
                    handleChange("dia_vencimento", value)
                  }
                >
                  <SelectTrigger
                    className={errors.dia_vencimento ? "border-red-500" : ""}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        Dia {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dia_vencimento && (
                  <p className="text-sm text-red-500">
                    {errors.dia_vencimento}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor_condominio">Valor do Condomínio</Label>
                <Input
                  id="valor_condominio"
                  type="number"
                  step="0.01"
                  value={formData.valor_condominio}
                  onChange={(e) =>
                    handleChange("valor_condominio", e.target.value)
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_iptu">Valor do IPTU Mensal</Label>
                <Input
                  id="valor_iptu"
                  type="number"
                  step="0.01"
                  value={formData.valor_iptu}
                  onChange={(e) => handleChange("valor_iptu", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Reajuste */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tipo_reajuste">Tipo de Reajuste</Label>
              <Select
                value={formData.tipo_reajuste}
                onValueChange={(value) => handleChange("tipo_reajuste", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IGPM">IGP-M</SelectItem>
                  <SelectItem value="IPCA">IPCA</SelectItem>
                  <SelectItem value="INPC">INPC</SelectItem>
                  <SelectItem value="percentual_fixo">
                    Percentual Fixo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.tipo_reajuste === "percentual_fixo" && (
              <div className="space-y-2">
                <Label htmlFor="percentual_reajuste">
                  Percentual de Reajuste (%)
                </Label>
                <Input
                  id="percentual_reajuste"
                  type="number"
                  step="0.01"
                  value={formData.percentual_reajuste}
                  onChange={(e) =>
                    handleChange("percentual_reajuste", e.target.value)
                  }
                  placeholder="0.00"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="periodicidade_reajuste">
                Periodicidade do Reajuste (meses)
              </Label>
              <Select
                value={formData.periodicidade_reajuste}
                onValueChange={(value) =>
                  handleChange("periodicidade_reajuste", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 meses (Anual)</SelectItem>
                  <SelectItem value="24">24 meses (Bienal)</SelectItem>
                  <SelectItem value="36">36 meses (Trienal)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-900">
                  O reajuste será aplicado automaticamente após o período
                  definido, utilizando o índice{" "}
                  {formData.tipo_reajuste === "percentual_fixo"
                    ? `fixo de ${formData.percentual_reajuste || "0"}%`
                    : formData.tipo_reajuste}{" "}
                  a cada {formData.periodicidade_reajuste} meses.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Garantias */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tipo_garantia">Tipo de Garantia</Label>
              <Select
                value={formData.tipo_garantia}
                onValueChange={(value) => handleChange("tipo_garantia", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhuma">Nenhuma</SelectItem>
                  <SelectItem value="caucao">Caução</SelectItem>
                  <SelectItem value="fianca">Fiança</SelectItem>
                  <SelectItem value="seguro_fianca">Seguro Fiança</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.tipo_garantia === "caucao" && (
              <div className="space-y-2">
                <Label htmlFor="valor_caucao">Valor da Caução *</Label>
                <Input
                  id="valor_caucao"
                  type="number"
                  step="0.01"
                  value={formData.valor_caucao}
                  onChange={(e) => handleChange("valor_caucao", e.target.value)}
                  placeholder="0.00"
                  className={errors.valor_caucao ? "border-red-500" : ""}
                />
                {errors.valor_caucao && (
                  <p className="text-sm text-red-500">{errors.valor_caucao}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Geralmente equivalente a 3 meses de aluguel
                </p>
              </div>
            )}

            {formData.tipo_garantia === "fianca" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_fiador">Nome do Fiador *</Label>
                  <Input
                    id="nome_fiador"
                    value={formData.nome_fiador}
                    onChange={(e) =>
                      handleChange("nome_fiador", e.target.value)
                    }
                    className={errors.nome_fiador ? "border-red-500" : ""}
                  />
                  {errors.nome_fiador && (
                    <p className="text-sm text-red-500">{errors.nome_fiador}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf_fiador">CPF do Fiador *</Label>
                    <Input
                      id="cpf_fiador"
                      value={formData.cpf_fiador}
                      onChange={(e) =>
                        handleChange("cpf_fiador", e.target.value)
                      }
                      placeholder="000.000.000-00"
                      className={errors.cpf_fiador ? "border-red-500" : ""}
                    />
                    {errors.cpf_fiador && (
                      <p className="text-sm text-red-500">
                        {errors.cpf_fiador}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone_fiador">Telefone do Fiador</Label>
                    <Input
                      id="telefone_fiador"
                      value={formData.telefone_fiador}
                      onChange={(e) =>
                        handleChange("telefone_fiador", e.target.value)
                      }
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.tipo_garantia === "seguro_fianca" && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-blue-900">
                    O seguro fiança será contratado junto a uma seguradora. Os
                    dados da apólice devem ser anexados posteriormente na seção
                    de documentos.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 5: Taxas e Finalização */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxa_administracao">
                  Taxa de Administração (%) *
                </Label>
                <Input
                  id="taxa_administracao"
                  type="number"
                  step="0.01"
                  value={formData.taxa_administracao}
                  onChange={(e) =>
                    handleChange("taxa_administracao", e.target.value)
                  }
                  placeholder="10.00"
                  className={errors.taxa_administracao ? "border-red-500" : ""}
                />
                {errors.taxa_administracao && (
                  <p className="text-sm text-red-500">
                    {errors.taxa_administracao}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="repasse_proprietario">
                  Repasse ao Proprietário (%) *
                </Label>
                <Input
                  id="repasse_proprietario"
                  type="number"
                  step="0.01"
                  value={formData.repasse_proprietario}
                  onChange={(e) =>
                    handleChange("repasse_proprietario", e.target.value)
                  }
                  placeholder="90.00"
                  className={
                    errors.repasse_proprietario ? "border-red-500" : ""
                  }
                />
                {errors.repasse_proprietario && (
                  <p className="text-sm text-red-500">
                    {errors.repasse_proprietario}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleChange("observacoes", e.target.value)}
                rows={4}
                placeholder="Informações adicionais sobre o contrato..."
              />
            </div>

            {/* Resumo do Contrato */}
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Contrato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Imóvel</p>
                    <p className="font-medium">
                      {selectedImovel
                        ? `${selectedImovel.tipo} - ${selectedImovel.endereco_logradouro}, ${selectedImovel.endereco_numero}`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Período</p>
                    <p className="font-medium">
                      {formData.data_inicio && formData.data_fim
                        ? `${new Date(formData.data_inicio).toLocaleDateString(
                            "pt-BR"
                          )} até ${new Date(
                            formData.data_fim
                          ).toLocaleDateString("pt-BR")}`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor do Aluguel</p>
                    <p className="font-medium">
                      {formData.valor_aluguel
                        ? new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(Number.parseFloat(formData.valor_aluguel))
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vencimento</p>
                    <p className="font-medium">Dia {formData.dia_vencimento}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tipo de Garantia</p>
                    <p className="font-medium">
                      {formData.tipo_garantia === "nenhuma"
                        ? "Nenhuma"
                        : formData.tipo_garantia === "caucao"
                        ? "Caução"
                        : formData.tipo_garantia === "fianca"
                        ? "Fiança"
                        : "Seguro Fiança"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Taxa de Administração
                    </p>
                    <p className="font-medium">
                      {formData.taxa_administracao}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>

      {/* Navigation Buttons */}
      <div className="p-6 border-t flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        {currentStep < 5 ? (
          <Button onClick={handleNext}>
            Próximo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            <Check className="w-4 h-4 mr-2" />
            Finalizar Contrato
          </Button>
        )}
      </div>
    </>
  );

  // Se tiver onClose, renderiza no modal, senão renderiza direto
  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          {wizardContent}
        </Card>
      </div>
    );
  }

  return wizardContent;
}
