// script.js

document.addEventListener('DOMContentLoaded', () => {
    const userDropdownBtn = document.getElementById('userDropdownBtn');
    const userDropdown = document.getElementById('userDropdown');
    const calculationTypeSelect = document.getElementById('calculationType');
    const formFields = document.getElementById('formFields');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    let selectedCalculationType = null;

    // Função para alternar o dropdown do usuário
    function toggleUserDropdown() {
        userDropdown.classList.toggle('show');
    }

    // Fecha o dropdown quando clicar fora
    document.addEventListener('click', function(event) {
        if (!userDropdownBtn.contains(event.target) && !userDropdown.contains(event.target)) {
            userDropdown.classList.remove('show');
        }
    });

    userDropdownBtn.addEventListener('click', toggleUserDropdown);

    // Função para alternar o menu lateral
    sidebarToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Lógica para mostrar/esconder o formulário baseado na seleção
    calculationTypeSelect.addEventListener('change', (event) => {
        selectedCalculationType = event.target.value;

        if (selectedCalculationType === "trabalhista") {
            formFields.classList.remove('hidden');
        } else {
            formFields.classList.add('hidden');
        }

        // Ajusta a exibição da coluna "1/3 do 13º"
        const isTrabalhista = selectedCalculationType === 'trabalhista' || selectedCalculationType === 'trabalhista-full';
        document.querySelectorAll('.th-13o, .td-13o').forEach(el => {
            el.style.display = isTrabalhista ? 'table-cell' : 'none';
        });
    });

    // Funções de manipulação da tabela e cálculo (mantidas do original)
    window.addTableRow = function() {
        const tbody = document.getElementById('calculationTableBody');
        const newRow = tbody.rows[0].cloneNode(true);
        newRow.querySelectorAll('input').forEach(input => {
            if (!input.readOnly) {
                input.value = '';
            }
        });
        
        tbody.appendChild(newRow);
    };

    window.removeTableRow = function(button) {
        const tbody = document.getElementById('calculationTableBody');
        if (tbody.rows.length > 1) {
            button.closest('tr').remove();
            calculateTotal();
        }
    };

    window.calculateRowTotal = function(input) {
        const row = input.closest('tr');
        const salarioCorrigido = parseFloat(row.cells[1].querySelector('input').value.replace(',', '.')) || 0;
        const valorRecebido = parseFloat(row.cells[2].querySelector('input').value.replace(',', '.')) || 0;
        const tercoDezTerceiro = parseFloat(row.cells[4].querySelector('input').value.replace(',', '.')) || 0;
        
        const diferenca = salarioCorrigido - valorRecebido;
        const totalMes = diferenca + (selectedCalculationType === 'trabalhista' || selectedCalculationType === 'trabalhista-full' ? tercoDezTerceiro : 0);
        
        row.cells[3].querySelector('input').value = diferenca.toFixed(2).replace('.', ',');
        row.cells[5].querySelector('input').value = totalMes.toFixed(2).replace('.', ',');
        
        calculateTotal();
    };

    window.calculateTotal = function() {
        const tbody = document.getElementById('calculationTableBody');
        let total = 0;
        
        Array.from(tbody.rows).forEach(row => {
            const totalMes = parseFloat(row.cells[5].querySelector('input').value.replace(',', '.')) || 0;
            total += totalMes;
        });
        
        document.getElementById('totalValue').textContent = 
            'R$ ' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

window.addPeriod = function addPeriod() {
    // Obter as datas de início e fim dos inputs
    const startDateInput = document.querySelector('input[type="month"][data-start]');
    const endDateInput = document.querySelector('input[type="month"][data-end]');

    const startDateValue = startDateInput.value;
    const endDateValue = endDateInput.value;

    if (!startDateValue || !endDateValue) {
        alert("Por favor, selecione as datas de início e fim.");
        return;
    }

    const tableBody = document.getElementById('calculationTableBody');
    tableBody.innerHTML = ''; // Limpa a tabela antes de adicionar as novas linhas

    // --- MUDANÇA AQUI ---
    // Cria um objeto de data a partir dos valores de ano e mês
    const startParts = startDateValue.split('-');
    let currentDate = new Date(startParts[0], startParts[1] - 1, 1);
    // --- FIM DA MUDANÇA ---
    
    // Cria a data de fim para a comparação
    const endParts = endDateValue.split('-');
    const end = new Date(endParts[0], endParts[1] - 1, 1);

    // Loop que itera mês a mês, garantindo que o último mês seja incluído
    while (currentDate.getFullYear() < end.getFullYear() ||
           (currentDate.getFullYear() === end.getFullYear() && currentDate.getMonth() <= end.getMonth())) {
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Adiciona a linha do mês/ano
        const monthYearString = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);
        addTableRow(monthYearString, tableBody);

        // Verifica se o mês é dezembro (mês 11 em JavaScript)
        if (month === 11) {
            addTableRow(`Reflexos do 13º - ${year}`, tableBody);
            addTableRow(`Reflexos de Férias`, tableBody);
        }

        // Move para o próximo mês
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
};

function addTableRow(monthText, tableBody) {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td class="px-4 py-3">
            <input type="text" value="${monthText}"
                class="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal" readonly>
        </td>
        <td class="px-4 py-3">
            <input type="text"
                class="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal"
                placeholder="1-A" readonly>
        </td>
        <td class="px-4 py-3">
            <input type="number" step="0.01"
                class="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal"
                placeholder="0,00" onchange="calculateRowTotal(this)">
        </td>
        <td class="px-4 py-3">
            <input type="number" step="0.01"
                class="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal bg-gray-50"
                placeholder="0,00" readonly>
        </td>
        <td class="px-4 py-3 td-13o">
            <input type="number" step="0.01"
                class="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal"
                placeholder="0,00" onchange="calculateRowTotal(this)">
        </td>
        <td class="px-4 py-3">
            <input type="number" step="0.01"
                class="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal bg-gray-50 font-bold"
                placeholder="0.000/0000" readonly>
        </td>
        <td class="px-4 py-3">
            <input type="text"
                class="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal bg-gray-50 font-bold"
                placeholder="" readonly>
        </td>
        <td class="px-4 py-3 text-center">
            <button onclick="addTableRowManual(this)"
                class="text-green-600 hover:text-green-800 mr-2">
                <i class="fas fa-plus"></i>
            </button>
            <button onclick="removeTableRow(this)"
                class="text-red-600 hover:text-red-800">
                <i class="fas fa-minus"></i>
            </button>
        </td>
    `;
    tableBody.appendChild(newRow);
}

// Função para adicionar manualmente uma nova linha à tabela
// Esta função é chamada pelo botão com o ícone de '+'
window.addTableRowManual = function addTableRowManual(button) {
    const tableBody = document.getElementById('calculationTableBody');
    const newRow = document.createElement('tr');

    // O innerHTML é o mesmo que já tínhamos para gerar uma linha
    newRow.innerHTML = `
        <td class="px-4 py-3">
            <input type="text"
                class="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal">
        </td>
        <td class="px-4 py-3">
            <input type="text"
                class="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal"
                placeholder="1-A" readonly>
        </td>
        <td class="px-4 py-3">
            <input type="number" step="0.01"
                class="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal"
                placeholder="0,00" onchange="calculateRowTotal(this)">
        </td>
        <td class="px-4 py-3">
            <input type="number" step="0.01"
                class="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal bg-gray-50"
                placeholder="0,00" readonly>
        </td>
        <td class="px-4 py-3 td-13o">
            <input type="number" step="0.01"
                class="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal"
                placeholder="0,00" onchange="calculateRowTotal(this)">
        </td>
        <td class="px-4 py-3">
            <input type="number" step="0.01"
                class="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal bg-gray-50 font-bold"
                placeholder="0.000/0000" readonly>
        </td>
        <td class="px-4 py-3">
            <input type="text"
                class="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-teal bg-gray-50 font-bold"
                placeholder="" readonly>
        </td>
        <td class="px-4 py-3 text-center">
                <button onclick="addTableRowManual(this)"
                    class="text-green-600 hover:text-green-800 mr-2">
                    <i class="fas fa-plus"></i>
                </button>
                <button onclick="removeTableRow(this)"
                    class="text-red-600 hover:text-red-800">
                    <i class="fas fa-minus"></i>
                </button>
        </td>
    `;

    // Encontra a linha atual e insere a nova linha logo abaixo dela
    const currentRow = button.closest('tr');
    currentRow.parentNode.insertBefore(newRow, currentRow.nextSibling);

    // Re-calcula o total após adicionar a nova linha
    calculateTotalDifference();
};


    window.saveCalculation = function() {
        if (!selectedCalculationType) {
            alert('Por favor, selecione um tipo de cálculo antes de salvar.');
            return;
        }
        alert('Cálculo salvo com sucesso! Os dados foram armazenados no sistema.');
    };

    window.generateReport = function() {
        if (!selectedCalculationType) {
            alert('Por favor, selecione um tipo de cálculo antes de gerar o relatório.');
            return;
        }
        alert('Relatório gerado com sucesso! O documento PDF está sendo preparado para download.');
    };

    window.clearForm = function() {
        if (confirm('Tem certeza que deseja limpar todos os dados do formulário?')) {
            selectedCalculationType = null;
            calculationTypeSelect.value = "";
            formFields.classList.add('hidden');
            
            document.querySelectorAll('input').forEach(input => {
                input.value = '';
            });
            
            document.querySelectorAll('select').forEach(select => {
                select.selectedIndex = 0;
            });
            
            document.getElementById('totalValue').textContent = 'R$ 0,00';
            
            const tbody = document.getElementById('calculationTableBody');
            while (tbody.rows.length > 1) {
                tbody.deleteRow(1);
            }
        }
    };

    // File upload handling
    document.getElementById('fileInput').addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            alert(`${files.length} arquivo(s) selecionado(s): ${files.map(f => f.name).join(', ')}`);
        }
    });

    // Garante que o estado inicial seja correto
    document.querySelectorAll('.th-13o, .td-13o').forEach(el => el.style.display = 'none');
});