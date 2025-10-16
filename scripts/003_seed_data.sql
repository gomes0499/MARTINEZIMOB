-- Dados de exemplo para desenvolvimento

-- Inserir proprietários de exemplo
INSERT INTO proprietarios (tipo_pessoa, nome, cpf_cnpj, email, telefone, celular, endereco_cep, endereco_logradouro, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, banco, agencia, conta, tipo_conta, pix)
VALUES 
  ('PF', 'João Silva Santos', '123.456.789-00', 'joao.silva@email.com', '(11) 3456-7890', '(11) 98765-4321', '01310-100', 'Avenida Paulista', '1000', 'Bela Vista', 'São Paulo', 'SP', 'Banco do Brasil', '1234-5', '12345-6', 'Conta Corrente', 'joao.silva@email.com'),
  ('PJ', 'Imobiliária Martinez LTDA', '12.345.678/0001-90', 'contato@martinez.com.br', '(11) 3333-4444', '(11) 99999-8888', '01310-200', 'Rua Augusta', '500', 'Consolação', 'São Paulo', 'SP', 'Itaú', '0987-6', '54321-0', 'Conta Corrente', '12.345.678/0001-90');

-- Inserir inquilinos de exemplo
INSERT INTO inquilinos (tipo_pessoa, nome, cpf_cnpj, email, telefone, celular, data_nascimento, estado_civil, profissao, renda_mensal, endereco_cep, endereco_logradouro, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado)
VALUES 
  ('PF', 'Maria Oliveira Costa', '987.654.321-00', 'maria.oliveira@email.com', '(11) 2222-3333', '(11) 97777-6666', '1990-05-15', 'Solteira', 'Engenheira', 8500.00, '04567-890', 'Rua dos Pinheiros', '200', 'Pinheiros', 'São Paulo', 'SP'),
  ('PF', 'Carlos Eduardo Souza', '456.789.123-00', 'carlos.souza@email.com', '(11) 4444-5555', '(11) 96666-5555', '1985-08-20', 'Casado', 'Advogado', 12000.00, '05678-901', 'Rua da Consolação', '300', 'Consolação', 'São Paulo', 'SP');
