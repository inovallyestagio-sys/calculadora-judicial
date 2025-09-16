class FiscalCalculator {
    constructor(container) {
        this.container = container;
        this.eventos = ['Salário Base', 'URV', 'Insalubridade', 'Periculosidade', 'Adicional Noturno', 'Abono de Permanência', 'Licença prêmio', 'Férias', 'Terço', 'FGTS', 'Hora Atividade', 'Hora Extra'];
        this.mockProcesso = { processNumber: '2222222-22.2025.8.11.0002', requerentes: ["João Oliveira"] };
        
        this.simularExtracaoHandler = this.simularExtracao.bind(this);
        this.calcularHandler = this.calcularValoresTrabalhista.bind(this);
        this.clearFormHandler = this.clearForm.bind(this);
        this.generateReportHandler = this.generateReport.bind(this);
        this.saveCalculationHandler = this.saveCalculation.bind(this);
    }

    static getHtml() {
        return `
            <div id="formFields">
                <div class="mb-8"><p class="text-gray-600">Tipo de Cálculo > Fiscal</p></div>
                <div class="mb-8"><h3 class="text-xl font-semibold text-primary-blue mb-4">1. Upload e Extração de Dados</h3><div id="uploadArea" class="upload-area p-8 rounded-lg text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-teal transition-colors"><i class="fas fa-cloud-upload-alt text-4xl text-primary-teal mb-4"></i><p class="text-gray-600 mb-2">Clique para simular a extração de dados</p></div></div>
                
                <div class="mb-8"><h3 class="text-xl font-semibold text-primary-blue mb-4">2. Dados do Processo</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Número do Processo</label><input type="text" id="processNumber" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Parte Requerente(s)</label><input type="text" id="requerentesInput" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                        <div class="md:col-span-1"><label class="block text-sm font-medium text-gray-700 mb-2">Início da Apuração</label><input type="text" id="apuracao-inicio" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="mm/aaaa" maxlength="7"></div>
                        <div class="md:col-span-1"><label class="block text-sm font-medium text-gray-700 mb-2">Fim da Apuração</label><input type="text" id="apuracao-fim" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="mm/aaaa" maxlength="7"></div>
                    </div>
                </div>

                <div id="trabalhista-full-params" class="mb-8">
                    <h3 class="text-xl font-semibold text-primary-blue mb-4">3. Parâmetros do Cálculo Trabalhista</h3>
                    <div class="bg-gray-50 p-6 rounded-lg border space-y-6">
                        <div>
                            <h4 class="text-lg font-semibold text-gray-700 mb-4">Eventos a Calcular</h4>
                            <div id="eventos-container-full" class="grid grid-cols-2 md:grid-cols-4 gap-4"></div>
                            <div id="urv-input-container" class="mt-4 hidden">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Porcentagem do URV (%)</label>
                                <input type="number" id="urv-percent" class="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: 11.98">
                            </div>
                        </div>
                        <div>
                            <h4 class="text-lg font-semibold text-gray-700 mb-4">Acréscimos ao Cálculo</h4>
                            <div class="flex flex-col md:flex-row md:space-x-8">
                                <div class="flex items-center space-x-2"><input id="chk-honorarios" type="checkbox" class="rounded text-primary-teal"><label for="chk-honorarios">Honorários</label></div>
                                <div class="flex items-center space-x-2"><input id="chk-multa" type="checkbox" class="rounded text-primary-teal"><label for="chk-multa">Multa</label></div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div id="honorarios-input-container" class="hidden"><label class="block text-sm font-medium text-gray-700 mb-2">Honorários (%)</label><input type="number" id="honorarios-percent" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: 10"></div>
                                <div id="multa-input-container" class="hidden"><label class="block text-sm font-medium text-gray-700 mb-2">Multa (%)</label><input type="number" id="multa-percent" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: 50"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-start mb-8"><button id="calculateBtn" class="bg-secondary-blue hover:bg-primary-blue text-white px-8 py-3 rounded-lg font-semibold"><i class="fas fa-calculator mr-2"></i>Calcular Valor</button></div>
                <hr class="my-8"><div id="results-container"></div>
                <div class="summary-container mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="summary-box bg-white p-6 rounded-lg shadow-lg border"><p class="text-sm text-gray-500 mb-2">VALOR EXECUTADO</p><p class="text-2xl font-bold text-primary-blue" id="valorExecutadoSummary">R$ 0,00</p></div>
                    <div class="summary-box bg-white p-6 rounded-lg shadow-lg border"><p class="text-sm text-gray-500 mb-2">VALOR ATUALIZADO (TOTAL)</p><p class="text-2xl font-bold text-primary-blue" id="valorAtualizadoSummary">R$ 0,00</p></div>
                    <div class="summary-box bg-white p-6 rounded-lg shadow-lg border"><p class="text-sm text-gray-500 mb-2">PROVEITO ECONÔMICO</p><p class="text-2xl font-bold text-primary-blue" id="proveitoEconomicoSummary">R$ 0,00</p></div>
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
        
        this.populateCheckboxes();
        this.uploadArea.addEventListener('click', this.simularExtracaoHandler);
        this.calculateBtn.addEventListener('click', this.calcularHandler);
        this.saveBtn.addEventListener('click', this.saveCalculationHandler);
        this.reportBtn.addEventListener('click', this.generateReportHandler);
        this.clearBtn.addEventListener('click', this.clearFormHandler);
        
        this.container.querySelector('#chk-honorarios').addEventListener('change', (e) => this.container.querySelector('#honorarios-input-container').classList.toggle('hidden', !e.target.checked));
        this.container.querySelector('#chk-multa').addEventListener('change', (e) => this.container.querySelector('#multa-input-container').classList.toggle('hidden', !e.target.checked));
        this.container.querySelector('#apuracao-inicio').addEventListener('input', (e) => this.applyDateMask(e));
        this.container.querySelector('#apuracao-fim').addEventListener('input', (e) => this.applyDateMask(e));
    }

    destroy() {
        this.uploadArea.removeEventListener('click', this.simularExtracaoHandler);
        this.calculateBtn.removeEventListener('click', this.calcularHandler);
        this.saveBtn.removeEventListener('click', this.saveCalculationHandler);
        this.reportBtn.removeEventListener('click', this.generateReportHandler);
        this.clearBtn.removeEventListener('click', this.clearFormHandler);
    }
    
    simularExtracao() {
        alert(`Simulando extração de dados para TRABALHISTA...`);
        this.container.querySelector('#processNumber').value = this.mockProcesso.processNumber;
        this.container.querySelector('#requerentesInput').value = this.mockProcesso.requerentes.join(', ');
    }

    populateCheckboxes() {
        const container = this.container.querySelector('#eventos-container-full');
        container.innerHTML = '';
        this.eventos.forEach(evento => {
            const isChecked = evento === 'Salário Base';
            const checkboxHTML = `<label class="flex items-center space-x-2"><input type="checkbox" name="eventoCalcFull" value="${evento}" class="rounded text-primary-teal" ${isChecked ? 'checked' : ''} onchange="TrabalhistaCalculator.toggleUrvInput(event)"><span>${evento}</span></label>`;
            container.innerHTML += checkboxHTML;
        });
    }

    static toggleUrvInput(event) {
        if (event.target.value === 'URV') {
            document.getElementById('urv-input-container').classList.toggle('hidden', !event.target.checked);
        }
    }

    calcularValoresTrabalhista() {
        const resultsContainer = this.container.querySelector('#results-container');
        const inicioStr = this.container.querySelector('#apuracao-inicio').value;
        const fimStr = this.container.querySelector('#apuracao-fim').value;

        if (!inicioStr || !fimStr || inicioStr.length < 7 || fimStr.length < 7) {
            alert("Por favor, preencha o Período de Apuração completo (Início e Fim).");
            return;
        }

        const startDate = this.parseMaskedDate(inicioStr);
        const endDate = this.parseMaskedDate(fimStr);

        if (!startDate || !endDate || endDate < startDate) {
            alert("A data final do período de apuração deve ser maior ou igual à data inicial.");
            return;
        }
        
        const selectedEvents = Array.from(this.container.querySelectorAll('#eventos-container-full input:checked')).map(cb => cb.value);
        
        let tableHTML = `<h3 class="text-2xl font-semibold text-primary-blue mb-4">Demonstrativo de Cálculo Trabalhista</h3><div class="overflow-x-auto rounded-lg shadow-lg"><table class="calculation-table w-full border-collapse table-auto"><thead><tr class="bg-gray-200 text-gray-700 uppercase text-xs leading-normal"><th class="py-3 px-4 text-left">Mês Ref.</th><th class="py-3 px-4 text-left">Descrição</th><th class="py-3 px-4 text-right">Recebido</th><th class="py-3 px-4 text-right">Diferença</th><th class="py-3 px-4 text-right">Juros (%)</th><th class="py-3 px-4 text-right">Índice</th><th class="py-3 px-4 text-right">Valor Corrigido</th></tr></thead><tbody id="trabalhista-tbody" class="bg-white text-gray-600 text-sm font-light divide-y divide-gray-200">`;
        
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const currentYear = currentDate.getFullYear();
            const mesRef = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentYear}`;

            selectedEvents.forEach(evento => {
                tableHTML += `<tr class="calculation-row" data-mes-ref="${mesRef}" data-evento="${evento}">`;

                if (currentYear <= 2004) {
                    tableHTML += `
                        <td class="py-3 px-4 text-left">${mesRef}</td>
                        <td class="py-3 px-4"><input type="text" class="w-full border border-gray-300 rounded p-1 text-sm" name="manual_descricao" value="${evento}"></td>
                        <td class="py-3 px-4"><input type="text" class="w-full border border-gray-300 rounded p-1 text-sm text-right" name="manual_recebido" placeholder="0,00"></td>
                        <td class="py-3 px-4 text-right text-gray-500">-</td>
                        <td class="py-3 px-4 text-right text-gray-500">-</td>
                        <td class="py-3 px-4 text-right text-gray-500">-</td>
                        <td class="py-3 px-4 text-right font-bold text-gray-500" data-valor-corrigido="0">-</td>`;
                } else {
                    const { recebido, diferenca, valorCorrigido, juros, indice } = this.simularLinha(evento);
                    tableHTML += `
                        <td class="py-3 px-4 text-left">${mesRef}</td>
                        <td class="py-3 px-4 text-left">${evento}</td>
                        <td class="py-3 px-4 text-right">${this.formatToCurrency(recebido)}</td>
                        <td class="py-3 px-4 text-right text-red-600 font-medium">${this.formatToCurrency(diferenca)}</td>
                        <td class="py-3 px-4 text-right">${juros.toFixed(2)}%</td>
                        <td class="py-3 px-4 text-right">${indice}</td>
                        <td class="py-3 px-4 text-right font-bold" data-valor-corrigido="${valorCorrigido}">${this.formatToCurrency(valorCorrigido)}</td>`;
                }
                tableHTML += `</tr>`;
            });
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        tableHTML += `</tbody><tfoot>
                        <tr id="honorarios-row" class="bg-gray-100 font-semibold hidden"><td class="py-3 px-4" colspan="6">Honorários (%)</td><td id="honorarios-valor" class="py-3 px-4 text-right">R$ 0,00</td></tr>
                        <tr id="multa-row" class="bg-gray-100 font-semibold hidden"><td class="py-3 px-4" colspan="6">Multa (%)</td><td id="multa-valor" class="py-3 px-4 text-right">R$ 0,00</td></tr>
                        <tr class="bg-gray-200 text-gray-800 font-bold text-base"><td class="py-4 px-4 text-right" colspan="6">Total Geral Corrigido</td><td id="total-geral" class="py-4 px-4 text-right">R$ 0,00</td></tr>
                      </tfoot></table></div>`;
        
        resultsContainer.innerHTML = tableHTML;

        this.container.querySelectorAll('input[name="manual_recebido"]').forEach(input => {
            input.addEventListener('change', (e) => this.recalculateRow(e.target));
        });
        this.container.querySelector('#chk-honorarios').addEventListener('change', () => this.updateTotals());
        this.container.querySelector('#chk-multa').addEventListener('change', () => this.updateTotals());
        this.container.querySelector('#honorarios-percent')?.addEventListener('input', () => this.updateTotals());
        this.container.querySelector('#multa-percent')?.addEventListener('input', () => this.updateTotals());

        this.updateTotals();
    }

    simularLinha(evento) {
        const urvPercent = this.container.querySelector('#urv-percent').valueAsNumber || 0;
        const baseSalary = 3500;
        let recebido = 0, devido = 0;
        switch(evento) {
            case 'Salário Base': devido = baseSalary; recebido = baseSalary * 0.9; break;
            case 'URV': devido = baseSalary * (urvPercent / 100); recebido = 0; break;
            default: devido = baseSalary * 0.15; recebido = 0;
        }
        const diferenca = devido - recebido;
        const juros = 0.5; const indice = 'IPCA-E';
        const valorCorrigido = diferenca * (1 + (juros / 100));
        return { recebido, diferenca, valorCorrigido, juros, indice };
    }

    recalculateRow(inputElement) {
        const row = inputElement.closest('tr');
        const recebido = this.parseCurrency(inputElement.value);
        const devido = recebido * 1.25; // Simulação: O valor devido é 25% maior que o recebido
        const diferenca = devido - recebido;
        const juros = 0.5; const indice = 'IPCA-E';
        const valorCorrigido = diferenca * (1 + (juros / 100));

        row.cells[3].textContent = this.formatToCurrency(diferenca);
        row.cells[4].textContent = `${juros.toFixed(2)}%`;
        row.cells[5].textContent = indice;
        row.cells[6].textContent = this.formatToCurrency(valorCorrigido);
        row.cells[6].dataset.valorCorrigido = valorCorrigido;

        this.updateTotals();
    }

    updateTotals() {
        let totalPrincipalCorrigido = 0;
        this.container.querySelectorAll('#trabalhista-tbody tr').forEach(row => {
            totalPrincipalCorrigido += Number(row.cells[6].dataset.valorCorrigido) || 0;
        });

        const honorariosPercent = this.container.querySelector('#honorarios-percent')?.valueAsNumber || 0;
        const multaPercent = this.container.querySelector('#multa-percent')?.valueAsNumber || 0;
        const chkHonorarios = this.container.querySelector('#chk-honorarios').checked;
        const chkMulta = this.container.querySelector('#chk-multa').checked;

        let valorHonorarios = 0;
        if (chkHonorarios) {
            valorHonorarios = totalPrincipalCorrigido * (honorariosPercent / 100);
            this.container.querySelector('#honorarios-row').classList.remove('hidden');
            this.container.querySelector('#honorarios-valor').textContent = this.formatToCurrency(valorHonorarios);
        } else {
            this.container.querySelector('#honorarios-row').classList.add('hidden');
        }

        let valorMulta = 0;
        if (chkMulta) {
            valorMulta = totalPrincipalCorrigido * (multaPercent / 100);
            this.container.querySelector('#multa-row').classList.remove('hidden');
            this.container.querySelector('#multa-valor').textContent = this.formatToCurrency(valorMulta);
        } else {
            this.container.querySelector('#multa-row').classList.add('hidden');
        }
        
        const totalGeral = totalPrincipalCorrigido + valorHonorarios + valorMulta;
        
        this.container.querySelector('#total-geral').textContent = this.formatToCurrency(totalGeral);
        this.container.querySelector('#valorAtualizadoSummary').textContent = this.formatToCurrency(totalGeral);
    }

    saveCalculation() { alert('Funcionalidade "Salvar Cálculo" em desenvolvimento.'); }
    
    generateReport() {
        const results = this.container.querySelector('#results-container');
        if (!results.innerHTML.trim()) {
            alert("É necessário calcular os valores antes de gerar um relatório.");
            return;
        }
        const printArea = document.createElement('div');
        printArea.id = 'print-area';
        const header = `<div class="mb-8 border-b pb-4"><h2 class="text-2xl font-bold">Relatório de Cálculo Trabalhista</h2><p><strong>Processo:</strong> ${this.container.querySelector('#processNumber').value}</p><p><strong>Requerentes:</strong> ${this.container.querySelector('#requerentesInput').value}</p></div>`;
        printArea.innerHTML = header + results.innerHTML;
        document.body.appendChild(printArea);
        window.print();
        document.body.removeChild(printArea);
    }

    clearForm() {
        if (confirm("Tem certeza que deseja limpar todos os dados do cálculo?")) {
            this.container.querySelector('#results-container').innerHTML = '';
            this.container.querySelector('#valorExecutadoSummary').textContent = 'R$ 0,00';
            this.container.querySelector('#valorAtualizadoSummary').textContent = 'R$ 0,00';
            this.container.querySelector('#proveitoEconomicoSummary').textContent = 'R$ 0,00';
            alert('Formulário limpo com sucesso.');
        }
    }
    
    formatToCurrency(v) { return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
    parseCurrency(v) { return typeof v !== 'string' ? (Number(v) || 0) : (Number(v.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.')) || 0); }
    applyDateMask(event) { let input = event.target; let value = input.value.replace(/\D/g, ''); if (value.length > 2) value = `${value.substring(0, 2)}/${value.substring(2, 6)}`; input.value = value; }
    parseMaskedDate(maskedDate) { if (!maskedDate || maskedDate.length < 7) return null; const [month, year] = maskedDate.split('/'); return new Date(year, month - 1, 1); }
}