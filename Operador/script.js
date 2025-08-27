// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Variáveis e Seletores de Elementos ---
    const userDropdownBtn = document.getElementById('userDropdownBtn');
    const userDropdown = document.getElementById('userDropdown');
    const calculationTypeSelect = document.getElementById('calculationType');
    const formFields = document.getElementById('formFields');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    // Estado para o tipo de cálculo
    let selectedCalculationType = null;

    // --- Lógica de Interação da Interface (UI) ---

    // Toggle do dropdown do usuário
    function toggleUserDropdown() {
        userDropdown.classList.toggle('show');
    }

    document.addEventListener('click', function (event) {
        if (!userDropdownBtn.contains(event.target) && !userDropdown.contains(event.target)) {
            userDropdown.classList.remove('show');
        }
    });

    userDropdownBtn.addEventListener('click', toggleUserDropdown);

    // Toggle do menu lateral
    sidebarToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Mostrar/esconder campos do formulário baseado no tipo de cálculo
    calculationTypeSelect.addEventListener('change', (event) => {
        selectedCalculationType = event.target.value;
        const isTrabalhista = selectedCalculationType === 'trabalhista' || selectedCalculationType === 'trabalhista-full';

        formFields.classList.toggle('hidden', !isTrabalhista);

        document.querySelectorAll('.th-13o, .td-13o').forEach(el => {
            el.style.display = isTrabalhista ? 'table-cell' : 'none';
        });

        // Limpa a tabela ao mudar o tipo de cálculo
        document.getElementById('calculationTableBody').innerHTML = '';
    });

    // --- Funções de Manipulação da Tabela ---

    /**
     * Adiciona uma nova linha à tabela com base em um modelo.
     * @param {HTMLElement} tableBody - O corpo da tabela (tbody).
     * @param {object} data - Objeto contendo os valores para a nova linha.
     */
    function addTableRowWithValues(tableBody, { description, monthYear, nivelClasse, baseLegal }) {
        // Extrai apenas o número e o ano da lei
        const baseLegalMatch = baseLegal.match(/Lei Nº (\d+\.?\d*), de \d+ de \w+ de (\d{4})/);
        const simplifiedBaseLegal = baseLegalMatch ? `${baseLegalMatch[1]}/${baseLegalMatch[2]}` : baseLegal;

        const newRow = document.createElement('tr');
        newRow.className = "hover:bg-gray-100 transition-colors";
        newRow.innerHTML = `
            <td class="py-3 px-6 text-left whitespace-nowrap">
                <input type="text" value="${simplifiedBaseLegal}"
                    class="lei-aplicada w-full px-2 py-1 bg-transparent border-none focus:outline-none"
                    readonly>
            </td>
            <td class="py-3 px-6 text-left">
                <input type="text" value="${description}"
                    class="descricao w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal"
                    placeholder="Salário">
            </td>
            <td class="py-3 px-6 text-left">
                <input type="text" value="${monthYear}"
                    class="mes-ref w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal bg-gray-50" readonly>
            </td>
            <td class="py-3 px-6 text-left">
                <input type="text" value="${nivelClasse}"
                    class="nivel-classe w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal bg-gray-50"
                    placeholder="—" readonly>
            </td>
            <td class="py-3 px-6 text-right">
                <input type="text" class="devido w-full px-2 py-1 border rounded text-right focus:ring-1 focus:ring-primary-teal" placeholder="R$ 0,00" oninput="formatCurrency(this)">
            </td>
            <td class="py-3 px-6 text-right">
                <input type="text" class="recebido w-full px-2 py-1 border rounded text-right focus:ring-1 focus:ring-primary-teal" placeholder="R$ 0,00" oninput="formatCurrency(this)">
            </td>
            <td class="py-3 px-6 text-right">
                <input type="text" class="valor-singelo w-full px-2 py-1 border rounded text-right focus:ring-1 focus:ring-primary-teal" placeholder="R$ 0,00" oninput="formatCurrency(this)">
            </td>
            <td class="py-3 px-6 text-right">
                <input type="text" class="valor-atualizado w-full px-2 py-1 border rounded text-right focus:ring-1 focus:ring-primary-teal" placeholder="R$ 0,00" oninput="formatCurrency(this)">
            </td>
            <td class="py-3 px-6 text-right">
                <input type="text" class="juros-comp w-full px-2 py-1 border rounded text-right focus:ring-1 focus:ring-primary-teal" placeholder="R$ 0,00" oninput="formatCurrency(this)">
            </td>
            <td class="py-3 px-6 text-center">
                <button type="button" onclick="addTableRowManual(this)"
                    class="text-green-600 hover:text-green-800 mr-2" title="Adicionar linha">
                    <i class="fas fa-plus-circle"></i>
                </button>
                <button type="button" onclick="removeTableRow(this)"
                    class="text-red-600 hover:text-red-800" title="Remover linha">
                    <i class="fas fa-minus-circle"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(newRow);
    }

    // Adiciona uma linha manualmente, clonando a linha atual
    window.addTableRowManual = function (button) {
        const tableBody = document.getElementById('calculationTableBody');
        const currentRow = button.closest('tr');
        const newRow = currentRow.cloneNode(true);

        // Limpa os valores dos campos da nova linha, exceto os de só leitura
        newRow.querySelectorAll('input').forEach(input => {
            if (!input.readOnly) {
                input.value = '';
            }
        });

        // Insere a nova linha após a linha atual
        currentRow.parentNode.insertBefore(newRow, currentRow.nextSibling);
    };

    // Remove uma linha, garantindo que sempre haja pelo menos uma
    window.removeTableRow = function (button) {
        const tbody = document.getElementById('calculationTableBody');
        if (tbody.rows.length > 1) {
            button.closest('tr').remove();
        } else {
            alert('A tabela deve ter pelo menos uma linha.');
        }
    };

    // Função para formatar o mês e o ano para "Jan/2025"
    function formatMonthYear(date) {
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${month}/${year}`;
    }

    // Função principal chamada pelo botão "Gerar Tabela"
    window.addPeriod = function () {
        const startDateInput = document.querySelector('input[type="month"][data-start]');
        const endDateInput = document.querySelector('input[type="month"][data-end]');
        const nivelClasseSelect = document.getElementById('nivelClasseSelec');
        const baseLegalSelect = document.getElementById('baseLegalSelect');

        const startDateValue = startDateInput.value;
        const endDateValue = endDateInput.value;
        const nivelClasseValue = nivelClasseSelect.value;
        const baseLegalText = baseLegalSelect.options[baseLegalSelect.selectedIndex].text;

        if (!startDateValue || !endDateValue) {
            alert("Por favor, selecione as datas de início e fim.");
            return;
        }

        const tableBody = document.getElementById('calculationTableBody');
        tableBody.innerHTML = '';

        // Cria as datas de início e fim com ajuste para fuso horário
        let currentDate = new Date(startDateValue + 'T00:00:00');
        const end = new Date(endDateValue + 'T00:00:00');

        while (currentDate <= end) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const formattedMonthYear = formatMonthYear(currentDate);

            // Adiciona as linhas de acordo com o mês
            if (month === 11) { // Mês de dezembro (índice 11)
                // Primeiro o Salário e depois o 13º
                addTableRowWithValues(tableBody, {
                    description: 'Salário',
                    monthYear: formattedMonthYear,
                    nivelClasse: nivelClasseValue,
                    baseLegal: baseLegalText,
                });
                addTableRowWithValues(tableBody, {
                    description: '13º Salário',
                    monthYear: formattedMonthYear,
                    nivelClasse: nivelClasseValue,
                    baseLegal: baseLegalText,
                });
            } else if (month === 0) { // Mês de janeiro (índice 0)
                // Primeiro as Férias e depois o Salário
                addTableRowWithValues(tableBody, {
                    description: 'Férias',
                    monthYear: formattedMonthYear,
                    nivelClasse: nivelClasseValue,
                    baseLegal: baseLegalText,
                });
                addTableRowWithValues(tableBody, {
                    description: 'Salário',
                    monthYear: formattedMonthYear,
                    nivelClasse: nivelClasseValue,
                    baseLegal: baseLegalText,
                });
            } else {
                // Para os outros meses, apenas o Salário
                addTableRowWithValues(tableBody, {
                    description: 'Salário',
                    monthYear: formattedMonthYear,
                    nivelClasse: nivelClasseValue,
                    baseLegal: baseLegalText,
                });
            }

            currentDate.setMonth(currentDate.getMonth() + 1);
        }
    };
    // --- Funções de Botões de Ação ---

    window.saveCalculation = function () {
        if (!selectedCalculationType) {
            alert('Por favor, selecione um tipo de cálculo antes de salvar.');
            return;
        }
        alert('Cálculo salvo com sucesso!');
    };

    window.generateReport = function () {
        if (!selectedCalculationType) {
            alert('Por favor, selecione um tipo de cálculo antes de gerar o relatório.');
            return;
        }
        alert('Relatório gerado com sucesso!');
    };

    window.clearForm = function () {
        if (confirm('Tem certeza que deseja limpar todos os dados do formulário?')) {
            selectedCalculationType = null;
            calculationTypeSelect.value = "";
            formFields.classList.add('hidden');
            document.querySelectorAll('input:not([readonly])').forEach(input => {
                input.value = '';
            });
            document.querySelectorAll('select').forEach(select => {
                select.selectedIndex = 0;
            });
            const tbody = document.getElementById('calculationTableBody');
            tbody.innerHTML = '';
        }
    };

    // Função para formatar valores monetários
    window.formatCurrency = function (input) {
        let value = input.value.replace(/\D/g, ''); // Remove tudo que não é número
        value = (value / 100).toFixed(2); // Transforma em valor decimal com 2 casas
        value = value.replace('.', ','); // Troca ponto por vírgula para o formato brasileiro
        value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'); // Adiciona pontos para milhar
        input.value = 'R$ ' + value;
    };

    document.getElementById('fileInput').addEventListener('change', function (e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            alert(`${files.length} arquivo(s) selecionado(s): ${files.map(f => f.name).join(', ')}`);
        }
    });

    // Garante que o estado inicial seja correto
    document.querySelectorAll('.th-13o, .td-13o').forEach(el => el.style.display = 'none');
});