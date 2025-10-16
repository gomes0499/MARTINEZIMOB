-- Tornar campos opcionais para permitir importação de dados reais

-- Proprietários: telefone opcional
ALTER TABLE proprietarios ALTER COLUMN telefone DROP NOT NULL;

-- Inquilinos: telefone opcional
ALTER TABLE inquilinos ALTER COLUMN telefone DROP NOT NULL;
