-- Tabela de Proprietários
CREATE TABLE IF NOT EXISTS proprietarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_pessoa VARCHAR(2) NOT NULL CHECK (tipo_pessoa IN ('PF', 'PJ')),
  nome VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  celular VARCHAR(20),
  endereco_cep VARCHAR(9),
  endereco_logradouro VARCHAR(255),
  endereco_numero VARCHAR(20),
  endereco_complemento VARCHAR(100),
  endereco_bairro VARCHAR(100),
  endereco_cidade VARCHAR(100),
  endereco_estado VARCHAR(2),
  banco VARCHAR(100),
  agencia VARCHAR(20),
  conta VARCHAR(30),
  tipo_conta VARCHAR(20),
  pix VARCHAR(255),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Inquilinos
CREATE TABLE IF NOT EXISTS inquilinos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_pessoa VARCHAR(2) NOT NULL CHECK (tipo_pessoa IN ('PF', 'PJ')),
  nome VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  celular VARCHAR(20),
  data_nascimento DATE,
  estado_civil VARCHAR(20),
  profissao VARCHAR(100),
  renda_mensal DECIMAL(10, 2),
  endereco_cep VARCHAR(9),
  endereco_logradouro VARCHAR(255),
  endereco_numero VARCHAR(20),
  endereco_complemento VARCHAR(100),
  endereco_bairro VARCHAR(100),
  endereco_cidade VARCHAR(100),
  endereco_estado VARCHAR(2),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Imóveis
CREATE TABLE IF NOT EXISTS imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proprietario_id UUID NOT NULL REFERENCES proprietarios(id) ON DELETE RESTRICT,
  tipo VARCHAR(50) NOT NULL,
  endereco_cep VARCHAR(9) NOT NULL,
  endereco_logradouro VARCHAR(255) NOT NULL,
  endereco_numero VARCHAR(20) NOT NULL,
  endereco_complemento VARCHAR(100),
  endereco_bairro VARCHAR(100) NOT NULL,
  endereco_cidade VARCHAR(100) NOT NULL,
  endereco_estado VARCHAR(2) NOT NULL,
  area_total DECIMAL(10, 2),
  area_construida DECIMAL(10, 2),
  quartos INTEGER,
  banheiros INTEGER,
  vagas_garagem INTEGER,
  valor_aluguel DECIMAL(10, 2) NOT NULL,
  valor_condominio DECIMAL(10, 2),
  iptu_anual DECIMAL(10, 2),
  iptu_mensal DECIMAL(10, 2),
  conta_agua VARCHAR(50),
  conta_luz VARCHAR(50),
  conta_gas VARCHAR(50),
  status VARCHAR(20) DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'locado', 'manutencao', 'inativo')),
  descricao TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Contratos
CREATE TABLE IF NOT EXISTS contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID NOT NULL REFERENCES imoveis(id) ON DELETE RESTRICT,
  inquilino_principal_id UUID NOT NULL REFERENCES inquilinos(id) ON DELETE RESTRICT,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  valor_aluguel DECIMAL(10, 2) NOT NULL,
  valor_condominio DECIMAL(10, 2),
  valor_iptu DECIMAL(10, 2),
  dia_vencimento INTEGER NOT NULL CHECK (dia_vencimento BETWEEN 1 AND 31),
  tipo_reajuste VARCHAR(20) CHECK (tipo_reajuste IN ('IGPM', 'IPCA', 'INPC', 'percentual_fixo')),
  percentual_reajuste DECIMAL(5, 2),
  periodicidade_reajuste INTEGER,
  tipo_garantia VARCHAR(20) CHECK (tipo_garantia IN ('caucao', 'fianca', 'seguro_fianca', 'nenhuma')),
  valor_caucao DECIMAL(10, 2),
  nome_fiador VARCHAR(255),
  cpf_fiador VARCHAR(14),
  telefone_fiador VARCHAR(20),
  taxa_administracao DECIMAL(5, 2) NOT NULL,
  repasse_proprietario DECIMAL(5, 2) NOT NULL,
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'encerrado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Inquilinos Adicionais (para contratos com múltiplos inquilinos)
CREATE TABLE IF NOT EXISTS contrato_inquilinos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  inquilino_id UUID NOT NULL REFERENCES inquilinos(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contrato_id, inquilino_id)
);

-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE RESTRICT,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('aluguel', 'condominio', 'iptu', 'agua', 'luz', 'gas', 'outros')),
  mes_referencia DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  valor_original DECIMAL(10, 2) NOT NULL,
  valor_pago DECIMAL(10, 2),
  data_pagamento DATE,
  dias_atraso INTEGER DEFAULT 0,
  valor_multa DECIMAL(10, 2) DEFAULT 0,
  valor_juros DECIMAL(10, 2) DEFAULT 0,
  valor_desconto DECIMAL(10, 2) DEFAULT 0,
  valor_total DECIMAL(10, 2),
  forma_pagamento VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Repasses aos Proprietários
CREATE TABLE IF NOT EXISTS repasses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proprietario_id UUID NOT NULL REFERENCES proprietarios(id) ON DELETE RESTRICT,
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE RESTRICT,
  mes_referencia DATE NOT NULL,
  valor_aluguel DECIMAL(10, 2) NOT NULL,
  valor_taxa_administracao DECIMAL(10, 2) NOT NULL,
  valor_descontos DECIMAL(10, 2) DEFAULT 0,
  valor_liquido DECIMAL(10, 2) NOT NULL,
  data_repasse DATE,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Documentos
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_entidade VARCHAR(20) NOT NULL CHECK (tipo_entidade IN ('proprietario', 'inquilino', 'imovel', 'contrato')),
  entidade_id UUID NOT NULL,
  tipo_documento VARCHAR(50) NOT NULL,
  nome_arquivo VARCHAR(255) NOT NULL,
  url_arquivo TEXT NOT NULL,
  tamanho_bytes BIGINT,
  mime_type VARCHAR(100),
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Interações
CREATE TABLE IF NOT EXISTS interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_entidade VARCHAR(20) NOT NULL CHECK (tipo_entidade IN ('proprietario', 'inquilino', 'imovel', 'contrato')),
  entidade_id UUID NOT NULL,
  tipo_interacao VARCHAR(20) NOT NULL CHECK (tipo_interacao IN ('ligacao', 'email', 'whatsapp', 'visita', 'outros')),
  assunto VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  data_interacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario_responsavel VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_proprietarios_cpf_cnpj ON proprietarios(cpf_cnpj);
CREATE INDEX idx_proprietarios_ativo ON proprietarios(ativo);
CREATE INDEX idx_inquilinos_cpf_cnpj ON inquilinos(cpf_cnpj);
CREATE INDEX idx_inquilinos_ativo ON inquilinos(ativo);
CREATE INDEX idx_imoveis_proprietario ON imoveis(proprietario_id);
CREATE INDEX idx_imoveis_status ON imoveis(status);
CREATE INDEX idx_contratos_imovel ON contratos(imovel_id);
CREATE INDEX idx_contratos_inquilino ON contratos(inquilino_principal_id);
CREATE INDEX idx_contratos_status ON contratos(status);
CREATE INDEX idx_pagamentos_contrato ON pagamentos(contrato_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_pagamentos_mes_referencia ON pagamentos(mes_referencia);
CREATE INDEX idx_repasses_proprietario ON repasses(proprietario_id);
CREATE INDEX idx_repasses_mes_referencia ON repasses(mes_referencia);
CREATE INDEX idx_documentos_entidade ON documentos(tipo_entidade, entidade_id);
CREATE INDEX idx_interacoes_entidade ON interacoes(tipo_entidade, entidade_id);
