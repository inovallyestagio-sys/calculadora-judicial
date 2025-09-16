class EnquadramentoCalculator {
    constructor(container) {
        this.container = container;
        this.requerenteConfigStorage = {};
        this.mockProcesso = { processNumber: '1111111-11.2025.8.11.0001', requerentes: ["Ana da Silva", "Carlos Pereira"], valorExecutado: 12345.67, dataCitacao: '2024-01-15' };
        this.mockSalarioTabela = { 'Lei 2.361/2001': { 'Nível 1-A': 3200.00, 'Nível 1-B': 3350.00, 'Nível 2-C': 4100.00 }, 'Lei 4.588/2005': { 'Nível 3-A': 4800.00, 'Nível 3-B': 4950.00, 'Nível 3-C': 5100.00 } };
        this.mockIndices = { 'IPCA-E': { juros: 0.005, correcao: 0.003, nome: 'IPCA-E' }, 'SELIC': { juros: 0.000, correcao: 0.009, nome: 'SELIC' } };
        this.eventos = ['Salário Base', '13º Salário', 'Férias', 'FGTS', 'ATS'];

        // Configuração para eventos anuais
        this.eventosConfig = {
            '13º Salário': { tipo: 'anual', mes: 11 }, // Dezembro
            'Férias': { tipo: 'anual', mes: 0 }      // Janeiro (Simulação)
        };

        this.simularExtracaoHandler = this.simularExtracao.bind(this);
        this.calcularHandler = this.calcularValoresEnquadramento.bind(this);
        this.saveParametersHandler = this.saveParametersForRequerente.bind(this);
        this.addPeriodFieldHandler = this.addPeriodField.bind(this);
        this.saveCalculationHandler = this.saveCalculation.bind(this);
        this.generateReportHandler = this.generateReport.bind(this);
        this.clearFormHandler = this.clearForm.bind(this);
    }

    static getHtml() {
        return `
            <div id="formFields">
                <div class="mb-8"><p class="text-gray-600 mb-2">Tipo de Cálculo > Enquadramento Trabalhista</p></div>
                <div class="mb-8"><h3 class="text-xl font-semibold text-primary-blue mb-4">1. Upload e Extração de Dados</h3><div id="uploadArea" class="upload-area p-8 rounded-lg text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-teal transition-colors"><i class="fas fa-cloud-upload-alt text-4xl text-primary-teal mb-4"></i><p class="text-gray-600 mb-2">Clique para simular a extração de dados</p></div></div>
                <div class="mb-8"><h3 class="text-xl font-semibold text-primary-blue mb-4">2. Dados do Processo</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label class="block text-sm font-medium text-gray-700 mb-2">Processo nº</label><input type="text" id="processNumber" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div><div><label class="block text-sm font-medium text-gray-700 mb-2">Data de Citação</label><input type="date" id="dataCitacao" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div><div class="col-span-1 md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">Parte Requerente(s)</label><input type="text" id="requerentesInput" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div><div class="col-span-1 md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">Valor Executado</label><input type="text" id="valorExecutadoInput" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div></div></div>
                <div class="mb-8"><h3 class="text-xl font-semibold text-primary-blue mb-4">3. Configuração de Parâmetros</h3><button type="button" id="openParamsBtn" class="bg-primary-teal hover:bg-secondary-teal text-white px-6 py-3 rounded-lg font-semibold"><i class="fas fa-cogs mr-2"></i>Abrir Configurações</button></div>
                <div class="flex justify-start mb-8"><button id="calculateBtn" class="bg-secondary-blue hover:bg-primary-blue text-white px-8 py-3 rounded-lg font-semibold"><i class="fas fa-calculator mr-2"></i>Calcular Valor</button></div>
                <hr class="my-8"><div id="results-container"></div>
                <div class="summary-container mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"><div class="summary-box bg-white p-6 rounded-lg shadow-lg border"><p class="text-sm text-gray-500 mb-2">VALOR EXECUTADO</p><p class="text-2xl font-bold text-primary-blue" id="valorExecutadoSummary">R$ 0,00</p></div><div class="summary-box bg-white p-6 rounded-lg shadow-lg border"><p class="text-sm text-gray-500 mb-2">VALOR ATUALIZADO (TOTAL)</p><p class="text-2xl font-bold text-primary-blue" id="valorAtualizadoSummary">R$ 0,00</p></div><div class="summary-box bg-white p-6 rounded-lg shadow-lg border"><p class="text-sm text-gray-500 mb-2">PROVEITO ECONÔMICO</p><p class="text-2xl font-bold text-primary-blue" id="proveitoEconomicoSummary">R$ 0,00</p></div></div>
                <div class="flex flex-wrap gap-4 justify-center mt-8 no-print">
                    <button id="saveBtn" class="bg-secondary-blue hover:bg-primary-blue text-white px-8 py-3 rounded-lg font-semibold"><i class="fas fa-save mr-2"></i>Salvar Cálculo</button>
                    <button id="reportBtn" class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold"><i class="fas fa-file-pdf mr-2"></i>Gerar Relatório</button>
                    <button id="clearBtn" class="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold"><i class="fas fa-eraser mr-2"></i>Limpar Formulário</button>
                </div>
            </div>
            <div id="parametersModal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black bg-opacity-50 modal"><div class="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full modal-content"><div class="flex justify-between items-center pb-3 border-b mb-4"><h3 class="text-2xl font-semibold text-primary-blue">Configurar Parâmetros</h3><button id="closeParamsModal" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button></div><div class="space-y-6"><p class="text-gray-700">Selecione um requerente para configurar os parâmetros.</p><div id="requerentes-params-container" class="space-y-4"></div></div><div class="mt-8 flex justify-end space-x-4"><button id="closeParamsModalBtn" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg">Fechar</button></div></div></div>
            <div id="requerenteParamModal" class="fixed inset-0 z-[60] hidden items-center justify-center p-4 bg-black bg-opacity-50 modal"><div class="bg-white rounded-lg shadow-xl p-8 max-w-6xl w-full modal-content"><div class="flex justify-between items-center pb-3 border-b mb-4"><h3 class="text-2xl font-semibold text-primary-blue">Parâmetros para <span id="requerenteNomeTitle"></span></h3><button id="closeRequerenteModal" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button></div><div class="space-y-6"><div><h4 class="text-lg font-semibold text-gray-700 mb-4">Eventos a Calcular</h4><div id="eventos-container" class="flex flex-wrap gap-4"></div></div><hr class="my-6"><div><h4 class="text-lg font-semibold text-gray-700 mb-4">Período Geral e Consulta</h4><div id="turmalina-container" class="grid grid-cols-1 md:grid-cols-5 gap-6 items-end"><div><label class="block text-sm font-medium text-gray-700 mb-2">Início</label><input type="text" id="turmalina-inicio" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="mm/aaaa" maxlength="7"></div><div><label class="block text-sm font-medium text-gray-700 mb-2">Fim</label><input type="text" id="turmalina-fim" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="mm/aaaa" maxlength="7"></div><div><label class="block text-sm font-medium text-gray-700 mb-2">Cargo</label><input type="text" id="cargoRequerente" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div><div><label class="block text-sm font-medium text-gray-700 mb-2">Valor Recebido</label><input type="text" id="valorRecebidoTurmalina" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" readonly></div><div><button id="consultarTurmalinaBtn" class="bg-primary-teal hover:bg-secondary-teal text-white px-4 py-3 rounded-lg font-semibold w-full"><i class="fas fa-database mr-2"></i>Consultar</button></div></div></div><hr class="my-6"><div><h4 class="text-lg font-semibold text-gray-700 mb-4">Sub-Períodos de Cálculo e Índices</h4><div id="periodos-container" class="space-y-4"></div><button id="addPeriodoBtn" class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"><i class="fas fa-plus mr-2"></i>Adicionar Sub-Período</button></div></div><div class="mt-8 flex justify-end space-x-4 border-t pt-6 bg-white p-6 -mx-8 -mb-8 rounded-b-lg"><button id="cancelRequerenteModalBtn" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg">Cancelar</button><button id="saveParamsBtn" class="bg-primary-blue hover:bg-secondary-blue text-white font-semibold px-6 py-3 rounded-lg">Salvar Parâmetros</button></div></div></div>
            <template id="periodo-template"><div class="periodo-item grid grid-cols-1 md:grid-cols-6 gap-x-4 gap-y-2 items-end p-4 border rounded-lg bg-gray-50"><div class="md:col-span-1"><label class="block text-sm font-medium text-gray-700">Início</label><input type="text" name="periodo_inicio" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="mm/aaaa" maxlength="7"></div><div class="md:col-span-1"><label class="block text-sm font-medium text-gray-700">Fim</label><input type="text" name="periodo_fim" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="mm/aaaa" maxlength="7"></div><div class="md:col-span-1"><label class="block text-sm font-medium text-gray-700">Nível/Classe</label><select name="periodo_nivel" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></select></div><div class="md:col-span-1"><label class="block text-sm font-medium text-gray-700">Índice</label><select name="periodo_indice" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></select></div><div class="md:col-span-1"><label class="block text-sm font-medium text-gray-700">Taxa Juros</label><input type="text" name="periodo_taxa" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" readonly></div><div class="md:col-span-1"><button name="remove_periodo" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg w-full"><i class="fas fa-trash"></i></button></div></div></template>
        `;
    }

    init() {
        this.uploadArea = this.container.querySelector('#uploadArea');
        this.calculateBtn = this.container.querySelector('#calculateBtn');
        this.openParamsBtn = this.container.querySelector('#openParamsBtn');
        this.saveBtn = this.container.querySelector('#saveBtn');
        this.reportBtn = this.container.querySelector('#reportBtn');
        this.clearBtn = this.container.querySelector('#clearBtn');

        this.uploadArea.addEventListener('click', this.simularExtracaoHandler);
        this.calculateBtn.addEventListener('click', this.calcularHandler);
        this.openParamsBtn.addEventListener('click', () => this.openModal('parametersModal'));

        // Listeners para os modais
        const paramsModal = document.getElementById('parametersModal');
        paramsModal.querySelector('#closeParamsModal').addEventListener('click', () => this.closeModal('parametersModal'));
        paramsModal.querySelector('#closeParamsModalBtn').addEventListener('click', () => this.closeModal('parametersModal'));
        
        const reqModal = document.getElementById('requerenteParamModal');
        reqModal.querySelector('#closeRequerenteModal').addEventListener('click', () => this.closeModal('requerenteParamModal'));
        reqModal.querySelector('#cancelRequerenteModalBtn').addEventListener('click', () => this.closeModal('requerenteParamModal'));
        reqModal.querySelector('#saveParamsBtn').addEventListener('click', this.saveParametersHandler);
        reqModal.querySelector('#addPeriodoBtn').addEventListener('click', this.addPeriodFieldHandler);
        reqModal.querySelector('#consultarTurmalinaBtn').addEventListener('click', (e) => this.consultarTurmalina(e.target));
        
        reqModal.querySelector('#turmalina-inicio').addEventListener('input', (e) => this.applyDateMask(e));
        reqModal.querySelector('#turmalina-fim').addEventListener('input', (e) => this.applyDateMask(e));
        
        // Listeners para os botões de ação principais
        this.saveBtn.addEventListener('click', this.saveCalculationHandler);
        this.reportBtn.addEventListener('click', this.generateReportHandler);
        this.clearBtn.addEventListener('click', this.clearFormHandler);
    }

    destroy() {
        this.uploadArea.removeEventListener('click', this.simularExtracaoHandler);
        this.calculateBtn.removeEventListener('click', this.calcularHandler);
        this.saveBtn.removeEventListener('click', this.saveCalculationHandler);
        this.reportBtn.removeEventListener('click', this.generateReportHandler);
        this.clearBtn.removeEventListener('click', this.clearFormHandler);
    }
    
    openModal(id) {
        const modal = document.getElementById(id);
        if(!modal) return;
        modal.classList.add('flex');
        modal.classList.remove('hidden');
        modal.classList.add('open');
        document.body.classList.add('overflow-hidden');
        if (id === 'parametersModal') {
            this.populateRequerentesParams();
        }
    }
    
    closeModal(id) {
        const modal = document.getElementById(id);
        if(!modal) return;
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        modal.classList.remove('open');
        if (!document.querySelector('.modal.open')) {
            document.body.classList.remove('overflow-hidden');
        }
    }
    
    simularExtracao() {
        alert(`Simulando extração de dados para ENQUADRAMENTO...`);
        this.container.querySelector('#processNumber').value = this.mockProcesso.processNumber;
        this.container.querySelector('#dataCitacao').value = this.mockProcesso.dataCitacao;
        this.container.querySelector('#requerentesInput').value = this.mockProcesso.requerentes.join(', ');
        this.container.querySelector('#valorExecutadoInput').value = this.formatToCurrency(this.mockProcesso.valorExecutado);
        
        this.requerenteConfigStorage = {};
        this.mockProcesso.requerentes.forEach(nome => {
            this.requerenteConfigStorage[nome] = { isConfigured: false, eventos: [], periodos: [], dadosTurmalina: {}, periodoGeral: {} };
        });
    }

    populateRequerentesParams() {
        const container = document.getElementById('requerentes-params-container');
        const requerentes = document.getElementById('requerentesInput').value.split(',').map(n => n.trim()).filter(Boolean);
        container.innerHTML = '';
        if(requerentes.length === 0) { container.innerHTML = '<p class="text-gray-500">Simule a extração de dados primeiro.</p>'; return; }
        
        requerentes.forEach(nome => {
            const config = this.requerenteConfigStorage[nome];
            const isConfigured = config && config.isConfigured;
            const icon = isConfigured ? '✅' : '⚫';
            const colorClasses = isConfigured ? 'bg-green-100 hover:bg-green-200 text-green-800 font-semibold' : 'bg-gray-100 hover:bg-gray-200';
            
            const button = document.createElement('button');
            button.innerHTML = `<span class="mr-3">${icon}</span> ${nome}`;
            button.className = `w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center ${colorClasses}`;
            button.onclick = () => this.openRequerenteParamModal(nome);
            container.appendChild(button);
        });
    }

    openRequerenteParamModal(requerenteNome) {
        const modal = document.getElementById('requerenteParamModal');
        modal.dataset.currentRequerente = requerenteNome;
        document.getElementById('requerenteNomeTitle').textContent = requerenteNome;
        const config = this.requerenteConfigStorage[requerenteNome];
        
        const eventosContainer = document.getElementById('eventos-container');
        eventosContainer.innerHTML = '';
        this.eventos.forEach(evento => {
            const isChecked = config.eventos.includes(evento) || (config.eventos.length === 0 && evento === 'Salário Base');
            eventosContainer.innerHTML += `<label class="flex items-center space-x-2"><input type="checkbox" name="eventoCalc" value="${evento}" class="rounded text-primary-teal" ${isChecked ? 'checked' : ''}><span>${evento}</span></label>`;
        });

        modal.querySelector('#turmalina-inicio').value = this.formatToMMYYYY(config.periodoGeral.inicio);
        modal.querySelector('#turmalina-fim').value = this.formatToMMYYYY(config.periodoGeral.fim);
        modal.querySelector('#cargoRequerente').value = config.dadosTurmalina.cargo || '';
        modal.querySelector('#valorRecebidoTurmalina').value = config.dadosTurmalina.valorTotal ? this.formatToCurrency(config.dadosTurmalina.valorTotal) : '';
        
        const periodosContainer = modal.querySelector('#periodos-container');
        periodosContainer.innerHTML = '';
        if (config.periodos && config.periodos.length > 0) {
            config.periodos.forEach(p => this.addPeriodField(p));
        } else {
            this.addPeriodField();
        }
        this.openModal('requerenteParamModal');
    }

    consultarTurmalina(button) {
        const modal = document.getElementById('requerenteParamModal');
        const requerenteNome = modal.dataset.currentRequerente;
        const inicio = modal.querySelector('#turmalina-inicio').value;
        const fim = modal.querySelector('#turmalina-fim').value;
        if (!inicio || !fim || inicio.length < 7 || fim.length < 7) {
            alert("Por favor, preencha o Período Geral (Início e Fim) antes de consultar.");
            return;
        }
        alert(`Consultando Turmalina para ${requerenteNome}...`);
        const randomCargo = 'Professor Nível Superior 25H'; 
        const randomValor = 80000 + Math.random() * 20000;
        const randomMatricula = Math.floor(1000 + Math.random() * 9000);
        modal.querySelector('#cargoRequerente').value = randomCargo;
        modal.querySelector('#valorRecebidoTurmalina').value = this.formatToCurrency(randomValor);
    
        if(this.requerenteConfigStorage[requerenteNome]) {
            this.requerenteConfigStorage[requerenteNome].dadosTurmalina = { matricula: randomMatricula, valorTotal: randomValor, cargo: randomCargo };
        }
    }
        
    addPeriodField(data = {}) {
        const template = document.getElementById('periodo-template');
        const clone = template.content.firstElementChild.cloneNode(true);
        const nivelSelect = clone.querySelector('select[name="periodo_nivel"]');
        const indiceSelect = clone.querySelector('select[name="periodo_indice"]');
        
        Object.values(this.mockSalarioTabela).forEach(tabela => Object.keys(tabela).forEach(nivel => nivelSelect.add(new Option(nivel, nivel))));
        
        indiceSelect.add(new Option("Selecione...", "", true, true));
        Object.keys(this.mockIndices).forEach(nome => indiceSelect.add(new Option(nome.trim(), nome.trim())));
        
        const periodosContainer = document.getElementById('periodos-container');
        const allPeriods = periodosContainer.querySelectorAll('.periodo-item');
        let initialStartDate = '';
        if (allPeriods.length === 0) {
            initialStartDate = document.getElementById('turmalina-inicio').value;
        } else {
            const lastPeriodFim = allPeriods[allPeriods.length - 1].querySelector('input[name="periodo_fim"]').value;
            initialStartDate = this.getNextMonth(lastPeriodFim);
        }
        
        const inicioInput = clone.querySelector('input[name="periodo_inicio"]');
        inicioInput.value = data.inicio ? this.formatToMMYYYY(data.inicio) : initialStartDate;
        inicioInput.addEventListener('input', (e) => this.applyDateMask(e));
        inicioInput.addEventListener('change', (e) => this.updateTaxRate(e));

        const fimInput = clone.querySelector('input[name="periodo_fim"]');
        fimInput.value = data.fim ? this.formatToMMYYYY(data.fim) : '';
        fimInput.addEventListener('input', (e) => this.applyDateMask(e));
        fimInput.addEventListener('change', (e) => this.updateTaxRate(e));

        clone.querySelector('select[name="periodo_indice"]').addEventListener('change', (e) => this.updateTaxRate(e));
        clone.querySelector('button[name="remove_periodo"]').addEventListener('click', (e) => e.target.closest('.periodo-item').remove());
        
        if(data.nivel) nivelSelect.value = data.nivel;
        if(data.indice) { indiceSelect.value = data.indice; this.updateTaxRate({ target: indiceSelect }); }

        periodosContainer.appendChild(clone);
    }

    saveParametersForRequerente() {
        const modal = document.getElementById('requerenteParamModal');
        const requerenteNome = modal.dataset.currentRequerente;
        
        const tempConfig = {
            eventos: Array.from(modal.querySelectorAll('#eventos-container input:checked')).map(cb => cb.value),
            dadosTurmalina: { ...this.requerenteConfigStorage[requerenteNome].dadosTurmalina },
            periodoGeral: { inicio: modal.querySelector('#turmalina-inicio').value, fim: modal.querySelector('#turmalina-fim').value },
            periodos: Array.from(modal.querySelectorAll('.periodo-item')).map(item => ({
                inicio: item.querySelector('input[name="periodo_inicio"]').value,
                fim: item.querySelector('input[name="periodo_fim"]').value,
                nivel: item.querySelector('select[name="periodo_nivel"]').value,
                indice: item.querySelector('select[name="periodo_indice"]').value,
            }))
        };
        
        const validation = this.validateParameters(tempConfig);
        if (!validation.isValid) {
            alert(`Erro de Validação: ${validation.message}`);
            return;
        }

        const finalConfig = this.requerenteConfigStorage[requerenteNome];
        finalConfig.isConfigured = true;
        finalConfig.eventos = tempConfig.eventos;
        finalConfig.dadosTurmalina = tempConfig.dadosTurmalina;
        finalConfig.periodoGeral = { inicio: this.formatToYYYYMM(tempConfig.periodoGeral.inicio), fim: this.formatToYYYYMM(tempConfig.periodoGeral.fim) };
        finalConfig.periodos = tempConfig.periodos.map(p => ({ ...p, inicio: this.formatToYYYYMM(p.inicio), fim: this.formatToYYYYMM(p.fim) }));

        alert(`Parâmetros para ${requerenteNome} foram salvos com sucesso!`);
        this.closeModal('requerenteParamModal');
        this.populateRequerentesParams();
    }

    validateParameters(config) {
        if (!config.periodoGeral.inicio || !config.periodoGeral.fim) return { isValid: false, message: "O Período Geral (Início e Fim) na seção Turmalina deve ser preenchido." };
        if (config.periodos.length === 0) return { isValid: false, message: "Adicione pelo menos um Sub-Período de Cálculo." };
        
        for (let i = 0; i < config.periodos.length; i++) {
            const p = config.periodos[i];
            if (!p.inicio || !p.fim || !p.nivel || !p.indice) return { isValid: false, message: `O Sub-Período #${i + 1} está incompleto. Preencha todos os campos.` };
        }

        if (config.periodoGeral.inicio !== config.periodos[0].inicio) return { isValid: false, message: "O início do primeiro Sub-Período não corresponde ao início do Período Geral." };
        if (config.periodoGeral.fim !== config.periodos[config.periodos.length - 1].fim) return { isValid: false, message: "O fim do último Sub-Período não corresponde ao fim do Período Geral." };

        for (let i = 0; i < config.periodos.length - 1; i++) {
            if (this.getNextMonth(config.periodos[i].fim) !== config.periodos[i + 1].inicio) return { isValid: false, message: `Há uma falha ou sobreposição na linha do tempo entre o Sub-Período #${i + 1} e #${i + 2}.` };
        }
        
        return { isValid: true, message: "Configuração válida." };
    }
            
    calcularValoresEnquadramento() {
        const resultsContainer = this.container.querySelector('#results-container');
        resultsContainer.innerHTML = '';
        let totalGeralAtualizado = 0;
        const valorExecutado = this.parseCurrency(this.container.querySelector('#valorExecutadoInput').value);
        const requerentes = Object.keys(this.requerenteConfigStorage);

        if (requerentes.length === 0) {
            alert('Simule a extração de dados antes de calcular.');
            return;
        }

        requerentes.forEach(nome => {
            const config = this.requerenteConfigStorage[nome];
            if (!config || !config.isConfigured) {
                console.warn(`Cálculo para ${nome} pulado: Parâmetros não configurados/salvos.`);
                return;
            }
            
            let bodyHTML = '';
            let totais = { devido: 0, recebido: 0, diferenca: 0, atualizado: 0 };
            const numMesesTotal = config.periodos.reduce((acc, p) => acc + this.countMonths(p.inicio, p.fim), 0);
            const valorRecebidoMensal = numMesesTotal > 0 ? (config.dadosTurmalina.valorTotal || 0) / numMesesTotal : 0;

            config.periodos.forEach(periodo => {
                let currentDate = new Date(periodo.inicio + '-02T00:00:00Z');
                const endDate = new Date(periodo.fim + '-02T00:00:00Z');

                while (currentDate <= endDate) {
                    const mes = currentDate.getUTCMonth();
                    const mesRef = currentDate.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric', timeZone: 'UTC' });
                    
                    config.eventos.forEach(evento => {
                        const eventoConfig = this.eventosConfig[evento] || { tipo: 'mensal' };
                        let processarEsteMes = false;
                        if (eventoConfig.tipo === 'mensal') processarEsteMes = true;
                        else if (eventoConfig.tipo === 'anual' && eventoConfig.mes === mes) processarEsteMes = true;

                        if (processarEsteMes) {
                            const leiAplicada = this.getLeiParaNivel(periodo.nivel);
                            const valorDevidoBase = this.mockSalarioTabela[leiAplicada]?.[periodo.nivel] || 0;
                            const indiceInfo = this.mockIndices[periodo.indice];
                            if (!indiceInfo) {
                                console.error(`Índice "${periodo.indice}" não encontrado. Verifique o mockIndices.`);
                                return;
                            }
                            
                            let devidoEvento = 0;
                            if (evento === 'Salário Base' || evento === '13º Salário' || evento === 'Férias') {
                                devidoEvento = valorDevidoBase;
                            } else {
                                devidoEvento = valorDevidoBase * 0.1; // Simulação para outros eventos como ATS/FGTS
                            }

                            let recebidoEvento = valorRecebidoMensal * (devidoEvento / valorDevidoBase);
                            if (evento === '13º Salário' || evento === 'Férias') recebidoEvento = 0; // Simula não pagamento de anuais
                            
                            const diferenca = devidoEvento - recebidoEvento;
                            const valorAtualizado = diferenca * (1 + indiceInfo.correcao + indiceInfo.juros);
                            
                            totais.devido += devidoEvento; 
                            totais.recebido += recebidoEvento; 
                            totais.diferenca += diferenca; 
                            totais.atualizado += valorAtualizado;
                            
                            bodyHTML += `
                                <tr class="border-b border-gray-200">
                                    <td class="py-2 px-3">${leiAplicada}</td>
                                    <td class="py-2 px-3">${evento}</td>
                                    <td class="py-2 px-3">${mesRef}</td>
                                    <td class="py-2 px-3">${periodo.nivel}</td>
                                    <td class="py-2 px-3 text-right">${this.formatToCurrency(devidoEvento)}</td>
                                    <td class="py-2 px-3 text-right">${this.formatToCurrency(recebidoEvento)}</td>
                                    <td class="py-2 px-3 text-right font-medium ${diferenca > 0 ? 'text-red-600' : 'text-green-600'}">${this.formatToCurrency(diferenca)}</td>
                                    <td class="py-2 px-3 text-right font-bold">${this.formatToCurrency(valorAtualizado)}</td>
                                    <td class="py-2 px-3 text-right">${((indiceInfo.juros + indiceInfo.correcao) * 100).toFixed(2)}%</td>
                                    <td class="py-2 px-3 text-right">${indiceInfo.nome}</td>
                                </tr>`;
                        }
                    });
                    currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
                }
            });

            totalGeralAtualizado += totais.atualizado;
            resultsContainer.innerHTML += `
                <div class="requerente-bloco" data-requerente-nome="${nome}">
                    <h3 class="text-2xl font-semibold text-primary-blue mb-4 no-print">${nome}</h3>
                    <div class="overflow-x-auto rounded-lg shadow-lg">
                        <table class="calculation-table w-full border-collapse table-auto">
                            <thead>
                                <tr class="bg-gray-200 text-gray-700 uppercase text-xs leading-normal">
                                    <th class="py-3 px-4 text-left">Lei Aplicada</th>
                                    <th class="py-3 px-4 text-left">Descrição</th>
                                    <th class="py-3 px-4 text-left">Mês Ref.</th>
                                    <th class="py-3 px-4 text-left">Nível/Classe</th>
                                    <th class="py-3 px-4 text-right">Devido</th>
                                    <th class="py-3 px-4 text-right">Recebido</th>
                                    <th class="py-3 px-4 text-right">Diferença</th>
                                    <th class="py-3 px-4 text-right">Valor Atualizado</th>
                                    <th class="py-3 px-4 text-right">Juros(%)</th>
                                    <th class="py-3 px-4 text-right">Índice</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white text-gray-600 text-sm font-light divide-y divide-gray-200">${bodyHTML}</tbody>
                            <tfoot>
                                <tr class="bg-gray-50 text-gray-700 font-bold">
                                    <td class="py-3 px-4 text-right" colspan="4">Total (${nome})</td>
                                    <td class="py-3 px-4 text-right">${this.formatToCurrency(totais.devido)}</td>
                                    <td class="py-3 px-4 text-right">${this.formatToCurrency(totais.recebido)}</td>
                                    <td class="py-3 px-4 text-right">${this.formatToCurrency(totais.diferenca)}</td>
                                    <td class="py-3 px-4 text-right">${this.formatToCurrency(totais.atualizado)}</td>
                                    <td class="py-3 px-4 text-right" colspan="2"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>`;
        });
        
        this.container.querySelector('#valorExecutadoSummary').textContent = this.formatToCurrency(valorExecutado);
        this.container.querySelector('#valorAtualizadoSummary').textContent = this.formatToCurrency(totalGeralAtualizado);
        this.container.querySelector('#proveitoEconomicoSummary').textContent = this.formatToCurrency(totalGeralAtualizado - valorExecutado);
    }
    
    updateTaxRate(event) {
        const row = event.target.closest('.periodo-item');
        const indiceSelect = row.querySelector('select[name="periodo_indice"]');
        const taxaInput = row.querySelector('input[name="periodo_taxa"]');
        const indiceName = indiceSelect.value;

        if (!indiceName) {
            taxaInput.value = '';
            return;
        }

        const indiceInfo = this.mockIndices[indiceName];
        if (!indiceInfo) return;
        
        if (indiceName.includes('SELIC')) {
            taxaInput.value = 'N/A';
        } else {
            const jurosMensal = indiceInfo.juros || 0;
            taxaInput.value = (jurosMensal * 100).toFixed(2) + '% a.m.';
        }
    }
    
    applyDateMask(event) {
        let input = event.target;
        let value = input.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = `${value.substring(0, 2)}/${value.substring(2, 6)}`;
        }
        input.value = value;
    }
    
    parseMaskedDate(maskedDate) {
        if (!maskedDate || maskedDate.length < 7) return null;
        const [month, year] = maskedDate.split('/');
        return new Date(year, month - 1, 1);
    }
    
    formatToYYYYMM(maskedDate) {
        if (!maskedDate || maskedDate.length < 7) return '';
        const [month, year] = maskedDate.split('/');
        return `${year}-${month.padStart(2, '0')}`;
    }
    
    formatToMMYYYY(yyyyMM) {
        if (!yyyyMM || yyyyMM.length < 7) return '';
        const [year, month] = yyyyMM.split('-');
        return `${month.padStart(2, '0')}/${year}`;
    }
    
    getNextMonth(maskedDate) {
        if (!maskedDate || maskedDate.length < 7) return '';
        const date = this.parseMaskedDate(maskedDate);
        date.setMonth(date.getMonth() + 1);
        const nextMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        const nextYear = date.getFullYear();
        return `${nextMonth}/${nextYear}`;
    }
    
    getLeiParaNivel(nivel) {
        for (const lei in this.mockSalarioTabela) {
            if (this.mockSalarioTabela[lei][nivel]) {
                return lei;
            }
        }
        return 'Lei não encontrada';
    }
    
    countMonths(start, end) {
        if (!start || !end) return 0;
        const s = new Date(start);
        const e = new Date(end);
        return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
    }
    
    formatToCurrency(v) {
        return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    
    parseCurrency(v) {
        return typeof v !== 'string' ? (Number(v) || 0) : (Number(v.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.')) || 0);
    }

    saveCalculation() {
        alert('Funcionalidade "Salvar Cálculo" em desenvolvimento.');
    }
    
    generateReport() {
        const results = this.container.querySelector('#results-container');
        if (!results.innerHTML.trim()) {
            alert("É necessário calcular os valores antes de gerar um relatório.");
            return;
        }

        const printArea = document.createElement('div');
        printArea.id = 'print-area';
        const header = `<div class="mb-8 border-b pb-4"><h2 class="text-2xl font-bold">Relatório de Cálculo de Enquadramento</h2><p><strong>Processo:</strong> ${this.container.querySelector('#processNumber').value}</p><p><strong>Requerentes:</strong> ${this.container.querySelector('#requerentesInput').value}</p></div>`;
        
        // Clona o conteúdo para não modificar a tela original
        const contentToPrint = results.cloneNode(true);

        // Adiciona o resumo a cada bloco de requerente no conteúdo clonado
        contentToPrint.querySelectorAll('.requerente-bloco').forEach(bloco => {
            const nome = bloco.dataset.requerenteNome;
            const config = this.requerenteConfigStorage[nome];
            if (!config) return;

            const dataCitacaoVal = this.container.querySelector('#dataCitacao').value;
            const dataCitacaoFmt = dataCitacaoVal ? new Date(dataCitacaoVal + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informada';
            const enquadramentos = config.periodos.map(p => {
                const inicioFmt = this.formatToMMYYYY(p.inicio);
                const fimFmt = this.formatToMMYYYY(p.fim);
                return `${p.nivel} (${inicioFmt} a ${fimFmt})`;
            }).join(', ');
            const indicesUnicos = [...new Set(config.periodos.map(p => p.indice))].join(', ');
            const leisUnicas = [...new Set(config.periodos.map(p => this.getLeiParaNivel(p.nivel)))].join(', ');
            
            const resumoHTML = `
                <div class="report-summary mt-6 p-4 bg-gray-50 rounded-lg border text-sm" style="page-break-inside: avoid;">
                    <h5 class="font-bold mb-2">Resumo da Metodologia de Cálculo</h5>
                    <p>O cálculo para <strong>${nome}</strong> (matrícula ${config.dadosTurmalina.matricula || 'N/D'}) foi realizado com base na(s) lei(s) <strong>${leisUnicas}</strong>, para o cargo de <strong>${config.dadosTurmalina.cargo || 'N/D'}</strong>. O período de apuração total considerou os seguintes enquadramentos: <strong>${enquadramentos}</strong>.</p>
                    <p>Os valores recebidos foram obtidos via consulta simulada ao sistema <strong>Turmalina</strong>. A correção monetária foi aplicada com o(s) índice(s) <strong>${indicesUnicos}</strong>, calculada a partir da data de citação em <strong>${dataCitacaoFmt}</strong>.</p>
                </div>`;
            bloco.innerHTML += resumoHTML;
        });
        
        printArea.innerHTML = header + contentToPrint.innerHTML;
        document.body.appendChild(printArea);
        window.print();
        document.body.removeChild(printArea);
    }
    
    clearForm() {
        if (confirm("Tem certeza que deseja limpar todos os dados do cálculo?")) {
            this.container.querySelectorAll('input, select').forEach(el => { if(!el.closest('.modal')) el.value = ''; });
            this.container.querySelector('#results-container').innerHTML = '';
            this.container.querySelector('#valorExecutadoSummary').textContent = 'R$ 0,00';
            this.container.querySelector('#valorAtualizadoSummary').textContent = 'R$ 0,00';
            this.container.querySelector('#proveitoEconomicoSummary').textContent = 'R$ 0,00';
            this.requerenteConfigStorage = {};
            alert('Formulário limpo com sucesso.');
        }
    }
}