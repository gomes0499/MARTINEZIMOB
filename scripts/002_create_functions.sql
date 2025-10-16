-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_proprietarios_updated_at
  BEFORE UPDATE ON proprietarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquilinos_updated_at
  BEFORE UPDATE ON inquilinos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_imoveis_updated_at
  BEFORE UPDATE ON imoveis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contratos_updated_at
  BEFORE UPDATE ON contratos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at
  BEFORE UPDATE ON pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repasses_updated_at
  BEFORE UPDATE ON repasses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documentos_updated_at
  BEFORE UPDATE ON documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular valor total do pagamento
CREATE OR REPLACE FUNCTION calcular_valor_total_pagamento()
RETURNS TRIGGER AS $$
BEGIN
  NEW.valor_total = NEW.valor_original + NEW.valor_multa + NEW.valor_juros - NEW.valor_desconto;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_pagamento_total
  BEFORE INSERT OR UPDATE ON pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_valor_total_pagamento();

-- Função para atualizar status do imóvel quando contrato é criado/encerrado
CREATE OR REPLACE FUNCTION atualizar_status_imovel()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'ativo' THEN
    UPDATE imoveis SET status = 'locado' WHERE id = NEW.imovel_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'ativo' AND NEW.status IN ('encerrado', 'cancelado') THEN
    UPDATE imoveis SET status = 'disponivel' WHERE id = NEW.imovel_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_imovel_status
  AFTER INSERT OR UPDATE ON contratos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_status_imovel();
