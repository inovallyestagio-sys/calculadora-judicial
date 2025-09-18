class TrabalhistaCalculator {
    constructor(container) {
        this.container = container;
        this.eventos = ['Salário Base', 'URV', 'Insalubridade', 'Periculosidade', 'Adicional Noturno', 'Abono de Permanência', 'Licença prêmio', 'Férias', 'Terço', 'FGTS', 'Hora Atividade', 'Hora Extra', '13º Salário'];
        
        // --- NOVO: Configuração para identificar eventos anuais e o mês de sua ocorrência ---
        this.eventosConfig = {
            'Férias': { tipo: 'anual', mes: 0 },      // Lançado em Janeiro (Mês 0) para simulação
            'Terço': { tipo: 'anual', mes: 0 },       // Lançado em Janeiro (Mês 0) para simulação
            '13º Salário': { tipo: 'anual', mes: 11 } // Lançado em Dezembro (Mês 11)
            // Eventos não listados aqui são considerados 'mensal' por padrão.
        };

        this.mockProcesso = { 
            processNumber: '2222222-22.2025.8.11.0002', 
            requerentes: ["João Oliveira"],
            valorAcao: 75000.00,
            inicioPeriodo: '01/2022',
            fimPeriodo: '12/2023',
            dataCitacao: '2024-01-15'
        };
        
        this.simularExtracaoHandler = this.simularExtracao.bind(this);
        this.calcularHandler = this.calcularValoresTrabalhista.bind(this);
        this.clearFormHandler = this.clearForm.bind(this);
        this.generateReportHandler = this.generateReport.bind(this);
        this.saveCalculationHandler = this.saveCalculation.bind(this);
    }

    static getHtml() {
        // O HTML permanece o mesmo, sem alterações aqui.
        return `
            <div id="formFields">
                <div class="mb-8"><p class="text-gray-600">Tipo de Cálculo > Trabalhista</p></div>
                <div class="mb-8"><h3 class="text-xl font-semibold text-primary-blue mb-4">1. Upload e Extração de Dados</h3><div id="uploadArea" class="upload-area p-8 rounded-lg text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-teal transition-colors"><i class="fas fa-cloud-upload-alt text-4xl text-primary-teal mb-4"></i><p class="text-gray-600 mb-2">Clique para simular a extração de dados</p></div></div>
                
                <div class="mb-8"><h3 class="text-xl font-semibold text-primary-blue mb-4">2. Dados do Processo</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Processo nº</label><input type="text" id="processNumber" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Parte Requerente(s)</label><input type="text" id="requerentesInput" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div>
                        <div class="md:col-span-1"><label class="block text-sm font-medium text-gray-700 mb-2">Início</label><input type="text" id="apuracao-inicio" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="mm/aaaa" maxlength="7"></div>
                        <div class="md:col-span-1"><label class="block text-sm font-medium text-gray-700 mb-2">Fim</label><input type="text" id="apuracao-fim" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="mm/aaaa" maxlength="7"></div>
                        <div class="col-span-1 md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">Valor da Ação</label><input type="text" id="valorAcao" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"></div>
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
                    <div class="summary-box bg-white p-6 rounded-lg shadow-lg border"><p class="text-sm text-gray-500 mb-2">VALOR DA AÇÃO</p><p class="text-2xl font-bold text-primary-blue" id="valorAcaoSummary">R$ 0,00</p></div>
                    <div class="summary-box bg-white p-6 rounded-lg shadow-lg border"><p class="text-sm text-gray-500 mb-2">VALOR CORRIGIDO</p><p class="text-2xl font-bold text-primary-blue" id="valorDevidoSummary">R$ 0,00</p></div>
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
        this.container.querySelector('#apuracao-inicio').value = this.mockProcesso.inicioPeriodo;
        this.container.querySelector('#apuracao-fim').value = this.mockProcesso.fimPeriodo;
        this.container.querySelector('#valorAcao').value = this.formatToCurrency(this.mockProcesso.valorAcao);
        this.container.querySelector('#valorAcaoSummary').textContent = this.formatToCurrency(this.mockProcesso.valorAcao);
    }

    populateCheckboxes() {
        const container = this.container.querySelector('#eventos-container-full');
        container.innerHTML = '';
        this.eventos.forEach(evento => {
            const isChecked = ['Salário Base', '13º Salário', 'Férias', 'Terço'].includes(evento);
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
        
        let tableHTML = `<h3 class="text-2xl font-semibold text-primary-blue mb-4">Demonstrativo de Cálculo Trabalhista</h3><div class="overflow-x-auto rounded-lg shadow-lg"><table class="calculation-table w-full border-collapse table-auto"><thead><tr class="bg-gray-200 text-gray-700 uppercase text-xs leading-normal"><th class="py-3 px-4 text-left">Mês Ref.</th><th class="py-3 px-4 text-left">Descrição</th><th class="py-3 px-4 text-right">Devido</th><th class="py-3 px-4 text-right">Recebido</th><th class="py-3 px-4 text-right">Diferença</th><th class="py-3 px-4 text-right">Juros (%)</th><th class="py-3 px-4 text-right">Índice</th><th class="py-3 px-4 text-right">Valor Corrigido</th></tr></thead><tbody id="trabalhista-tbody" class="bg-white text-gray-600 text-sm font-light divide-y divide-gray-200">`;
        
        let totais = { devido: 0, recebido: 0, diferenca: 0, corrigido: 0 };
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const mes = currentDate.getMonth();
            const mesRef = `${(mes + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;

            selectedEvents.forEach(evento => {
                const config = this.eventosConfig[evento] || { tipo: 'mensal' }; // Padrão é mensal
                
                let processarEsteMes = false;
                if (config.tipo === 'mensal') {
                    processarEsteMes = true;
                } else if (config.tipo === 'anual' && config.mes === mes) {
                    processarEsteMes = true;
                }

                if (processarEsteMes) {
                    const { devido, recebido, diferenca, valorCorrigido, juros, indice } = this.simularLinha(evento, currentDate);
                    tableHTML += `<tr class="calculation-row" data-evento="${evento}">
                        <td class="py-3 px-4 text-left">${mesRef}</td>
                        <td class="py-3 px-4 text-left">${evento}</td>
                        <td class="py-3 px-4 text-right">${this.formatToCurrency(devido)}</td>
                        <td class="py-3 px-4 text-right">${this.formatToCurrency(recebido)}</td>
                        <td class="py-3 px-4 text-right text-red-600 font-medium">${this.formatToCurrency(diferenca)}</td>
                        <td class="py-3 px-4 text-right">${juros.toFixed(2)}%</td>
                        <td class="py-3 px-4 text-right">${indice}</td>
                        <td class="py-3 px-4 text-right font-bold" data-valor-corrigido="${valorCorrigido}">${this.formatToCurrency(valorCorrigido)}</td>
                    </tr>`;
                    
                    totais.devido += devido;
                    totais.recebido += recebido;
                    totais.diferenca += diferenca;
                    totais.corrigido += valorCorrigido;
                }
            });
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        tableHTML += `</tbody><tfoot>
                        <tr class="bg-gray-200 font-bold text-sm">
                            <td class="py-2 px-4 text-right" colspan="2">Subtotal</td>
                            <td class="py-2 px-4 text-right">${this.formatToCurrency(totais.devido)}</td>
                            <td class="py-2 px-4 text-right">${this.formatToCurrency(totais.recebido)}</td>
                            <td class="py-2 px-4 text-right">${this.formatToCurrency(totais.diferenca)}</td>
                            <td class="py-2 px-4 text-right" colspan="2"></td>
                            <td class="py-2 px-4 text-right">${this.formatToCurrency(totais.corrigido)}</td>
                        </tr>
                        <tr id="urv-row" class="bg-gray-100 font-semibold hidden"><td class="py-2 px-3 text-sm" colspan="7">URV (%)</td><td id="urv-percent-valor" class="py-2 px-3 text-sm text-right">0.00%</td></tr>
                        <tr id="honorarios-row" class="bg-gray-100 font-semibold hidden"><td class="py-2 px-3 text-sm" colspan="7">Honorários (%)</td><td id="honorarios-percent-valor" class="py-2 px-3 text-sm text-right">0.00%</td></tr>
                        <tr id="multa-row" class="bg-gray-100 font-semibold hidden"><td class="py-2 px-3 text-sm" colspan="7">Multa (%)</td><td id="multa-percent-valor" class="py-2 px-3 text-sm text-right">0.00%</td></tr>
                        <tr class="bg-gray-200 text-gray-800 font-bold text-base"><td class="py-4 px-4 text-right" colspan="7">Total Geral Corrigido</td><td id="total-geral" class="py-4 px-4 text-right">R$ 0,00</td></tr>
                      </tfoot></table></div>`;
        
        resultsContainer.innerHTML = tableHTML;
        
        const updateCallback = () => this.updateTotals();
        this.container.querySelectorAll('input[name="eventoCalcFull"]').forEach(el => el.addEventListener('change', updateCallback));
        this.container.querySelector('#chk-honorarios').addEventListener('change', updateCallback);
        this.container.querySelector('#chk-multa').addEventListener('change', updateCallback);
        this.container.querySelector('#urv-percent')?.addEventListener('input', updateCallback);
        this.container.querySelector('#honorarios-percent')?.addEventListener('input', updateCallback);
        this.container.querySelector('#multa-percent')?.addEventListener('input', updateCallback);

        this.updateTotals();
    }

    simularLinha(evento, currentDate) {
        const urvPercent = this.container.querySelector('#urv-percent').valueAsNumber || 0;
        const baseSalary = 3500;
        let devido = 0;
        let recebido = 0;
        
        switch(evento) {
            case 'Salário Base': devido = baseSalary; recebido = baseSalary * 0.9; break;
            case 'URV': devido = baseSalary * (urvPercent / 100); recebido = 0; break;
            case 'Insalubridade': devido = baseSalary * 0.20; recebido = 0; break;
            case 'Periculosidade': devido = baseSalary * 0.30; recebido = devido * 0.5; break;
            case 'Adicional Noturno': devido = baseSalary * 0.15; recebido = devido * 0.3; break;
            case 'Abono de Permanência': devido = baseSalary * 0.11; recebido = 0; break;
            case 'Licença prêmio': devido = baseSalary * 0.05; recebido = 0; break;
            case 'Férias': devido = baseSalary * 1.33; recebido = baseSalary; break;
            case 'Terço': devido = baseSalary / 3; recebido = 0; break;
            case 'FGTS': devido = baseSalary * 0.08; recebido = 0; break;
            case 'Hora Atividade': devido = baseSalary * 0.05; recebido = 0; break;
            case 'Hora Extra': devido = baseSalary * 0.25; recebido = devido * 0.5; break;
            case '13º Salário': devido = baseSalary; recebido = 0; break; // Valor cheio do salário base
            default: devido = baseSalary * 0.10; recebido = 0;
        }

        const diferenca = devido - recebido;
        const juros = 0.5;
        const indice = 'IPCA-E';
        const valorCorrigido = diferenca * (1 + (juros / 100));
        
        return { devido, recebido, diferenca, valorCorrigido, juros, indice };
    }

    recalculateRow() { /* A lógica de recálculo manual precisaria ser aprimorada para este novo modelo */ this.updateTotals(); }

    updateTotals() {
        let totalPrincipalCorrigido = 0;
        this.container.querySelectorAll('#trabalhista-tbody tr').forEach(row => {
            const cellData = row.cells[7];
            totalPrincipalCorrigido += Number(cellData.dataset.valorCorrigido) || 0;
        });

        const urvPercent = this.container.querySelector('#urv-percent')?.valueAsNumber || 0;
        const chkUrv = this.container.querySelector('input[value="URV"]').checked;
        if (chkUrv) {
            this.container.querySelector('#urv-row').classList.remove('hidden');
            this.container.querySelector('#urv-percent-valor').textContent = `${urvPercent.toFixed(2)}%`;
        } else {
            this.container.querySelector('#urv-row').classList.add('hidden');
        }

        const honorariosPercent = this.container.querySelector('#honorarios-percent')?.valueAsNumber || 0;
        const chkHonorarios = this.container.querySelector('#chk-honorarios').checked;
        let valorHonorarios = 0;
        if (chkHonorarios) {
            valorHonorarios = totalPrincipalCorrigido * (honorariosPercent / 100);
            this.container.querySelector('#honorarios-row').classList.remove('hidden');
            this.container.querySelector('#honorarios-percent-valor').textContent = `${honorariosPercent.toFixed(2)}%`;
        } else {
            this.container.querySelector('#honorarios-row').classList.add('hidden');
        }

        const multaPercent = this.container.querySelector('#multa-percent')?.valueAsNumber || 0;
        const chkMulta = this.container.querySelector('#chk-multa').checked;
        let valorMulta = 0;
        if (chkMulta) {
            valorMulta = totalPrincipalCorrigido * (multaPercent / 100);
            this.container.querySelector('#multa-row').classList.remove('hidden');
            this.container.querySelector('#multa-percent-valor').textContent = `${multaPercent.toFixed(2)}%`;
        } else {
            this.container.querySelector('#multa-row').classList.add('hidden');
        }
        
        const totalGeral = totalPrincipalCorrigido + valorHonorarios + valorMulta;
        
        this.container.querySelector('#total-geral').textContent = this.formatToCurrency(totalGeral);
        
        const valorAcao = this.parseCurrency(this.container.querySelector('#valorAcao').value);
        this.container.querySelector('#valorAcaoSummary').textContent = this.formatToCurrency(valorAcao);
        this.container.querySelector('#valorDevidoSummary').textContent = this.formatToCurrency(totalGeral);
        this.container.querySelector('#diferencaSummary').textContent = this.formatToCurrency(totalGeral - valorAcao);
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
        const eventos = Array.from(this.container.querySelectorAll('#eventos-container-full input:checked')).map(cb => cb.value).join(', ');
        const urvPercent = this.container.querySelector('#urv-percent').value;
        const honorariosPercent = this.container.querySelector('#honorarios-percent').value;
        const multaPercent = this.container.querySelector('#multa-percent').value;
        const chkUrv = this.container.querySelector('input[value="URV"]').checked;
        const chkHonorarios = this.container.querySelector('#chk-honorarios').checked;
        const chkMulta = this.container.querySelector('#chk-multa').checked;

        let acrescimosStr = [];
        if(chkUrv && urvPercent) acrescimosStr.push(`URV (${urvPercent}%)`);
        if(chkHonorarios && honorariosPercent) acrescimosStr.push(`Honorários (${honorariosPercent}%)`);
        if(chkMulta && multaPercent) acrescimosStr.push(`Multa (${multaPercent}%)`);

        const summaryHTML = `
            <div class="report-summary mt-8 p-4 bg-gray-50 rounded-lg border text-sm" style="page-break-inside: avoid;">
                <h5 class="font-bold mb-2 text-base">Resumo da Metodologia de Cálculo</h5>
                <p class="mb-2">O cálculo para <strong>${requerentes}</strong> foi realizado considerando os seguintes parâmetros:</p>
                <ul class="list-disc list-inside space-y-1 mb-4">
                    <li><strong>Período de Apuração:</strong> ${inicioStr} a ${fimStr}</li>
                    <li><strong>Eventos Calculados:</strong> ${eventos || 'Nenhum'}</li>
                    <li><strong>Acréscimos Aplicados:</strong> ${acrescimosStr.length > 0 ? acrescimosStr.join(', ') : 'Nenhum'}</li>
                </ul>
            </div>`;

        const printArea = document.createElement('div');
        printArea.id = 'print-area';
        const header = `<div class="mb-8 border-b pb-4"><h2 class="text-2xl font-bold">Relatório de Cálculo Trabalhista</h2><p><strong>Processo:</strong> ${this.container.querySelector('#processNumber').value}</p><p><strong>Requerentes:</strong> ${requerentes}</p></div>`;
        
        printArea.innerHTML = header + results.innerHTML + summaryHTML;
        document.body.appendChild(printArea);
        window.print();
        document.body.removeChild(printArea);
    }

    clearForm() {
        if (confirm("Tem certeza que deseja limpar todos os dados do cálculo?")) {
            const fieldsToClear = ['#processNumber', '#requerentesInput', '#apuracao-inicio', '#apuracao-fim', '#valorAcao'];
            fieldsToClear.forEach(id => {
                const el = this.container.querySelector(id);
                if (el) el.value = '';
            });

            this.container.querySelector('#results-container').innerHTML = '';
            this.container.querySelector('#valorAcaoSummary').textContent = 'R$ 0,00';
            this.container.querySelector('#valorDevidoSummary').textContent = 'R$ 0,00';
            this.container.querySelector('#diferencaSummary').textContent = 'R$ 0,00';
            alert('Formulário limpo com sucesso.');
        }
    }
    
    formatToCurrency(v) { return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
    parseCurrency(v) { return typeof v !== 'string' ? (Number(v) || 0) : (Number(v.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.')) || 0); }
    applyDateMask(event) { let input = event.target; let value = input.value.replace(/\D/g, ''); if (value.length > 2) value = `${value.substring(0, 2)}/${value.substring(2, 6)}`; input.value = value; }
    parseMaskedDate(maskedDate) { if (!maskedDate || maskedDate.length < 7) return null; const [month, year] = maskedDate.split('/'); return new Date(year, month - 1, 1); }
}