# INOVACALC - Sistema de Cálculos Judiciais

## 1. Visão Geral do Projeto

[cite_start]O **INOVACALC** é um protótipo de uma aplicação web (SaaS) projetada para a **Procuradoria Geral do Município de Várzea Grande**[cite: 146, 147], com o objetivo de modernizar e automatizar a elaboração de cálculos judiciais. [cite_start]O sistema substitui um fluxo de trabalho anteriormente manual, baseado em planilhas Excel [cite: 83] [cite_start]e consultas a múltiplos sistemas, como PJE e SAJ. [cite: 8, 10]

A arquitetura é baseada em uma **Single-Page Application (SPA)**, construída com HTML, CSS (Tailwind CSS) e JavaScript puro, com um design modular que permite a fácil expansão para novos tipos de cálculo.

## 2. Arquitetura e Funcionalidades Globais

- **Estrutura Modular:** Cada tipo de cálculo é uma classe JavaScript independente, carregada dinamicamente.
- [cite_start]**Simulação de Extração de Dados:** Todos os módulos simulam a extração de dados-chave de um processo via upload[cite: 288, 332, 436], preenchendo o formulário para agilizar o trabalho.
- [cite_start]**Consulta a Sistemas Externos (Simulada):** O sistema simula consultas a fontes de dados como o **Sistema Turmalina** para buscar informações de pagamento (holerites) de servidores. [cite: 130, 141, 194]
- [cite_start]**Geração de Relatórios:** Todos os módulos permitem a geração de um relatório final (Despacho/Memória de Cálculo) para impressão [cite: 2][cite_start], contendo o detalhamento do cálculo e um resumo da metodologia aplicada. [cite: 284, 285, 286]

## 3. Perfis de Acesso e Permissões

[cite_start]O sistema foi projetado para acomodar diferentes perfis de usuário, cada um com permissões específicas: [cite: 148]

* **Administrador:**
    * [cite_start]Gerencia usuários e permissões de acesso. [cite: 148]
    * [cite_start]Configura parâmetros gerais do sistema (índices, tabelas, etc.). [cite: 148]
    * [cite_start]Possui acesso total para criar, editar, visualizar e auditar todos os cálculos. [cite: 148]
* **Gestor:**
    * [cite_start]Valida e aprova cálculos realizados pelos operadores. [cite: 148]
    * [cite_start]Consulta e exporta relatórios consolidados. [cite: 148]
    * [cite_start]Acompanha métricas e desempenho. [cite: 148]
* **Operador de Cálculos:**
    * [cite_start]Insere dados e executa cálculos a partir de modelos pré-configurados. [cite: 148]
    * [cite_start]Salva e envia cálculos para revisão do gestor. [cite: 148]
    * [cite_start]Pode consultar cálculos já realizados, mas sem permissão para alterar ou excluir. [cite: 148, 151]

## 4. Módulos de Cálculo e Regras de Negócio

### 4.1. Enquadramento Trabalhista

* [cite_start]**Objetivo:** Calcular diferenças salariais devidas a um servidor por reclassificação de cargo ou nível. [cite: 4]
* **Regras de Negócio Executadas:**
    * [cite_start]O cálculo é realizado **mês a mês** com base no período solicitado no processo. [cite: 125, 124]
    * [cite_start]A "Diferença" é apurada pela fórmula: `Valor Devido - Valor Recebido`. [cite: 127]
    * [cite_start]O **Valor Devido** é obtido de tabelas salariais parametrizadas, de acordo com a Lei, Nível e Classe do servidor para cada período. [cite: 33, 126, 199]
    * [cite_start]O **Valor Recebido** é consultado no holerite do servidor (simulação do sistema Turmalina). [cite: 130]
    * [cite_start]O sistema calcula **"Reflexos"** sobre as diferenças para verbas como 13º Salário e 1/3 de Férias. [cite: 84, 91]
    * [cite_start]Aplica **índices de correção e juros** automaticamente com base na data de cada mês, seguindo a cronologia de índices judiciais (TR, IPCA-E, SELIC). [cite: 137]
    * [cite_start]Deve possuir um alerta ou tratamento para **períodos prescritos** (prescrição quinquenal). [cite: 282]

### 4.2. Patrimônio

* **Objetivo:** Atualizar monetariamente o valor de bens em processos como desapropriações.
* **Regras de Negócio Executadas:**
    * [cite_start]O cálculo é baseado em itens patrimoniais individuais (ex: imóvel, veículo). [cite: 336]
    * [cite_start]O **índice de correção** (TR, IPCA-E, SELIC) é determinado automaticamente com base no período do cálculo. [cite: 352, 353]
    * O sistema calcula e aplica dois tipos de juros distintos:
        * [cite_start]**Juros Compensatórios:** Com base em um percentual sugerido (máx. 6% a.a. - STF). [cite: 354, 356]
        * [cite_start]**Juros Moratórios:** Aplicados somente a partir de 1º de julho do ano seguinte à citação, conforme regra de precatórios. [cite: 357, 358]
    * [cite_start]Permite a inclusão de **Honorários** e **Valor do Perito** ao montante final. [cite: 351]

### 4.3. Trabalhista (Genérico)

* **Objetivo:** Apurar diferenças de verbas trabalhistas diversas não pagas ou pagas a menor.
* **Regras de Negócio Executadas:**
    * [cite_start]Cálculo mensal para uma lista de "eventos" selecionáveis (Insalubridade, Periculosidade, etc.). [cite: 302, 303, 304]
    * [cite_start]Possui uma regra específica para **URV**: para períodos anteriores a 2004, o usuário informa manualmente o "Valor Recebido", e a diferença é calculada aplicando o índice de 11,98%. [cite: 320, 321]
    * Inclui a opção de aplicar **Multa (ex: 10%) e Honorários (ex: 10%)** sobre o valor total, conforme Art. [cite_start]523 do CPC. [cite: 317]

### 4.4. Fiscal

* **Objetivo:** Realizar a correção monetária de débitos fiscais.
* **Regras de Negócio Executadas:**
    * [cite_start]O cálculo é realizado por **ano**, não por mês. [cite: 445]
    * [cite_start]O **índice de correção** é determinado automaticamente com base no período da dívida. [cite: 434, 441]
    * [cite_start]A correção é aplicada desde o ano do débito até a "Data da Correção" informada. [cite: 435]

### 4.5. Cível (Precatórios e RPV)

* **Objetivo:** Atualizar dívidas da Fazenda Pública, respeitando as regras para pagamento via Precatório ou RPV.
* **Regras de Negócio Executadas:**
    * [cite_start]Diferencia os campos **Credor** e **Devedor**. [cite: 404, 411]
    * [cite_start]Aplica a cadeia de **índices de correção automática (TR → IPCA-E → SELIC)** com base na data, conforme a jurisprudência consolidada. [cite: 137, 362, 363, 364, 365, 366]
    * [cite_start]Permite a parametrização de **Juros de Mora**, **Tipo da Dívida** (Tributária/Não Tributária) e outras regras específicas de precatórios. [cite: 409, 414]

### 4.6. Processos Administrativos

* **Objetivo:** Funcionar como uma ferramenta de verificação de pagamentos e geração de despachos.
* **Regras de Negócio Executadas:**
    * [cite_start]O usuário seleciona as **verbas rescisórias** que deseja verificar. [cite: 475]
    * [cite_start]O sistema simula uma consulta para verificar quais verbas já foram pagas. [cite: 479]
    * [cite_start]Apresenta uma tabela com os valores pagos encontrados e um resumo das **verbas pendentes de pagamento**. [cite: 495]
    * [cite_start]Permite a inserção de uma **justificativa textual** (Detalhamento do Cálculo). [cite: 496]
    * [cite_start]Gera um **despacho** para impressão com todas essas informações. [cite: 499, 500]

## 5. Futuras Implementações

O protótipo estabelece a base para um sistema robusto. Os próximos passos incluem:

1.  **Backend e Banco de Dados:** Substituir os dados `mock` por uma aplicação backend com banco de dados para persistência e segurança.
2.  **Módulo Administrativo:**
    * [cite_start]**Gestão de Usuários:** Implementar a tela de cadastro e gerenciamento de usuários e perfis de acesso. [cite: 148]
    * [cite_start]**Gestão de Tabelas Salariais:** Criar uma interface onde o administrador possa cadastrar e manter as Leis, Cargos, Níveis, Classes e Salários para o cálculo de Enquadramento. [cite: 161, 162, 163, 164, 165]
3.  [cite_start]**Integração Real:** Conectar o sistema a APIs de serviços reais como PJE, SAJ e Turmalina. [cite: 8, 10, 141]

## 6. Como Executar o Protótipo

1.  Garanta que todos os arquivos (`.html`, `.css`, `.js`) estejam na mesma pasta.
2.  Abra o arquivo `index.html` em um navegador web moderno.
