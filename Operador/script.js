// script.js

document.addEventListener('DOMContentLoaded', () => {
    const userDropdownBtn = document.getElementById('userDropdownBtn');
    const userDropdown = document.getElementById('userDropdown');
    const calculationTypeSelect = document.getElementById('calculationType');
    const formFields = document.getElementById('formFields');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    let selectedCalculationType = null;

    const valorAcaoInput = document.getElementById('valorAcaoInput');
    const valorRecebidoTurmalina = document.getElementById('valorRecebidoTurmalina');
    const cargoTurmalina = document.getElementById('cargoTurmalina');
    const leiVigenteSelect = document.getElementById('leiVigente');
    const nivelClasseSelect = document.getElementById('nivelClasse');
    const tipoIndiceInput = document.getElementById('tipoIndice');
    const taxaInput = document.getElementById('taxa');
    const honorariosInput = document.getElementById('honorarios');
    const calculationTableBody = document.getElementById('calculationTableBody');
    const totalDevidoDisplay = document.getElementById('totalDevido');
    const totalRecebidoDisplay = document.getElementById('totalRecebido');
    const totalSingeloDisplay = document.getElementById('totalSingelo');
    const totalAtualizadoDisplay = document.getElementById('totalAtualizado');
    const totalJurosDisplay = document.getElementById('totalJuros');
    const valorAcaoSummary = document.getElementById('valorAcao');
    const valorDevidoCorrigidoSummary = document.getElementById('valorDevidoCorrigido');
    const proveitoEconomicoSummary = document.getElementById('proveitoEconomico');
    const fileInput = document.getElementById('fileInput');

    const mockData = {
        turmalina: {
            valorRecebido: 15000.00,
            cargo: "Analista Judiciário",
            eventos: [
                { descricao: "Salário Base", mesRef: "2019-01", valorRecebido: 3000.00 },
                { descricao: "Salário Base", mesRef: "2019-02", valorRecebido: 3000.00 },
                { descricao: "13º Salário", mesRef: "2019-12", valorRecebido: 3000.00 },
                { descricao: "FGTS", mesRef: "2019-01", valorRecebido: 240.00 },
                { descricao: "FGTS", mesRef: "2019-02", valorRecebido: 240.00 },
                { descricao: "Férias", mesRef: "2020-07", valorRecebido: 4520.00 }
            ]
        },
        leis: [
            { id: "lei-2017", nome: "Lei Nº 4.293/2017", indice: "IPCA", taxa: 0.5 },
            { id: "lei-2019", nome: "Lei Nº 5.123/2019", indice: "INPC", taxa: 0.75 }
        ],
        niveisClasses: [
            { id: "nivel-1-classe-a", nome: "Nível 1, Classe A", valorDevido: 4000.00 },
            { id: "nivel-1-classe-b", nome: "Nível 1, Classe B", valorDevido: 4500.00 },
            { id: "nivel-2-classe-a", nome: "Nível 2, Classe A", valorDevido: 5000.00 }
        ]
    };


    function toggleUserDropdown() {
        userDropdown.classList.toggle('show');
    }
    document.addEventListener('click', function (event) {
        if (!userDropdownBtn.contains(event.target) && !userDropdown.contains(event.target)) {
            userDropdown.classList.remove('show');
        }
    });
    userDropdownBtn.addEventListener('click', toggleUserDropdown);

    sidebarToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    calculationTypeSelect.addEventListener('change', (event) => {
        selectedCalculationType = event.target.value;
        const isTrabalhista = selectedCalculationType === 'trabalhista';
        formFields.classList.toggle('hidden', !isTrabalhista);
    });


    mockData.leis.forEach(lei => {
        const option = document.createElement('option');
        option.value = lei.id;
        option.textContent = lei.nome;
        leiVigenteSelect.appendChild(option);
    });

    mockData.niveisClasses.forEach(nc => {
        const option = document.createElement('option');
        option.value = nc.id;
        option.textContent = nc.nome;
        nivelClasseSelect.appendChild(option);
    });

    leiVigenteSelect.addEventListener('change', () => {
        const selectedLei = mockData.leis.find(l => l.id === leiVigenteSelect.value);
        if (selectedLei) {
            tipoIndiceInput.value = selectedLei.indice;
            taxaInput.value = (selectedLei.taxa * 100).toFixed(2).replace('.', ',') + "%";
        }
    });

    fileInput.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            handleFileUpload(event.target.files[0]);
        }
    });

    function handleFileUpload(file) {
        if (file) {
            alert(`Simulando extração de dados do arquivo: ${file.name}`);
            setTimeout(() => {
                document.getElementById('processNumber').value = '0012345-67.2023.5.01.0000';
                document.getElementById('requerente').value = 'João da Silva';
                valorAcaoInput.value = 'R$ 50.000,00';
                valorAcaoSummary.textContent = 'R$ 50.000,00';
            }, 1000);
        }
    }


    window.consultarTurmalina = function () {
        alert("Consultando dados no sistema Turmalina (simulação)...");
        valorRecebidoTurmalina.value = formatToCurrency(mockData.turmalina.valorRecebido);
        cargoTurmalina.value = mockData.turmalina.cargo;
    };

    window.calcularValores = function () {
        calculationTableBody.innerHTML = '';
        
        let totalDevido = 0, totalRecebido = 0, totalSingelo = 0, totalAtualizado = 0, totalJuros = 0;
        
        const honorarios = parseFloat(honorariosInput.value.replace('R$', '').replace(/\./g, '').replace(',', '.') || 0);
        const taxa = parseFloat(taxaInput.value.replace('%', '').replace(',', '.') / 100 || 0);
        
        mockData.turmalina.eventos.forEach(evento => {
            const nivelClasseData = mockData.niveisClasses.find(nc => nc.id === nivelClasseSelect.value);
            const valorDevido = nivelClasseData ? nivelClasseData.valorDevido : 0;
            
            const valorSingelo = valorDevido - evento.valorRecebido;
            const valorAtualizado = (valorDevido * (1 + taxa)) + honorarios;
            const jurosCompensatorios = valorDevido * taxa;
            
            addTableRow(
                leiVigenteSelect.options[leiVigenteSelect.selectedIndex].text,
                evento.descricao,
                evento.mesRef,
                nivelClasseData ? nivelClasseData.nome : 'N/A',
                valorDevido,
                evento.valorRecebido,
                valorSingelo,
                valorAtualizado,
                jurosCompensatorios
            );

            totalDevido += valorDevido;
            totalRecebido += evento.valorRecebido;
            totalSingelo += valorSingelo;
            totalAtualizado += valorAtualizado;
            totalJuros += jurosCompensatorios;
        });
        
        totalDevidoDisplay.value = formatToCurrency(totalDevido);
        totalRecebidoDisplay.value = formatToCurrency(totalRecebido);
        totalSingeloDisplay.value = formatToCurrency(totalSingelo);
        totalAtualizadoDisplay.value = formatToCurrency(totalAtualizado);
        totalJurosDisplay.value = formatToCurrency(totalJuros);
        
        const valorAcao = parseFloat(valorAcaoInput.value.replace('R$', '').replace(/\./g, '').replace(',', '.') || 0);
        const valorDevidoCorrigido = totalAtualizado;
        const proveitoEconomico = valorAcao - valorDevidoCorrigido;

        valorAcaoSummary.textContent = formatToCurrency(valorAcao);
        valorDevidoCorrigidoSummary.textContent = formatToCurrency(valorDevidoCorrigido);
        proveitoEconomicoSummary.textContent = formatToCurrency(proveitoEconomico);
    };
    

    function addTableRow(lei, descricao, mesRef, nivelClasse, devido, recebido, singelo, atualizado, juros) {
        const newRow = document.createElement('tr');
        newRow.classList.add('hover:bg-gray-100');
        newRow.innerHTML = `
            <td class="py-3 px-4 text-left whitespace-nowrap">${lei.match(/Lei Nº (\d+\.?\d*)\/\d{4}/)?.[0] || lei}</td>
            <td class="py-3 px-4 text-left">${descricao}</td>
            <td class="py-3 px-4 text-left">${mesRef}</td>
            <td class="py-3 px-4 text-left">${nivelClasse}</td>
            <td class="py-3 px-4 text-right">${formatToCurrency(devido)}</td>
            <td class="py-3 px-4 text-right">${formatToCurrency(recebido)}</td>
            <td class="py-3 px-4 text-right">${formatToCurrency(singelo)}</td>
            <td class="py-3 px-4 text-right">${formatToCurrency(atualizado)}</td>
            <td class="py-3 px-4 text-right">${formatToCurrency(juros)}</td>
            <td class="py-3 px-4 text-center">
                <button type="button" onclick="addTableRowManual(this)" class="text-green-600 hover:text-green-800 mr-2" title="Adicionar linha">
                    <i class="fas fa-plus-circle"></i>
                </button>
                <button type="button" onclick="removeTableRow(this)" class="text-red-600 hover:text-red-800" title="Remover linha">
                    <i class="fas fa-minus-circle"></i>
                </button>
            </td>
        `;
        calculationTableBody.appendChild(newRow);
    }

    window.addTableRowManual = function(button) {
        const tableRow = button.closest('tr');
        const newRow = tableRow.cloneNode(true);
        newRow.querySelectorAll('td').forEach((td, index) => {
            if (index < newRow.querySelectorAll('td').length - 1) {
                td.textContent = '';
            }
        });
        tableRow.parentNode.insertBefore(newRow, tableRow.nextSibling);
    };

    window.removeTableRow = function(button) {
        if (calculationTableBody.rows.length >= 1) {
            button.closest('tr').remove();
        } else {
            alert('A tabela deve ter pelo menos uma linha.');
        }
    };


    window.saveCalculation = function() {
        console.log('Cálculo salvo!');
        alert('Cálculo salvo com sucesso! (simulação)');
    };

    window.generateReport = function() {
        console.log('Relatório gerado!');
        alert('Relatório gerado com sucesso! (simulação)');
    };

    window.clearForm = function() {
        if (confirm('Tem certeza que deseja limpar todos os dados do formulário?')) {
            document.querySelectorAll('input, select').forEach(element => {
                const tag = element.tagName.toLowerCase();
                if (tag === 'input' && (element.type === 'text' || element.type === 'month' || element.type === 'number')) {
                    element.value = '';
                } else if (tag === 'select') {
                    element.selectedIndex = 0;
                }
            });
            valorAcaoSummary.textContent = 'R$ 0,00';
            valorDevidoCorrigidoSummary.textContent = 'R$ 0,00';
            proveitoEconomicoSummary.textContent = 'R$ 0,00';
            calculationTableBody.innerHTML = '';
            
            totalDevidoDisplay.value = 'R$ 0,00';
            totalRecebidoDisplay.value = 'R$ 0,00';
            totalSingeloDisplay.value = 'R$ 0,00';
            totalAtualizadoDisplay.value = 'R$ 0,00';
            totalJurosDisplay.value = 'R$ 0,00';
        }
    };

    
    function formatToCurrency(numberValue) {
        if (isNaN(numberValue)) return 'R$ 0,00';
        const value = Number(numberValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        return value;
    }
    
    window.formatCurrencyInput = function(input) {
        let value = input.value.replace(/\D/g, '');
        if (value) {
            value = (parseInt(value, 10) / 100);
            input.value = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        } else {
            input.value = '';
        }
    };
});