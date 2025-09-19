class AdministrativoCalculator {
    constructor(container) {
        this.container = container;
        
        this.verbas = ['Abono', 'Férias', '13º Salário', 'Licença Prêmio', 'Licença Doença', 'FGTS'];
        
        this.mockProcesso = { 
            processNumber: 'ADM-12345/2025', 
            requerente: "José da Silva Sauro",
            inicioPeriodo: '01/2020',
            fimPeriodo: '12/2020'
        };

        this.mockVerbasPagas = [
            { periodo: '2020', evento: 'FGTS', valor: 562.00 },
            { periodo: '2020', evento: '13º Salário', valor: 1874.00 }
        ];

        this.simularExtracaoHandler = this.simularExtracao.bind(this);
        this.consultarHandler = this.consultarVerbas.bind(this);
        this.clearFormHandler = this.clearForm.bind(this);
        this.generateReportHandler = this.generateReport.bind(this);
        this.saveCalculationHandler = this.saveCalculation.bind(this);
    }

    static getHtml() {
        return `
            <div id="formFields">
                <div class="mb-8"><p class="text-gray-600">Tipo de Cálculo > Processos Administrativos</p></div>
                <div class="mb-8"><h3 class="text-xl font-semibold text-primary-blue mb-4">1. Upload e Extração de Dados</h3><div id="uploadArea" class="upload-area p-8 rounded-lg text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-teal transition-colors"><i class="fas fa-cloud-upload-alt text-4xl text-primary-teal mb-4"></i><p class="text-gray-600 mb-2">Clique para simular a extração de dados</p></div></div>
                
                <div class="mb-8"><h3 class="text-xl font-semibold text-primary-blue mb-4">2. Dados do Processo</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Processo nº</label><input type="text" id="processNumber" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Parte Requerente</label><input type="text" id="requerente" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Início (Mês/Ano)</label><input type="text" id="apuracao-inicio" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="mm/aaaa" maxlength="7"></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Fim (Mês/Ano)</label><input type="text" id="apuracao-fim" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="mm/aaaa" maxlength="7"></div>
                    </div>
                </div>

                <div id="verbas-params" class="mb-8">
                    <h3 class="text-xl font-semibold text-primary-blue mb-4">3. Verbas Rescisórias a Consultar</h3>
                    <div id="verbas-container" class="bg-gray-50 p-6 rounded-lg border grid grid-cols-2 md:grid-cols-4 gap-4">
                        </div>
                </div>

                <div class="flex justify-start mb-8"><button id="consultarBtn" class="bg-secondary-blue hover:bg-primary-blue text-white px-8 py-3 rounded-lg font-semibold"><i class="fas fa-search mr-2"></i>Consultar Verbas Pagas</button></div>
                <hr class="my-8">
                
                <div id="results-container"></div>

                <div class="mt-6">
                     <label class="block text-sm font-medium text-gray-700 mb-2">Detalhamento do Cálculo / Justificativa</label>
                     <textarea id="justificativa" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: Conforme o estatuto de lei ... devem ser pagas as seguintes verbas..."></textarea>
                </div>
                
                <div class="flex flex-wrap gap-4 justify-center mt-8 no-print">
                    <button id="saveBtn" class="bg-secondary-blue hover:bg-primary-blue text-white px-8 py-3 rounded-lg font-semibold"><i class="fas fa-save mr-2"></i>Salvar</button>
                    <button id="reportBtn" class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold"><i class="fas fa-file-pdf mr-2"></i>Gerar Despacho</button>
                    <button id="clearBtn" class="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold"><i class="fas fa-eraser mr-2"></i>Limpar</button>
                </div>
            </div>`;
    }

    init() {
        this.uploadArea = this.container.querySelector('#uploadArea');
        this.consultarBtn = this.container.querySelector('#consultarBtn');
        this.saveBtn = this.container.querySelector('#saveBtn');
        this.reportBtn = this.container.querySelector('#reportBtn');
        this.clearBtn = this.container.querySelector('#clearBtn');
        
        this.populateCheckboxes();
        this.uploadArea.addEventListener('click', this.simularExtracaoHandler);
        this.consultarBtn.addEventListener('click', this.consultarHandler);
        this.saveBtn.addEventListener('click', this.saveCalculationHandler);
        this.reportBtn.addEventListener('click', this.generateReportHandler);
        this.clearBtn.addEventListener('click', this.clearFormHandler);
    }

    destroy() {
        this.uploadArea.removeEventListener('click', this.simularExtracaoHandler);
        this.consultarBtn.removeEventListener('click', this.consultarHandler);
        this.saveBtn.removeEventListener('click', this.saveCalculationHandler);
        this.reportBtn.removeEventListener('click', this.generateReportHandler);
        this.clearBtn.removeEventListener('click', this.clearFormHandler);
    }

    populateCheckboxes() {
        const container = this.container.querySelector('#verbas-container');
        container.innerHTML = this.verbas.map(verba => `
            <label class="flex items-center space-x-2">
                <input type="checkbox" name="verba" value="${verba}" class="rounded text-primary-teal">
                <span>${verba}</span>
            </label>
        `).join('');
    }
    
    simularExtracao() {
        alert(`Simulando extração de dados para PROCESSO ADMINISTRATIVO...`);
        this.container.querySelector('#processNumber').value = this.mockProcesso.processNumber;
        this.container.querySelector('#requerente').value = this.mockProcesso.requerente;
        this.container.querySelector('#apuracao-inicio').value = this.mockProcesso.inicioPeriodo;
        this.container.querySelector('#apuracao-fim').value = this.mockProcesso.fimPeriodo;
    }
    
    consultarVerbas() {
        const resultsContainer = this.container.querySelector('#results-container');
        resultsContainer.innerHTML = '';

        const verbasSelecionadas = Array.from(this.container.querySelectorAll('input[name="verba"]:checked')).map(cb => cb.value);
        if (verbasSelecionadas.length === 0) {
            alert("Selecione pelo menos uma verba para consultar.");
            return;
        }

        const verbasEncontradas = this.mockVerbasPagas.filter(verbaPaga => verbasSelecionadas.includes(verbaPaga.evento));
        const verbasAPagar = verbasSelecionadas.filter(verbaSel => !this.mockVerbasPagas.some(verbaPaga => verbaPaga.evento === verbaSel));

        let tableHTML = `<h3 class="text-xl font-semibold text-primary-blue mb-4">Verbas Pagas Encontradas</h3>`;
        if (verbasEncontradas.length > 0) {
            tableHTML += `
                <div class="overflow-x-auto rounded-lg shadow-lg">
                    <table class="calculation-table w-full border-collapse table-auto">
                        <thead><tr class="bg-gray-200 text-gray-700 uppercase text-xs leading-normal"><th class="py-3 px-4 text-left">Período</th><th class="py-3 px-4 text-left">Evento</th><th class="py-3 px-4 text-right">Valor Pago</th></tr></thead>
                        <tbody class="bg-white text-gray-600 text-sm font-light divide-y divide-gray-200">
                            ${verbasEncontradas.map(v => `<tr><td class="py-2 px-3">${v.periodo}</td><td class="py-2 px-3">${v.evento}</td><td class="py-2 px-3 text-right">${this.formatToCurrency(v.valor)}</td></tr>`).join('')}
                        </tbody>
                    </table>
                </div>`;
        } else {
            tableHTML += `<p class="text-gray-600 bg-gray-50 p-4 rounded-lg">Nenhum pagamento encontrado para as verbas selecionadas no período.</p>`;
        }

        let summaryHTML = `<div class="mt-6">`;
        if (verbasAPagar.length > 0) {
            summaryHTML += `<p class="text-base font-semibold">Verbas para pagamento (não encontradas): <span class="text-red-600">${verbasAPagar.join(', ')}</span></p>`;
        } else {
            summaryHTML += `<p class="text-base font-semibold">Todas as verbas selecionadas foram encontradas na lista de pagamentos.</p>`;
        }
        summaryHTML += `</div>`;

        resultsContainer.innerHTML = tableHTML + summaryHTML;
    }
    
    generateReport() {
        const processo = this.container.querySelector('#processNumber').value;
        const requerente = this.container.querySelector('#requerente').value;
        const results = this.container.querySelector('#results-container');
        const justificativa = this.container.querySelector('#justificativa').value;

        if (!results.innerHTML.trim()) {
            alert("É necessário consultar as verbas antes de gerar um despacho.");
            return;
        }

        const printArea = document.createElement('div');
        printArea.id = 'print-area';

        const matricula = '12345-6'; 
        const dataHora = new Date().toLocaleString('pt-BR');

        const header = `
            <div class="mb-8 border-b pb-4 flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold">Despacho Administrativo</h2>
                    <p><strong>Processo:</strong> ${processo}</p>
                    <p><strong>Requerente:</strong> ${requerente}</p>
                </div>
            </div>`;

        const printStyles = `
            <style>
                @media print {
                    #print-wrapper {
                        display: flex;
                        flex-direction: column;
                        min-height: 95vh;
                    }
                    #print-content {
                        flex-grow: 1;
                    }
                    #print-footer {
                        text-align: center;
                        font-size: 0.875rem;
                        color: #4b5563;
                        border-top: 1px solid #e5e7eb;
                        padding-top: 1rem;
                        margin-top: auto; /* Empurra para o final */
                    }
                }
            </style>`;
            
        const footer = `<div id="print-footer"><p>Emitido por: ${matricula} - ${dataHora}</p></div>`;
        const justificativaHTML = `<div class="mt-8"><h4 class="text-lg font-semibold mb-2">Justificativa</h4><p class="text-gray-700 whitespace-pre-wrap">${justificativa || 'Nenhuma justificativa inserida.'}</p></div>`;

        printArea.innerHTML = `
            ${printStyles}
            <div id="print-wrapper">
                <div id="print-content">
                    ${header}
                    ${results.innerHTML}
                    ${justificativaHTML}
                </div>
                ${footer}
            </div>`;
        
        document.body.appendChild(printArea);
        window.print();
        document.body.removeChild(printArea);
    }
    
    saveCalculation() { alert('Funcionalidade "Salvar" em desenvolvimento.'); }

    clearForm() {
        if (confirm("Tem certeza que deseja limpar todos os dados?")) {
            const fields = ['#processNumber', '#requerente', '#apuracao-inicio', '#apuracao-fim', '#justificativa'];
            fields.forEach(id => this.container.querySelector(id).value = '');
            this.container.querySelectorAll('input[name="verba"]').forEach(cb => cb.checked = false);
            this.container.querySelector('#results-container').innerHTML = '';
            alert('Formulário limpo com sucesso.');
        }
    }
    
    formatToCurrency(v) { return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
}