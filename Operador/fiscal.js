class FiscalCalculator {
    constructor(container) {
        this.container = container;
        
        // Mock de dados para simulação
        this.mockProcesso = { 
            processNumber: '4444444-44.2025.8.11.0004', 
            requerentes: ["Empresa ABC Ltda"],
            valorAcao: 15000.00,
            inicioPeriodo: '01/2022',
            fimPeriodo: '12/2023',
            dataCorrecao: '2025-09-16',
            honorariosPercent: 10 // Agora em percentual
        };
        
        // Mock de valores anuais que seriam extraídos do processo
        this.mockValoresAnuais = [
            { ano: 2022, valor: 5800.00 },
            { ano: 2023, valor: 3200.00 }
        ];

        // Mock de taxas para simulação de cálculo
        this.mockIndicesTaxas = {
            'SELIC': { taxa: 0.009, nome: 'SELIC' } // Taxa mensal simulada para SELIC
        };

        this.simularExtracaoHandler = this.simularExtracao.bind(this);
        this.calcularHandler = this.calcularValoresFiscais.bind(this);
        this.clearFormHandler = this.clearForm.bind(this);
        this.generateReportHandler = this.generateReport.bind(this);
        this.saveCalculationHandler = this.saveCalculation.bind(this);
        this.updateParametersHandler = this.updateParameters.bind(this);
    }

    static getHtml() {
        return `
            <div id="formFields">
                <div class="mb-8"><p class="text-gray-600">Tipo de Cálculo > Fiscal</p></div>
                <div class="mb-8"><h3 class="text-xl font-semibold text-primary-blue mb-4">1. Upload e Extração de Dados</h3><div id="uploadArea" class="upload-area p-8 rounded-lg text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-teal transition-colors"><i class="fas fa-cloud-upload-alt text-4xl text-primary-teal mb-4"></i><p class="text-gray-600 mb-2">Clique para simular a extração de dados</p></div></div>
                
                <div class="mb-8"><h3 class="text-xl font-semibold text-primary-blue mb-4">2. Dados do Processo</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Processo nº</label><input type="text" id="processNumber" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Parte Requerente</label><input type="text" id="requerentesInput" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Valor da Ação R$</label><input type="text" id="valorAcao" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                        <div></div> <div><label class="block text-sm font-medium text-gray-700 mb-2">Início</label><input type="text" id="apuracao-inicio" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="mm/aaaa" maxlength="7"></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Fim</label><input type="text" id="apuracao-fim" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="mm/aaaa" maxlength="7"></div>
                    </div>
                </div>

                <div id="fiscal-params" class="mb-8">
                    <h3 class="text-xl font-semibold text-primary-blue mb-4">3. Parâmetros do Cálculo</h3>
                    <div class="bg-gray-50 p-6 rounded-lg border grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div><label class="block text-sm font-medium text-gray-700 mb-2">Data da Correção</label><input type="date" id="dataCorrecao" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></div>
                         <div><label class="block text-sm font-medium text-gray-700 mb-2">Índice (Automático)</label><input type="text" id="indice-param" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                         <div><label class="block text-sm font-medium text-gray-700 mb-2">Honorários (%)</label><input type="number" id="honorarios-percent" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: 10"></div>
                    </div>
                </div>

                <div class="flex justify-start mb-8"><button id="calculateBtn" class="bg-secondary-blue hover:bg-primary-blue text-white px-8 py-3 rounded-lg font-semibold"><i class="fas fa-calculator mr-2"></i>Calcular Valor</button></div>
                <hr class="my-8"><div id="results-container"></div>
                <div class="summary-container mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="summary-box bg-white p-6 rounded-lg shadow-lg border"><p class="text-sm text-gray-500 mb-2">VALOR DA AÇÃO</p><p class="text-2xl font-bold text-primary-blue" id="valorAcaoSummary">R$ 0,00</p></div>
                    <div class="summary-box bg-white p-6 rounded-lg shadow-lg border"><p class="text-sm text-gray-500 mb-2">VALOR DEVIDO</p><p class="text-2xl font-bold text-primary-blue" id="valorDevidoSummary">R$ 0,00</p></div>
                    <div class="summary-box bg-white p-6 rounded-lg shadow-lg border"><p class="text-sm text-gray-500 mb-2">DIFERENÇA</p><p class="text-2xl font-bold text-primary-blue" id="diferencaSummary">R$ 0,00</p></div>
                </div>
                <div class="flex flex-wrap gap-4 justify-center mt-8 no-print">
                    <button id="saveBtn" class="bg-secondary-blue hover:bg-primary-blue text-white px-8 py-3 rounded-lg font-semibold"><i class="fas fa-save mr-2"></i>Salvar Cálculo</button>
                    <button id="reportBtn" class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold"><i class="fas fa-file-pdf mr-2"></i>Gerar Relatório</button>
                    <button id="clearBtn" class="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold"><i class="fas fa-eraser mr-2"></i>Limpar Formulário</button>
                </div>
            </div>`;
    }

    init() {
        this.uploadArea = this.container.querySelector('#uploadArea');
        this.calculateBtn = this.container.querySelector('#calculateBtn');
        this.saveBtn = this.container.querySelector('#saveBtn');
        this.reportBtn = this.container.querySelector('#reportBtn');
        this.clearBtn = this.container.querySelector('#clearBtn');
        
        this.uploadArea.addEventListener('click', this.simularExtracaoHandler);
        this.calculateBtn.addEventListener('click', this.calcularHandler);
        this.saveBtn.addEventListener('click', this.saveCalculationHandler);
        this.reportBtn.addEventListener('click', this.generateReportHandler);
        this.clearBtn.addEventListener('click', this.clearFormHandler);
        
        this.container.querySelector('#apuracao-inicio').addEventListener('change', this.updateParametersHandler);
        this.container.querySelector('#apuracao-fim').addEventListener('change', this.updateParametersHandler);
    }

    destroy() {
        this.uploadArea.removeEventListener('click', this.simularExtracaoHandler);
        this.calculateBtn.removeEventListener('click', this.calcularHandler);
        this.saveBtn.removeEventListener('click', this.saveCalculationHandler);
        this.reportBtn.removeEventListener('click', this.generateReportHandler);
        this.clearBtn.removeEventListener('click', this.clearFormHandler);
    }
    
    simularExtracao() {
        alert(`Simulando extração de dados para CÁLCULO FISCAL...`);
        this.container.querySelector('#processNumber').value = this.mockProcesso.processNumber;
        this.container.querySelector('#requerentesInput').value = this.mockProcesso.requerentes.join(', ');
        this.container.querySelector('#valorAcao').value = this.formatToCurrency(this.mockProcesso.valorAcao);
        this.container.querySelector('#apuracao-inicio').value = this.mockProcesso.inicioPeriodo;
        this.container.querySelector('#apuracao-fim').value = this.mockProcesso.fimPeriodo;
        this.container.querySelector('#dataCorrecao').value = this.mockProcesso.dataCorrecao;
        this.container.querySelector('#honorarios-percent').value = this.mockProcesso.honorariosPercent;

        this.updateParameters();
    }
    
    updateParameters() {
        const inicioStr = this.container.querySelector('#apuracao-inicio').value;
        if (!inicioStr || inicioStr.length < 7) return;
        this.container.querySelector('#indice-param').value = 'SELIC';
    }

    calcularValoresFiscais() {
        const resultsContainer = this.container.querySelector('#results-container');
        resultsContainer.innerHTML = '';

        const inicioStr = this.container.querySelector('#apuracao-inicio').value;
        const fimStr = this.container.querySelector('#apuracao-fim').value;
        const dataCorrecaoStr = this.container.querySelector('#dataCorrecao').value;
        const indice = this.container.querySelector('#indice-param').value;
        const honorariosPercent = this.container.querySelector('#honorarios-percent').valueAsNumber || 0;

        if (!inicioStr || !fimStr || !dataCorrecaoStr) {
            alert("Por favor, preencha o período de apuração (Início e Fim) e a Data da Correção.");
            return;
        }

        const startYear = this.parseMaskedDate(inicioStr).getFullYear();
        const endYear = this.parseMaskedDate(fimStr).getFullYear();
        const dataCorrecao = new Date(dataCorrecaoStr + 'T00:00:00Z');

        let tableHTML = `<h3 class="text-2xl font-semibold text-primary-blue mb-4">Demonstrativo de Cálculo Fiscal</h3><div class="overflow-x-auto rounded-lg shadow-lg"><table class="calculation-table w-full border-collapse table-auto"><thead><tr class="bg-gray-200 text-gray-700 uppercase text-xs leading-normal"><th class="py-3 px-4 text-left">ANO</th><th class="py-3 px-4 text-right">VALOR</th><th class="py-3 px-4 text-right">JUROS (%)</th><th class="py-3 px-4 text-right">ÍNDICE</th><th class="py-3 px-4 text-right">VALOR ATUALIZADO</th></tr></thead><tbody id="fiscal-tbody" class="bg-white text-gray-600 text-sm font-light divide-y divide-gray-200">`;
        
        let totais = { valor: 0, atualizado: 0 };
        const indiceInfo = this.mockIndicesTaxas[indice];
        if (!indiceInfo) {
            alert(`Índice de cálculo "${indice}" não reconhecido.`);
            return;
        }

        for (let ano = startYear; ano <= endYear; ano++) {
            const item = this.mockValoresAnuais.find(v => v.ano === ano);
            if (!item) continue;

            const valorBase = item.valor;
            const dataFimDoAno = new Date(ano, 11, 31);
            const mesesParaCorrecao = this.countMonths(dataFimDoAno, dataCorrecao);

            const jurosAcumulados = valorBase * indiceInfo.taxa * mesesParaCorrecao;
            const valorAtualizado = valorBase + jurosAcumulados;

            totais.valor += valorBase;
            totais.atualizado += valorAtualizado;

            tableHTML += `
                <tr class="calculation-row">
                    <td class="py-3 px-4 text-left">${ano}</td>
                    <td class="py-3 px-4 text-right">${this.formatToCurrency(valorBase)}</td>
                    <td class="py-3 px-4 text-right">${(indiceInfo.taxa * 100).toFixed(2)}% a.m.</td>
                    <td class="py-3 px-4 text-right">${indiceInfo.nome}</td>
                    <td class="py-3 px-4 text-right font-bold">${this.formatToCurrency(valorAtualizado)}</td>
                </tr>`;
        }
        
        const valorHonorarios = totais.atualizado * (honorariosPercent / 100);
        const totalDevido = totais.atualizado + valorHonorarios;

        tableHTML += `</tbody><tfoot>
                        <tr class="bg-gray-100 font-semibold text-sm">
                            <td class="py-2 px-4 text-right">Subtotal</td>
                            <td class="py-2 px-4 text-right">${this.formatToCurrency(totais.valor)}</td>
                            <td class="py-2 px-4 text-right" colspan="2"></td>
                            <td class="py-2 px-4 text-right">${this.formatToCurrency(totais.atualizado)}</td>
                        </tr>
                        <tr class="bg-gray-100 font-semibold text-sm">
                            <td class="py-2 px-4 text-right" colspan="4">Honorários (${honorariosPercent.toFixed(2)}%)</td>
                            <td class="py-2 px-4 text-right">${this.formatToCurrency(valorHonorarios)}</td>
                        </tr>
                        <tr class="bg-gray-200 text-gray-800 font-bold">
                            <td class="py-3 px-4 text-right" colspan="4">Total Geral Devido</td>
                            <td class="py-3 px-4 text-right">${this.formatToCurrency(totalDevido)}</td>
                        </tr>
                      </tfoot></table></div>`;
        
        resultsContainer.innerHTML = tableHTML;
        
        const valorAcao = this.parseCurrency(this.container.querySelector('#valorAcao').value);
        this.container.querySelector('#valorAcaoSummary').textContent = this.formatToCurrency(valorAcao);
        this.container.querySelector('#valorDevidoSummary').textContent = this.formatToCurrency(totalDevido);
        this.container.querySelector('#diferencaSummary').textContent = this.formatToCurrency(totalDevido - valorAcao);
    }
    
    saveCalculation() { alert('Funcionalidade "Salvar Cálculo" em desenvolvimento.'); }
    
    generateReport() {
        const results = this.container.querySelector('#results-container');
        if (!results.innerHTML.trim()) {
            alert("É necessário calcular os valores antes de gerar um relatório.");
            return;
        }

        const requerentes = this.container.querySelector('#requerentesInput').value;
        const inicioStr = this.container.querySelector('#apuracao-inicio').value;
        const fimStr = this.container.querySelector('#apuracao-fim').value;
        const dataCorrecao = new Date(this.container.querySelector('#dataCorrecao').value + 'T00:00:00').toLocaleDateString('pt-BR');
        const indice = this.container.querySelector('#indice-param').value;
        const honorariosPercent = this.container.querySelector('#honorarios-percent').value;

        const summaryHTML = `
            <div class="report-summary mt-8 p-4 bg-gray-50 rounded-lg border text-sm" style="page-break-inside: avoid;">
                <h5 class="font-bold mb-2 text-base">Resumo da Metodologia de Cálculo</h5>
                <p class="mb-2">O cálculo fiscal para <strong>${requerentes}</strong> foi realizado considerando os seguintes parâmetros:</p>
                <ul class="list-disc list-inside space-y-1 mb-4">
                    <li><strong>Período de Apuração:</strong> ${inicioStr} a ${fimStr}</li>
                    <li><strong>Data da Correção Monetária:</strong> ${dataCorrecao}</li>
                    <li><strong>Índice Aplicado:</strong> ${indice}</li>
                    <li><strong>Honorários Adicionais:</strong> ${honorariosPercent}%</li>
                </ul>
            </div>`;
        
        const printArea = document.createElement('div');
        printArea.id = 'print-area';
        const header = `<div class="mb-8 border-b pb-4"><h2 class="text-2xl font-bold">Relatório de Cálculo Fiscal</h2><p><strong>Processo:</strong> ${this.container.querySelector('#processNumber').value}</p><p><strong>Requerentes:</strong> ${requerentes}</p></div>`;
        
        printArea.innerHTML = header + results.innerHTML + summaryHTML;
        document.body.appendChild(printArea);
        window.print();
        document.body.removeChild(printArea);
    }
    
    clearForm() {
        if (confirm("Tem certeza que deseja limpar todos os dados do cálculo?")) {
            const fields = ['#processNumber', '#requerentesInput', '#valorAcao', '#apuracao-inicio', '#apuracao-fim', '#dataCorrecao', '#indice-param', '#honorarios-percent'];
            fields.forEach(id => this.container.querySelector(id).value = '');
            
            this.container.querySelector('#results-container').innerHTML = '';
            this.container.querySelector('#valorAcaoSummary').textContent = 'R$ 0,00';
            this.container.querySelector('#valorDevidoSummary').textContent = 'R$ 0,00';
            this.container.querySelector('#diferencaSummary').textContent = 'R$ 0,00';
            alert('Formulário limpo com sucesso.');
        }
    }
    
    // Funções utilitárias
    formatToCurrency(v) { return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
    parseCurrency(v) { return typeof v !== 'string' ? (Number(v) || 0) : (Number(v.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.')) || 0); }
    applyDateMask(event) { let input = event.target; let value = input.value.replace(/\D/g, ''); if (value.length > 2) value = `${value.substring(0, 2)}/${value.substring(2, 6)}`; input.value = value; }
    parseMaskedDate(maskedDate) { if (!maskedDate || maskedDate.length < 7) return null; const [month, year] = maskedDate.split('/'); return new Date(year, month - 1, 1); }
    countMonths(start, end) {
        if (!(start instanceof Date)) return;
        if (!(end instanceof Date)) return;
        if (!start || !end || end < start) return 0;
        return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    }
}