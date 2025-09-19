# INOVACALC - Sistema de Cálculos Judiciais

## 1. Visão Geral do Projeto
O **INOVACALC** é um protótipo de aplicação web (SaaS) projetado para a **Procuradoria Geral do Município de Várzea Grande**, com o objetivo de modernizar e automatizar a elaboração de cálculos judiciais.  

O sistema substitui um fluxo de trabalho manual baseado em planilhas Excel e consultas a múltiplos sistemas, como **PJE** e **SAJ**.  

A arquitetura é baseada em uma **Single-Page Application (SPA)**, construída com **HTML**, **CSS (Tailwind CSS)** e **JavaScript puro**, com design modular para fácil expansão a novos tipos de cálculo.

---

## 2. Arquitetura e Funcionalidades Globais
- **Estrutura Modular**: cada tipo de cálculo é implementado como uma classe JavaScript independente, carregada dinamicamente.  
- **Simulação de Extração de Dados**: preenchimento automático de formulários a partir de uploads de documentos processuais.  
- **Consulta a Sistemas Externos (Simulada)**: integração simulada com sistemas como Turmalina para obtenção de holerites.  
- **Geração de Relatórios**: criação de relatórios finais (Despacho/Memória de Cálculo) prontos para impressão.  

---

## 3. Perfis de Acesso e Permissões
- **Administrador**
  - Gerencia usuários e permissões.  
  - Configura parâmetros do sistema (índices, tabelas, etc.).  
  - Acesso total para criar, editar, visualizar e auditar cálculos.  

- **Gestor**
  - Valida e aprova cálculos.  
  - Consulta e exporta relatórios consolidados.  
  - Acompanha métricas e desempenho.  

- **Operador de Cálculos**
  - Insere dados e executa cálculos.  
  - Salva e envia para revisão do gestor.  
  - Consulta cálculos já realizados (sem permissão de exclusão).  

---

## 4. Módulos de Cálculo e Regras de Negócio

### 4.1. Enquadramento Trabalhista
- Calcula diferenças salariais decorrentes de reclassificação de cargo/nível.  
- Fórmula: **Diferença = Valor Devido - Valor Recebido**.  
- Valor devido é obtido de tabelas salariais parametrizadas.  
- Valor recebido é extraído (simulado) de holerites.  
- Calcula reflexos em 13º salário e férias.  
- Aplica índices de correção e juros conforme período (TR, IPCA-E, SELIC).  
- Alerta para prescrição quinquenal.  

### 4.2. Patrimônio
- Atualização monetária de bens (ex.: desapropriações).  
- Índice de correção definido automaticamente (TR, IPCA-E, SELIC).  
- Cálculo de **juros compensatórios** (máx. 6% a.a., conforme STF).  
- Cálculo de **juros moratórios** (aplicados a partir de 1º de julho do ano seguinte).  
- Inclusão de honorários e valor do perito no montante final.  

### 4.3. Trabalhista
- Cálculo mensal para verbas trabalhistas (insalubridade, periculosidade etc.).  
- Regra de Preenchimento: para períodos anteriores a 2004, o sistema não consulta dados do turmalina, precisa de preenchimento manual.  
- Permite multa e honorários conforme Art. 523 do CPC.  

### 4.4. Fiscal
- Correção monetária de débitos fiscais **por ano**.  
- Índice de correção determinado automaticamente conforme período.  
- Correção aplicada até a "Data da Correção".  

### 4.5. Cível (Precatórios e RPV)
- Atualização de dívidas da Fazenda Pública.  
- Aplica cadeia de índices (TR → IPCA-E → SELIC).  
- Parametrização de juros de mora e tipo da dívida (tributária/não tributária).  

### 4.6. Processos Administrativos
- Verificação de verbas rescisórias já pagas.  
- Exibe tabela de pagamentos realizados e verbas pendentes.  
- Permite justificativa textual e gera despacho para impressão.  

---

## 5. Como Executar o Protótipo
1. Certifique-se de que todos os arquivos (`.html`, `.css`, `.js`) estão na mesma pasta.  
2. Abra o arquivo **`index.html`** em um navegador web moderno.  

---

📌 **Status do Projeto**: Protótipo em desenvolvimento para validação de fluxo de cálculo.  
