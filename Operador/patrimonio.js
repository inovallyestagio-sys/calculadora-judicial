class PatrimonioCalculator {
    constructor(container) {
        this.container = container;
        this.mockProcesso = {
            processNumber: '3333333-33.2025.8.11.0003',
            requerentes: ["João Patrimônio"],
            valorHomologado: 50000.00,
            dataCitacao: '2021-06-30', // Data para cálculo dos juros moratórios
            taxaJurosCompensatoriosAnual: 0.06 // 6% a.a. (limite STF)
        };
        // Mock dos bens que compõem o valor homologado
        this.mockPatrimonioData = [
            { dados: 'Imóvel Urbano', valor: 35000.00 },
            { dados: 'Veículo', valor: 15000.00 },
        ];
        // Base de taxas simuladas para os índices
        this.mockIndicesTaxas = {
            'TR': 0.0015,
            'IPCA-E': 0.004,
            'SELIC': 0.009
        };

        this.simularExtracaoHandler = this.simularExtracao.bind(this);
        this.calcularHandler = this.calcularValoresPatrimonio.bind(this);
        this.clearFormHandler = this.clearForm.bind(this);
        this.generateReportHandler = this.generateReport.bind(this);
        this.saveCalculationHandler = this.saveCalculation.bind(this);
        this.updateLegalParametersHandler = this.updateLegalParameters.bind(this);
    }

    static getHtml() {
        return `
            <div id="formFields">
                <div class="mb-8"><p class="text-gray-600">Tipo de Cálculo > Patrimônio</p></div>
                <div class="mb-8"><h3 class="text-xl font-semibold text-primary-blue mb-4">1. Upload e Extração de Dados</h3><div id="uploadArea" class="upload-area p-8 rounded-lg text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-teal transition-colors"><i class="fas fa-cloud-upload-alt text-4xl text-primary-teal mb-4"></i><p class="text-gray-600 mb-2">Clique para simular a extração de dados</p></div></div>
                
                <div class="mb-8"><h3 class="text-xl font-semibold text-primary-blue mb-4">2. Dados do Processo</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Processo nº</label><input type="text" id="processNumber" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Parte Requerente(s)</label><input type="text" id="requerentesInput" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                        <div class="md:col-span-1"><label class="block text-sm font-medium text-gray-700 mb-2">Início</label><input type="text" id="apuracao-inicio" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="mm/aaaa" maxlength="7"></div>
                        <div class="md:col-span-1"><label class="block text-sm font-medium text-gray-700 mb-2">Fim</label><input type="text" id="apuracao-fim" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="mm/aaaa" maxlength="7"></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Valor Homologado</label><input type="text" id="valorHomologado" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                    </div>
                </div>

                <div id="patrimonio-params" class="mb-8">
                    <h3 class="text-xl font-semibold text-primary-blue mb-4">3. Parâmetros do Cálculo Patrimonial</h3>
                    <div class="bg-gray-50 p-6 rounded-lg border space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label class="block text-sm font-medium text-gray-700 mb-2">Dados Patrimoniais (Extraído)</label><input type="text" id="dados-patrimoniais" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                            <div><label class="block text-sm font-medium text-gray-700 mb-2">Lei Aplicada (Automático)</label><input type="text" id="lei-aplicada-param" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                            <div><label class="block text-sm font-medium text-gray-700 mb-2">Índice (Automático)</label><input type="text" id="indice-param" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                            <div><label class="block text-sm font-medium text-gray-700 mb-2">Juros (Automático)</label><input type="text" id="juros-param" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                            <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">Observações do Procurador</label><textarea id="observacoes" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg"></textarea></div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-start mb-8"><button id="calculateBtn" class="bg-secondary-blue hover:bg-primary-blue text-white px-8 py-3 rounded-lg font-semibold"><i class="fas fa-calculator mr-2"></i>Calcular Valor</button></div>
                <hr class="my-8"><div id="results-container"></div>
                <div class="summary-container mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="summary-box bg-white p-6 rounded-lg shadow-lg border"><p class="text-sm text-gray-500 mb-2">VALOR HOMOLOGADO</p><p class="text-2xl font-bold text-primary-blue" id="valorExecutadoSummary">R$ 0,00</p></div>
                    <div class="summary-box bg-white p-6 rounded-lg shadow-lg border"><p class="text-sm text-gray-500 mb-2">VALOR REVISADO</p><p class="text-2xl font-bold text-primary-blue" id="valorAtualizadoSummary">R$ 0,00</p></div>
                    <div class="summary-box bg-white p-6 rounded-lg shadow-lg border"><p class="text-sm text-gray-500 mb-2">DIFERENÇA</p><p class="text-2xl font-bold text-primary-blue" id="proveitoEconomicoSummary">R$ 0,00</p></div>
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

        this.container.querySelector('#apuracao-inicio').addEventListener('change', this.updateLegalParametersHandler);
        this.container.querySelector('#apuracao-fim').addEventListener('change', this.updateLegalParametersHandler);
    }

    destroy() {
        this.uploadArea.removeEventListener('click', this.simularExtracaoHandler);
        this.calculateBtn.removeEventListener('click', this.calcularHandler);
        this.saveBtn.removeEventListener('click', this.saveCalculationHandler);
        this.reportBtn.removeEventListener('click', this.generateReportHandler);
        this.clearBtn.removeEventListener('click', this.clearFormHandler);
    }

    simularExtracao() {
        alert(`Simulando extração de dados para PATRIMÔNIO...`);
        this.container.querySelector('#processNumber').value = this.mockProcesso.processNumber;
        this.container.querySelector('#requerentesInput').value = this.mockProcesso.requerentes.join(', ');
        this.container.querySelector('#valorHomologado').value = this.formatToCurrency(this.mockProcesso.valorHomologado);
        this.container.querySelector('#apuracao-inicio').value = '01/2020';
        this.container.querySelector('#apuracao-fim').value = '09/2025';

        const dadosPatrimoniaisStr = this.mockPatrimonioData.map(p => p.dados).join(', ');
        this.container.querySelector('#dados-patrimoniais').value = dadosPatrimoniaisStr;

        this.updateLegalParameters();
    }

    updateLegalParameters() {
        const inicioStr = this.container.querySelector('#apuracao-inicio').value;
        if (!inicioStr || inicioStr.length < 7) return;
        
        const startDate = this.parseMaskedDate(inicioStr);
        const startYear = startDate.getFullYear();
        
        let lei, indice, jurosMoratorios;

        if (startYear < 2012) {
            lei = 'Lei 9.494/97';
            indice = 'TR';
            jurosMoratorios = '0.5% a.m.';
        } else if (startYear < 2021) {
            lei = 'Lei 11.960/09';
            indice = 'IPCA-E';
            jurosMoratorios = '0.5% a.m.';
        } else {
            lei = 'EC 113/2021';
            indice = 'SELIC';
            jurosMoratorios = 'SELIC';
        }
        
        const jurosCompensatorios = `${this.mockProcesso.taxaJurosCompensatoriosAnual * 100}% a.a.`;

        this.container.querySelector('#lei-aplicada-param').value = lei;
        this.container.querySelector('#indice-param').value = indice;
        this.container.querySelector('#juros-param').value = `Compensatórios: ${jurosCompensatorios} | Moratórios: ${jurosMoratorios}`;
    }

    calcularValoresPatrimonio() {
        const resultsContainer = this.container.querySelector('#results-container');
        resultsContainer.innerHTML = '';

        const inicioStr = this.container.querySelector('#apuracao-inicio').value;
        const fimStr = this.container.querySelector('#apuracao-fim').value;
        const indice = this.container.querySelector('#indice-param').value;

        if (!inicioStr || !fimStr || inicioStr.length < 7 || fimStr.length < 7) {
            alert("Por favor, preencha o Período de Apuração completo.");
            return;
        }

        const startDate = this.parseMaskedDate(inicioStr);
        const endDate = this.parseMaskedDate(fimStr);
        const dataCitacao = new Date(this.mockProcesso.dataCitacao);

        if (!startDate || !endDate || endDate < startDate) {
            alert("A data final do período de apuração deve ser maior ou igual à data inicial.");
            return;
        }
        
        let tableHTML = `<h3 class="text-2xl font-semibold text-primary-blue mb-4">Demonstrativo de Cálculo Patrimonial</h3><div class="overflow-x-auto rounded-lg shadow-lg"><table class="calculation-table w-full border-collapse table-auto"><thead><tr class="bg-gray-200 text-gray-700 uppercase text-xs leading-normal"><th class="py-3 px-4 text-left">Período</th><th class="py-3 px-4 text-left">Dados Patrimoniais</th><th class="py-3 px-4 text-right">VALOR</th><th class="py-3 px-4 text-right">JUROS (%)</th><th class="py-3 px-4 text-right">ÍNDICE</th><th class="py-3 px-4 text-right">VALOR ATUALIZADO</th></tr></thead><tbody id="patrimonio-tbody" class="bg-white text-gray-600 text-sm font-light divide-y divide-gray-200">`;
        
        let totais = { valor: 0, juros: 0, atualizado: 0 };
        const valorHomologado = this.parseCurrency(this.container.querySelector('#valorHomologado').value);

        const taxaCorrecaoMensal = this.mockIndicesTaxas[indice] || 0;
        const taxaJurosCompensatoriosMensal = this.mockProcesso.taxaJurosCompensatoriosAnual / 12;
        const dataInicioJurosMoratorios = new Date(dataCitacao.getFullYear() + 1, 6, 1);

        this.mockPatrimonioData.forEach(item => {
            const numMesesTotal = this.countMonths(startDate, endDate);
            
            const correcaoMonetaria = item.valor * taxaCorrecaoMensal * numMesesTotal;
            const jurosCompensatorios = item.valor * taxaJurosCompensatoriosMensal * numMesesTotal;
            let jurosMoratorios = 0;
            if (endDate > dataInicioJurosMoratorios) {
                const numMesesMora = this.countMonths(dataInicioJurosMoratorios, endDate);
                const taxaJurosMoratorios = this.mockIndicesTaxas['SELIC'];
                jurosMoratorios = item.valor * taxaJurosMoratorios * numMesesMora;
            }

            const jurosTotais = jurosCompensatorios + jurosMoratorios;
            const valorAtualizado = item.valor + correcaoMonetaria + jurosTotais;
            const jurosPercentual = item.valor > 0 ? (jurosTotais / item.valor) * 100 : 0;

            tableHTML += `<tr class="calculation-row">
                <td class="py-3 px-4 text-left">${inicioStr} - ${fimStr}</td>
                <td class="py-3 px-4 text-left">${item.dados}</td>
                <td class="py-3 px-4 text-right">${this.formatToCurrency(item.valor)}</td>
                <td class="py-3 px-4 text-right">${jurosPercentual.toFixed(2)}%</td>
                <td class="py-3 px-4 text-right">${indice}</td>
                <td class="py-3 px-4 text-right font-bold">${this.formatToCurrency(valorAtualizado)}</td>
            </tr>`;
            
            totais.valor += item.valor;
            totais.juros += jurosTotais;
            totais.atualizado += valorAtualizado;
        });
        
        const jurosPercentualTotal = totais.valor > 0 ? (totais.juros / totais.valor) * 100 : 0;

        tableHTML += `</tbody><tfoot>
                        <tr class="bg-gray-100 font-semibold">
                            <td class="py-4 px-4 text-right" colspan="2">Total Geral</td>
                            <td class="py-4 px-4 text-right">${this.formatToCurrency(totais.valor)}</td>
                            <td class="py-4 px-4 text-right">${jurosPercentualTotal.toFixed(2)}%</td>
                            <td class="py-4 px-4 text-right">-</td>
                            <td class="py-4 px-4 text-right">${this.formatToCurrency(totais.atualizado)}</td>
                        </tr>
                      </tfoot></table></div>`;
        
        resultsContainer.innerHTML = tableHTML;
        
        this.container.querySelector('#valorExecutadoSummary').textContent = this.formatToCurrency(valorHomologado);
        this.container.querySelector('#valorAtualizadoSummary').textContent = this.formatToCurrency(totais.atualizado);
        this.container.querySelector('#proveitoEconomicoSummary').textContent = this.formatToCurrency(totais.atualizado - valorHomologado);
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
        const lei = this.container.querySelector('#lei-aplicada-param').value;
        const indice = this.container.querySelector('#indice-param').value;
        const juros = this.container.querySelector('#juros-param').value;
        const observacoes = this.container.querySelector('#observacoes').value;
        const dataCitacaoFmt = new Date(this.mockProcesso.dataCitacao + 'T00:00:00').toLocaleDateString('pt-BR');

        const summaryHTML = `
            <div class="report-summary mt-8 p-4 bg-gray-50 rounded-lg border text-sm" style="page-break-inside: avoid;">
                <h5 class="font-bold mb-2 text-base">Resumo da Metodologia de Cálculo</h5>
                <p class="mb-2">O cálculo para <strong>${requerentes}</strong> foi realizado considerando os seguintes parâmetros:</p>
                <ul class="list-disc list-inside space-y-1 mb-4">
                    <li><strong>Período de Apuração:</strong> ${inicioStr} a ${fimStr}</li>
                    <li><strong>Data de Citação (base para juros moratórios):</strong> ${dataCitacaoFmt}</li>
                    <li><strong>Lei Aplicada:</strong> ${lei}</li>
                    <li><strong>Índice de Correção Monetária:</strong> ${indice}</li>
                    <li><strong>Taxas de Juros Aplicadas:</strong> ${juros}</li>
                </ul>
                <h5 class="font-bold mt-4 mb-2 text-base">Observações do Procurador</h5>
                <p class="whitespace-pre-wrap text-gray-700">${observacoes || 'Nenhuma observação inserida.'}</p>
            </div>`;

        const printArea = document.createElement('div');
        printArea.id = 'print-area';
        const header = `<div class="mb-8 border-b pb-4"><h2 class="text-2xl font-bold">Relatório de Cálculo Patrimonial</h2><p><strong>Processo:</strong> ${this.container.querySelector('#processNumber').value}</p><p><strong>Requerentes:</strong> ${requerentes}</p></div>`;
        
        printArea.innerHTML = header + results.innerHTML + summaryHTML;
        document.body.appendChild(printArea);
        window.print();
        document.body.removeChild(printArea);
    }
    
    clearForm() {
        if (confirm("Tem certeza que deseja limpar todos os dados do cálculo?")) {
            const fieldsToClear = ['#processNumber', '#requerentesInput', '#apuracao-inicio', '#apuracao-fim', '#valorHomologado', '#dados-patrimoniais', '#lei-aplicada-param', '#indice-param', '#juros-param', '#observacoes'];
            fieldsToClear.forEach(id => {
                const el = this.container.querySelector(id);
                if (el) el.value = '';
            });
            
            this.container.querySelector('#results-container').innerHTML = '';
            this.container.querySelector('#valorExecutadoSummary').textContent = 'R$ 0,00';
            this.container.querySelector('#valorAtualizadoSummary').textContent = 'R$ 0,00';
            this.container.querySelector('#proveitoEconomicoSummary').textContent = 'R$ 0,00';
            alert('Formulário limpo com sucesso.');
        }
    }
    
    // Funções utilitárias
    formatToCurrency(v) { return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
    parseCurrency(v) { return typeof v !== 'string' ? (Number(v) || 0) : (Number(v.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.')) || 0); }
    parseMaskedDate(maskedDate) { if (!maskedDate || maskedDate.length < 7) return null; const [month, year] = maskedDate.split('/'); return new Date(year, month - 1, 1); }
    applyDateMask(event) { let input = event.target; let value = input.value.replace(/\D/g, ''); if (value.length > 2) value = `${value.substring(0, 2)}/${value.substring(2, 6)}`; input.value = value; }
    countMonths(start, end) {
        let startDate = (start instanceof Date) ? start : this.parseMaskedDate(start);
        let endDate = (end instanceof Date) ? end : this.parseMaskedDate(end);
        
        if (!startDate || !endDate || endDate < startDate) return 0;
        
        return (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
    }
}