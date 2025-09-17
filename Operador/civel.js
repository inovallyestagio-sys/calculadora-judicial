class CivelCalculator {
    constructor(container) {
        this.container = container;

        this.mockProcesso = {
            processNumber: '5555555-55.2025.8.11.0005',
            credor: "Maria Joaquina de Amaral Pereira",
            devedor: "Estado de Mato Grosso",
            valorDivida: 150000.00,
            modalidadePagamento: 'RPV',
            leiArtigo: 'automatico', // Padrão para RPV
            jurosMora: '6',
            incidenciaJurosJulho: 'sim',
            tipoDivida: 'Não Tributária',
            dataInicioCalculo: '2014-06-15',
            honorariosPercent: 10,
            dataPagamento: '2025-10-20'
        };

        this.mockIndicesTaxas = {
            'SELIC': { taxa: 0.009, nome: 'SELIC' },
            'IPCA-E': { taxa: 0.004, nome: 'IPCA-E' },
            'TR': { taxa: 0.0015, nome: 'TR' }
        };

        this.simularExtracaoHandler = this.simularExtracao.bind(this);
        this.calcularHandler = this.calcularValoresCivel.bind(this);
        this.clearFormHandler = this.clearForm.bind(this);
        this.generateReportHandler = this.generateReport.bind(this);
        this.saveCalculationHandler = this.saveCalculation.bind(this);
        this.updateParametersHandler = this.updateParameters.bind(this);
    }

    static getHtml() {
        return `
            <div id="formFields">
                <div class="mb-8"><p class="text-gray-600">Tipo de Cálculo > Cível</p></div>
                <div class="mb-8"><h3 class="text-xl font-semibold text-primary-blue mb-4">1. Upload e Extração de Dados</h3><div id="uploadArea" class="upload-area p-8 rounded-lg text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-teal transition-colors"><i class="fas fa-cloud-upload-alt text-4xl text-primary-teal mb-4"></i><p class="text-gray-600 mb-2">Clique para simular a extração de dados</p></div></div>
                
                <div class="mb-8"><h3 class="text-xl font-semibold text-primary-blue mb-4">2. Dados do Processo</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Processo nº</label><input type="text" id="processNumber" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Valor da Dívida R$</label><input type="text" id="valorDivida" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Credor</label><input type="text" id="requerentesInput" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Devedor</label><input type="text" id="devedor" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                    </div>
                </div>

                <div id="civel-params" class="mb-8">
                    <h3 class="text-xl font-semibold text-primary-blue mb-4">3. Parâmetros do Cálculo</h3>
                    <div class="bg-gray-50 p-6 rounded-lg border space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-start">
                            <div class="md:col-span-3">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Modalidade</label>
                                <div class="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                                    <label class="flex items-center"><input type="radio" name="modalidadePagamento" value="Comum" class="mr-2">Comum / Outros</label>
                                    <label class="flex items-center"><input type="radio" name="modalidadePagamento" value="RPV" class="mr-2">RPV</label>
                                    <label class="flex items-center"><input type="radio" name="modalidadePagamento" value="Precatório" class="mr-2" checked>Precatório</label>
                                </div>
                            </div>
                            <div>
                                <label id="leiArtigoLabel" class="block text-sm font-medium text-gray-700 mb-2">Regra de Correção</label>
                                <select id="leiArtigo" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="automatico">Automático (TR -> IPCA-E -> SELIC)</option>
                                    <option value="EC 113/2021">EC 113/2021 (SELIC)</option>
                                    <option value="IPCA-E (2017-2021)">IPCA-E + Juros</option>
                                    <option value="TR (2009-2017)">TR + Juros</option>
                                </select>
                            </div>
                            <div><label class="block text-sm font-medium text-gray-700 mb-2">Índice Aplicado</label><input type="text" id="indice-param" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                            <div><label class="block text-sm font-medium text-gray-700 mb-2">Juros de Mora (%)</label><input type="number" id="jurosMora" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: 6"></div>
                            <div class="md:col-span-1">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo da Dívida</label>
                                <div class="flex space-x-4 mt-2"><label class="flex items-center"><input type="radio" name="tipoDivida" value="Tributária" class="mr-2">Tributária</label><label class="flex items-center"><input type="radio" name="tipoDivida" value="Não Tributária" class="mr-2" checked>Não Tributária</label></div>
                            </div>
                             <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Incidência de Juros de 1º a julho (anterior)?</label>
                                <div class="flex space-x-4 mt-2"><label class="flex items-center"><input type="radio" name="incidenciaJuros" value="sim" class="mr-2">Sim</label><label class="flex items-center"><input type="radio" name="incidenciaJuros" value="nao" class="mr-2" checked>Não</label></div>
                            </div>
                            <div><label class="block text-sm font-medium text-gray-700 mb-2">Data Início do Cálculo</label><input type="date" id="dataInicioCalculo" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></div>
                            <div><label class="block text-sm font-medium text-gray-700 mb-2">Data Final (Data do Pagamento)</label><input type="date" id="dataPagamento" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></div>
                            <div><label class="block text-sm font-medium text-gray-700 mb-2">Honorários (%)</label><input type="number" id="honorarios-percent" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: 10"></div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-start mb-8"><button id="calculateBtn" class="bg-secondary-blue hover:bg-primary-blue text-white px-8 py-3 rounded-lg font-semibold"><i class="fas fa-calculator mr-2"></i>Gerar Cálculo</button></div>
                <hr class="my-8">
                
                <div id="results-container"></div>

                <div class="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-lg mt-8 mb-6">
                    <p class="font-bold">Valor Final Devido (Total a Pagar)</p>
                    <p id="valorFinalDevido" class="text-3xl font-bold mt-2">R$ 0,00</p>
                </div>

                <div class="mt-6">
                     <label class="block text-sm font-medium text-gray-700 mb-2">Notas / Observações</label>
                     <textarea id="notas" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
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
        this.leiArtigoSelect = this.container.querySelector('#leiArtigo');

        this.uploadArea.addEventListener('click', this.simularExtracaoHandler);
        this.calculateBtn.addEventListener('click', this.calcularHandler);
        this.saveBtn.addEventListener('click', this.saveCalculationHandler);
        this.reportBtn.addEventListener('click', this.generateReportHandler);
        this.clearBtn.addEventListener('click', this.clearFormHandler);

        this.leiArtigoSelect.addEventListener('change', this.updateParametersHandler);
        this.container.querySelectorAll('input[name="modalidadePagamento"]').forEach(radio => {
            radio.addEventListener('change', this.updateParametersHandler);
        });
    }

    destroy() {
        this.uploadArea.removeEventListener('click', this.simularExtracaoHandler);
        this.calculateBtn.removeEventListener('click', this.calcularHandler);
        this.saveBtn.removeEventListener('click', this.saveCalculationHandler);
        this.reportBtn.removeEventListener('click', this.generateReportHandler);
        this.clearBtn.removeEventListener('click', this.clearFormHandler);
        this.leiArtigoSelect.removeEventListener('change', this.updateParametersHandler);
        this.container.querySelectorAll('input[name="modalidadePagamento"]').forEach(radio => {
            radio.removeEventListener('change', this.updateParametersHandler);
        });
    }

    simularExtracao() {
        alert(`Simulando extração de dados para CÁLCULO CÍVEL...`);
        this.container.querySelector('#processNumber').value = this.mockProcesso.processNumber;
        this.container.querySelector('#requerentesInput').value = this.mockProcesso.credor;
        this.container.querySelector('#devedor').value = this.mockProcesso.devedor;
        this.container.querySelector('#valorDivida').value = this.formatToCurrency(this.mockProcesso.valorDivida);
        this.container.querySelector(`input[name="modalidadePagamento"][value="${this.mockProcesso.modalidadePagamento}"]`).checked = true;
        this.container.querySelector('#jurosMora').value = this.mockProcesso.jurosMora;
        this.container.querySelector(`input[name="incidenciaJuros"][value="${this.mockProcesso.incidenciaJurosJulho}"]`).checked = true;
        this.container.querySelector(`input[name="tipoDivida"][value="${this.mockProcesso.tipoDivida}"]`).checked = true;
        this.container.querySelector('#dataInicioCalculo').value = this.mockProcesso.dataInicioCalculo;
        this.container.querySelector('#dataPagamento').value = this.mockProcesso.dataPagamento;
        this.container.querySelector('#honorarios-percent').value = this.mockProcesso.honorariosPercent;

        this.updateParameters();
    }

    updateParameters() {
        const modalidade = this.container.querySelector('input[name="modalidadePagamento"]:checked').value;
        const leiArtigoSelect = this.container.querySelector('#leiArtigo');
        const indiceInput = this.container.querySelector('#indice-param');

        if (modalidade === 'RPV') {
            leiArtigoSelect.value = 'EC 113/2021';
        } else { // Para RPV e Comum, o padrão é o cálculo automático em cadeia
            leiArtigoSelect.value = 'automatico';
        }

        const lei = leiArtigoSelect.value;
        if (lei === 'automatico') {
            indiceInput.value = "Automático (TR/IPCA-E/SELIC)";
        } else if (lei.includes('SELIC')) {
            indiceInput.value = 'SELIC';
        } else if (lei.includes('IPCA-E')) {
            indiceInput.value = 'IPCA-E';
        } else if (lei.includes('TR')) {
            indiceInput.value = 'TR';
        }
    }

    calcularValoresCivel() {
        const resultsContainer = this.container.querySelector('#results-container');
        resultsContainer.innerHTML = '';

        const valorDivida = this.parseCurrency(this.container.querySelector('#valorDivida').value);
        const honorariosPercent = this.container.querySelector('#honorarios-percent').valueAsNumber || 0;
        const modalidade = this.container.querySelector('input[name="modalidadePagamento"]:checked').value;
        const dataInicioStr = this.container.querySelector('#dataInicioCalculo').value;
        const dataFimStr = this.container.querySelector('#dataPagamento').value;
        const regra = this.container.querySelector('#leiArtigo').value;

        if (!dataInicioStr || !dataFimStr) {
            alert("Por favor, preencha a Data de Início e a Data Final do cálculo.");
            return;
        }

        const dataInicio = new Date(dataInicioStr + 'T00:00:00Z');
        const dataFim = new Date(dataFimStr + 'T00:00:00Z');

        let etapas = [];
        let valorFinal = 0;

        if (regra === 'automatico') {
            etapas = this.calcularEtapasCorrecao(valorDivida, dataInicio, dataFim);
        } else {
            etapas = this.simularCalculoRegraUnica(valorDivida, regra);
        }

        valorFinal = etapas.length > 0 ? etapas[etapas.length - 1].subtotal : valorDivida;

        const valorHonorarios = valorFinal * (honorariosPercent / 100);
        const totalAPagar = valorFinal + valorHonorarios;

        let tbodyHTML = etapas.map(etapa => `
            <tr>
                <td class="py-2 px-3">${etapa.descricao}</td>
                <td class="py-2 px-3 text-right">${this.formatToCurrency(etapa.valorBase)}</td>
                <td class="py-2 px-3 text-right">${this.formatToCurrency(etapa.correcao)}</td>
                <td class="py-2 px-3 text-right">${this.formatToCurrency(etapa.juros)}</td>
                <td class="py-2 px-3 text-right font-medium">${this.formatToCurrency(etapa.subtotal)}</td>
            </tr>
        `).join('');

        if (etapas.length === 0) {
            tbodyHTML = '<tr><td colspan="5" class="py-4 px-3 text-center text-gray-500">O período selecionado não gerou etapas de cálculo. Verifique as datas.</td></tr>';
        }

        let tableHTML = `
            <h3 class="text-xl font-semibold text-primary-blue mb-4">Tabela Detalhada (${modalidade})</h3>
            <div class="overflow-x-auto rounded-lg shadow-lg">
                <table class="calculation-table w-full border-collapse table-auto">
                    <thead><tr class="bg-gray-200 text-gray-700 uppercase text-xs leading-normal"><th class="py-3 px-4 text-left">Etapa de Correção</th><th class="py-3 px-4 text-right">Valor Base</th><th class="py-3 px-4 text-right">Correção Monetária</th><th class="py-3 px-4 text-right">Juros Aplicados</th><th class="py-3 px-4 text-right">Subtotal Atualizado</th></tr></thead>
                    <tbody class="bg-white text-gray-600 text-sm font-light divide-y divide-gray-200">${tbodyHTML}</tbody>
                    <tfoot>
                        <tr class="bg-gray-50 font-bold"><td class="py-2 px-4 text-right" colspan="4">Subtotal Corrigido</td><td class="py-2 px-4 text-right">${this.formatToCurrency(valorFinal)}</td></tr>
                        <tr class="bg-gray-50 font-bold"><td class="py-2 px-4 text-right" colspan="4">Honorários (${honorariosPercent.toFixed(2)}%)</td><td class="py-2 px-4 text-right">${this.formatToCurrency(valorHonorarios)}</td></tr>
                    </tfoot>
                </table>
            </div>`;

        resultsContainer.innerHTML = tableHTML;
        this.container.querySelector('#valorFinalDevido').textContent = this.formatToCurrency(totalAPagar);
    }

    simularCalculoRegraUnica(valorInicial, regra) {
        const valorFinal = valorInicial * 1.65; // Simulação genérica para regras específicas
        return [{
            descricao: `Cálculo Unificado pela regra (${regra})`,
            valorBase: valorInicial,
            correcao: valorFinal - valorInicial,
            juros: 0,
            subtotal: valorFinal
        }];
    }

    calcularEtapasCorrecao(valorInicial, dataInicio, dataFim) {
        const etapas = [];
        let valorCorrente = valorInicial;
        let dataCorrente = new Date(dataInicio);

        const limites = [
            { dataFim: new Date('2015-03-31T23:59:59Z'), indice: 'TR', juros: 0.005, label: 'TR + Juros' },
            { dataFim: new Date('2021-12-31T23:59:59Z'), indice: 'IPCA-E', juros: 0.005, label: 'IPCA-E + Juros' },
            { dataFim: dataFim, indice: 'SELIC', juros: 0, label: 'SELIC' }
        ];

        for (const limite of limites) {
            if (dataCorrente >= dataFim) break;

            const dataEtapaFim = new Date(Math.min(dataFim, limite.dataFim));
            if (dataCorrente > dataEtapaFim) continue;

            const meses = this.countMonths(dataCorrente, dataEtapaFim);
            if (meses <= 0) continue;

            const taxaIndice = this.mockIndicesTaxas[limite.indice]?.taxa || 0;
            const correcao = valorCorrente * taxaIndice * meses;
            const juros = valorCorrente * limite.juros * meses;
            const subtotal = valorCorrente + correcao + juros;

            etapas.push({
                descricao: `Correção de ${dataCorrente.toLocaleDateString('pt-BR')} a ${dataEtapaFim.toLocaleDateString('pt-BR')} (${limite.label})`,
                valorBase: valorCorrente,
                correcao: correcao,
                juros: juros,
                subtotal: subtotal
            });

            valorCorrente = subtotal;
            dataCorrente = new Date(dataEtapaFim);
            dataCorrente.setDate(dataCorrente.getDate() + 1);
        }
        return etapas;
    }

    saveCalculation() { alert('Funcionalidade "Salvar Cálculo" em desenvolvimento.'); }

    generateReport() {
        const results = this.container.querySelector('#results-container');
        if (!results.innerHTML.trim()) {
            alert("É necessário calcular os valores antes de gerar um relatório.");
            return;
        }

        const data = {
            processo: this.container.querySelector('#processNumber').value,
            credor: this.container.querySelector('#requerentesInput').value,
            devedor: this.container.querySelector('#devedor').value,
            modalidade: this.container.querySelector('input[name="modalidadePagamento"]:checked').value,
            leiArtigo: this.container.querySelector('#leiArtigo').value,
            indice: this.container.querySelector('#indice-param').value,
            jurosMora: this.container.querySelector('#jurosMora').value,
            tipoDivida: this.container.querySelector('input[name="tipoDivida"]:checked').value,
            incidenciaJuros: this.container.querySelector('input[name="incidenciaJuros"]:checked').value === 'sim' ? 'Sim' : 'Não',
            dataInicio: new Date(this.container.querySelector('#dataInicioCalculo').value + 'T00:00:00').toLocaleDateString('pt-BR'),
            dataPagamento: new Date(this.container.querySelector('#dataPagamento').value + 'T00:00:00').toLocaleDateString('pt-BR'),
            honorarios: this.container.querySelector('#honorarios-percent').value,
            notas: this.container.querySelector('#notas').value
        };

        const summaryHTML = `
            <div class="report-summary mt-8 p-4 bg-gray-50 rounded-lg border text-sm" style="page-break-inside: avoid;">
                <h5 class="font-bold mb-2 text-base">Resumo da Metodologia de Cálculo</h5>
                <ul class="list-disc list-inside space-y-1 mb-4">
                    <li><strong>Modalidade de Pagamento:</strong> ${data.modalidade}</li>
                    <li><strong>Lei / Artigo Base:</strong> ${data.leiArtigo}</li>
                    <li><strong>Índice Principal:</strong> ${data.indice}</li>
                    <li><strong>Juros de Mora:</strong> ${data.jurosMora}% a.a.</li>
                    <li><strong>Tipo da Dívida:</strong> ${data.tipoDivida}</li>
                    <li><strong>Incidência Juros (1º a Julho):</strong> ${data.incidenciaJuros}</li>
                    <li><strong>Início do Cálculo:</strong> ${data.dataInicio}</li>
                    <li><strong>Data do Pagamento:</strong> ${data.dataPagamento}</li>
                    <li><strong>Honorários Adicionais:</strong> ${data.honorarios}%</li>
                </ul>
                <h5 class="font-bold mt-4 mb-2 text-base">Notas e Observações</h5>
                <p class="whitespace-pre-wrap text-gray-700">${data.notas || 'Nenhuma observação inserida.'}</p>
            </div>`;

        const printArea = document.createElement('div');
        printArea.id = 'print-area';
        const header = `<div class="mb-8 border-b pb-4"><h2 class="text-2xl font-bold">Relatório de Cálculo Cível</h2><p><strong>Processo:</strong> ${data.processo}</p><p><strong>Credor:</strong> ${data.credor}</p><p><strong>Devedor:</strong> ${data.devedor}</p></div>`;

        printArea.innerHTML = header + results.innerHTML + summaryHTML;
        document.body.appendChild(printArea);
        window.print();
        document.body.removeChild(printArea);
    }

    clearForm() {
        if (confirm("Tem certeza que deseja limpar todos os dados do cálculo?")) {
            const fields = ['#processNumber', '#requerentesInput', '#devedor', '#valorDivida', '#jurosMora', '#dataInicioCalculo', '#dataPagamento', '#honorarios-percent', '#notas'];
            fields.forEach(id => this.container.querySelector(id).value = '');
            this.container.querySelector('input[name="modalidadePagamento"][value="Precatório"]').checked = true;
            this.container.querySelector('#results-container').innerHTML = '';
            this.container.querySelector('#valorFinalDevido').textContent = 'R$ 0,00';
            alert('Formulário limpo com sucesso.');
        }
    }

    formatToCurrency(v) { return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
    parseCurrency(v) { return typeof v !== 'string' ? (Number(v) || 0) : (Number(v.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.')) || 0); }
    countMonths(start, end) {
        if (!(start instanceof Date) || !(end instanceof Date) || end < start) return 0;
        let yearDiff = end.getFullYear() - start.getFullYear();
        let monthDiff = end.getMonth() - start.getMonth();
        return yearDiff * 12 + monthDiff + 1;
    }
}