// ================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ================================

let currentElection = 'presidencial';
let electionData = {};

// ================================
// INICIALIZACIÓN
// ================================

document.addEventListener('DOMContentLoaded', () => {
    initializeDarkMode();
    initializeElectionSelector();
    loadElectionData();
});

// ================================
// MODO OSCURO
// ================================

function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const savedTheme = localStorage.getItem('theme');
    
    // Aplicar tema guardado
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // Toggle al hacer clic
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// ================================
// SELECTOR DE ELECCIÓN
// ================================

function initializeElectionSelector() {
    const electionButtons = document.querySelectorAll('.election-btn');
    
    electionButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase active de todos los botones
            electionButtons.forEach(btn => btn.classList.remove('active'));
            
            // Agregar clase active al botón clickeado
            button.classList.add('active');
            
            // Actualizar elección actual
            currentElection = button.dataset.election;
            
            // Actualizar visualización
            updateDisplay();
        });
    });
}

// ================================
// CARGA DE DATOS
// ================================

async function loadElectionData() {
    try {
        const response = await fetch('resultados.json');
        electionData = await response.json();
        updateDisplay();
    } catch (error) {
        console.error('Error cargando datos:', error);
        showErrorMessage('Error al cargar los datos electorales');
    }
}

function showErrorMessage(message) {
    const container = document.querySelector('.main-content .container');
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background-color: #f8d7da;
        color: #721c24;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
        border: 1px solid #f5c6cb;
        text-align: center;
        font-weight: 600;
    `;
    errorDiv.textContent = message;
    container.insertBefore(errorDiv, container.firstChild);
}

// ================================
// ACTUALIZACIÓN DE DISPLAY
// ================================

function updateDisplay() {
    const data = electionData[currentElection];
    
    if (!data) {
        console.error('No hay datos para la elección:', currentElection);
        return;
    }
    
    updateStatistics(data);
    updateTable(data);
    drawBarChart(data);
    drawPieChart(data);
}

// ================================
// ESTADÍSTICAS GENERALES
// ================================

function updateStatistics(data) {
    // Calcular total de votos
    const totalVotos = data.resultados.reduce((sum, partido) => sum + partido.votos, 0);
    
    // Encontrar ganador
    const ganador = data.resultados.reduce((max, partido) => 
        partido.votos > max.votos ? partido : max
    );
    
    // Actualizar DOM
    document.getElementById('totalVotos').textContent = totalVotos.toLocaleString('es-HN');
    document.getElementById('participacion').textContent = data.participacion;
    document.getElementById('ganadorActual').textContent = ganador.partido;
}

// ================================
// TABLA DE RESULTADOS
// ================================

function updateTable(data) {
    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';
    
    // Ordenar por votos (descendente)
    const sortedResults = [...data.resultados].sort((a, b) => b.votos - a.votos);
    
    sortedResults.forEach((partido, index) => {
        const row = document.createElement('tr');
        const isWinner = index === 0;
        
        if (isWinner) {
            row.classList.add('winner-row', 'fade-in');
        } else {
            row.classList.add('fade-in');
        }
        
        row.innerHTML = `
            <td><strong>${index + 1}</strong></td>
            <td><strong>${partido.partido}</strong></td>
            <td>${partido.candidato}</td>
            <td>${partido.votos.toLocaleString('es-HN')}</td>
            <td><strong>${partido.porcentaje}%</strong></td>
            <td>
                ${isWinner ? `
                    <span class="winner-badge">
                        <span class="trophy-icon">🏆</span>
                        Ganador
                    </span>
                ` : ''}
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// ================================
// GRÁFICA DE BARRAS
// ================================

function drawBarChart(data) {
    const canvas = document.getElementById('barChart');
    const ctx = canvas.getContext('2d');
    
    // Configurar tamaño del canvas
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Datos
    const sortedResults = [...data.resultados].sort((a, b) => b.votos - a.votos);
    const maxVotes = Math.max(...sortedResults.map(p => p.votos));
    
    // Configuración
    const padding = 60;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const barWidth = chartWidth / sortedResults.length - 20;
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // Colores para cada partido
    const colors = [
        '#2563eb', // Azul
        '#dc2626', // Rojo
        '#059669', // Verde
        '#d97706', // Naranja
        '#7c3aed', // Púrpura
        '#0891b2', // Cyan
    ];
    
    // Dibujar barras
    sortedResults.forEach((partido, index) => {
        const barHeight = (partido.votos / maxVotes) * chartHeight;
        const x = padding + index * (barWidth + 20) + 10;
        const y = canvas.height - padding - barHeight;
        
        // Barra
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Porcentaje encima de la barra
        ctx.fillStyle = isDarkMode ? '#e8eaed' : '#1a1a1a';
        ctx.font = 'bold 14px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(`${partido.porcentaje}%`, x + barWidth / 2, y - 10);
        
        // Votos
        ctx.font = '12px Segoe UI';
        ctx.fillText(partido.votos.toLocaleString('es-HN'), x + barWidth / 2, y - 25);
        
        // Nombre del partido (rotado si es necesario)
        ctx.save();
        ctx.translate(x + barWidth / 2, canvas.height - padding + 20);
        ctx.rotate(-Math.PI / 6);
        ctx.textAlign = 'right';
        ctx.font = '12px Segoe UI';
        ctx.fillStyle = isDarkMode ? '#9ba1a6' : '#6c757d';
        ctx.fillText(partido.partido, 0, 0);
        ctx.restore();
        
        // Indicador de ganador
        if (index === 0) {
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 20px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText('🏆', x + barWidth / 2, y - 40);
        }
    });
    
    // Línea base
    ctx.strokeStyle = isDarkMode ? '#2a3441' : '#dee2e6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
}

// ================================
// GRÁFICA CIRCULAR (PIE CHART)
// ================================

function drawPieChart(data) {
    const canvas = document.getElementById('pieChart');
    const ctx = canvas.getContext('2d');
    
    // Configurar tamaño del canvas
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Datos
    const results = data.resultados;
    const totalVotes = results.reduce((sum, p) => sum + p.votos, 0);
    
    // Configuración
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 40;
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // Colores
    const colors = [
        '#2563eb', // Azul
        '#dc2626', // Rojo
        '#059669', // Verde
        '#d97706', // Naranja
        '#7c3aed', // Púrpura
        '#0891b2', // Cyan
    ];
    
    // Dibujar sectores
    let currentAngle = -Math.PI / 2; // Empezar desde arriba
    
    results.forEach((partido, index) => {
        const sliceAngle = (partido.votos / totalVotes) * 2 * Math.PI;
        
        // Dibujar sector
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        
        // Borde
        ctx.strokeStyle = isDarkMode ? '#1e2530' : '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Etiqueta
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Segoe UI';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${partido.porcentaje}%`, labelX, labelY);
        
        currentAngle += sliceAngle;
    });
    
    // Círculo central (estilo dona)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = isDarkMode ? '#1e2530' : '#ffffff';
    ctx.fill();
    
    // Texto central
    ctx.fillStyle = isDarkMode ? '#e8eaed' : '#1a1a1a';
    ctx.font = 'bold 16px Segoe UI';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Total', centerX, centerY - 15);
    ctx.font = 'bold 20px Segoe UI';
    ctx.fillText(totalVotes.toLocaleString('es-HN'), centerX, centerY + 10);
    
    // Actualizar leyenda
    updatePieLegend(results, colors);
}

function updatePieLegend(results, colors) {
    const legend = document.getElementById('pieLegend');
    legend.innerHTML = '';
    
    results.forEach((partido, index) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-color" style="background-color: ${colors[index % colors.length]}"></div>
            <span class="legend-text">${partido.partido}</span>
            <span class="legend-percentage">${partido.porcentaje}%</span>
        `;
        legend.appendChild(item);
    });
}

// ================================
// REDIMENSIONAMIENTO
// ================================

window.addEventListener('resize', () => {
    if (electionData[currentElection]) {
        drawBarChart(electionData[currentElection]);
        drawPieChart(electionData[currentElection]);
    }
});
