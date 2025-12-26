Continuaré con los demás archivos en el siguiente mensaje...

---

## 📄 Archivo 3: `script.js`
Action: file_editor view /app/electoral_dashboard/script.js
Observation: /app/electoral_dashboard/script.js:
1|// ================================
2|// ESTADO GLOBAL DE LA APLICACIÓN
3|// ================================
4|
5|let currentElection = 'presidencial';
6|let electionData = {};
7|
8|// ================================
9|// INICIALIZACIÓN
10|// ================================
11|
12|document.addEventListener('DOMContentLoaded', () => {
13|    initializeDarkMode();
14|    initializeElectionSelector();
15|    loadElectionData();
16|});
17|
18|// ================================
19|// MODO OSCURO
20|// ================================
21|
22|function initializeDarkMode() {
23|    const darkModeToggle = document.getElementById('darkModeToggle');
24|    const savedTheme = localStorage.getItem('theme');
25|    
26|    // Aplicar tema guardado
27|    if (savedTheme === 'dark') {
28|        document.body.classList.add('dark-mode');
29|    }
30|    
31|    // Toggle al hacer clic
32|    darkModeToggle.addEventListener('click', () => {
33|        document.body.classList.toggle('dark-mode');
34|        const isDark = document.body.classList.contains('dark-mode');
35|        localStorage.setItem('theme', isDark ? 'dark' : 'light');
36|    });
37|}
38|
39|// ================================
40|// SELECTOR DE ELECCIÓN
41|// ================================
42|
43|function initializeElectionSelector() {
44|    const electionButtons = document.querySelectorAll('.election-btn');
45|    
46|    electionButtons.forEach(button => {
47|        button.addEventListener('click', () => {
48|            // Remover clase active de todos los botones
49|            electionButtons.forEach(btn => btn.classList.remove('active'));
50|            
51|            // Agregar clase active al botón clickeado
52|            button.classList.add('active');
53|            
54|            // Actualizar elección actual
55|            currentElection = button.dataset.election;
56|            
57|            // Actualizar visualización
58|            updateDisplay();
59|        });
60|    });
61|}
62|
63|// ================================
64|// CARGA DE DATOS
65|// ================================
66|
67|async function loadElectionData() {
68|    try {
69|        const response = await fetch('resultados.json');
70|        electionData = await response.json();
71|        updateDisplay();
72|    } catch (error) {
73|        console.error('Error cargando datos:', error);
74|        showErrorMessage('Error al cargar los datos electorales');
75|    }
76|}
77|
78|function showErrorMessage(message) {
79|    const container = document.querySelector('.main-content .container');
80|    const errorDiv = document.createElement('div');
81|    errorDiv.style.cssText = `
82|        background-color: #f8d7da;
83|        color: #721c24;
84|        padding: 20px;
85|        border-radius: 10px;
86|        margin: 20px 0;
87|        border: 1px solid #f5c6cb;
88|        text-align: center;
89|        font-weight: 600;
90|    `;
91|    errorDiv.textContent = message;
92|    container.insertBefore(errorDiv, container.firstChild);
93|}
94|
95|// ================================
96|// ACTUALIZACIÓN DE DISPLAY
97|// ================================
98|
99|function updateDisplay() {
100|    const data = electionData[currentElection];
101|    
102|    if (!data) {
103|        console.error('No hay datos para la elección:', currentElection);
104|        return;
105|    }
106|    
107|    updateStatistics(data);
108|    updateTable(data);
109|    drawBarChart(data);
110|    drawPieChart(data);
111|}
112|
113|// ================================
114|// ESTADÍSTICAS GENERALES
115|// ================================
116|
117|function updateStatistics(data) {
118|    // Calcular total de votos
119|    const totalVotos = data.resultados.reduce((sum, partido) => sum + partido.votos, 0);
120|    
121|    // Encontrar ganador
122|    const ganador = data.resultados.reduce((max, partido) => 
123|        partido.votos > max.votos ? partido : max
124|    );
125|    
126|    // Actualizar DOM
127|    document.getElementById('totalVotos').textContent = totalVotos.toLocaleString('es-HN');
128|    document.getElementById('participacion').textContent = data.participacion;
129|    document.getElementById('ganadorActual').textContent = ganador.partido;
130|}
131|
132|// ================================
133|// TABLA DE RESULTADOS
134|// ================================
135|
136|function updateTable(data) {
137|    const tbody = document.getElementById('resultsTableBody');
138|    tbody.innerHTML = '';
139|    
140|    // Ordenar por votos (descendente)
141|    const sortedResults = [...data.resultados].sort((a, b) => b.votos - a.votos);
142|    
143|    sortedResults.forEach((partido, index) => {
144|        const row = document.createElement('tr');
145|        const isWinner = index === 0;
146|        
147|        if (isWinner) {
148|            row.classList.add('winner-row', 'fade-in');
149|        } else {
150|            row.classList.add('fade-in');
151|        }
152|        
153|        row.innerHTML = `
154|            <td><strong>${index + 1}</strong></td>
155|            <td><strong>${partido.partido}</strong></td>
156|            <td>${partido.candidato}</td>
157|            <td>${partido.votos.toLocaleString('es-HN')}</td>
158|            <td><strong>${partido.porcentaje}%</strong></td>
159|            <td>
160|                ${isWinner ? `
161|                    <span class="winner-badge">
162|                        <span class="trophy-icon">🏆</span>
163|                        Ganador
164|                    </span>
165|                ` : ''}
166|            </td>
167|        `;
168|        
169|        tbody.appendChild(row);
170|    });
171|}
172|
173|// ================================
174|// GRÁFICA DE BARRAS
175|// ================================
176|
177|function drawBarChart(data) {
178|    const canvas = document.getElementById('barChart');
179|    const ctx = canvas.getContext('2d');
180|    
181|    // Configurar tamaño del canvas
182|    const container = canvas.parentElement;
183|    canvas.width = container.clientWidth;
184|    canvas.height = container.clientHeight;
185|    
186|    // Limpiar canvas
187|    ctx.clearRect(0, 0, canvas.width, canvas.height);
188|    
189|    // Datos
190|    const sortedResults = [...data.resultados].sort((a, b) => b.votos - a.votos);
191|    const maxVotes = Math.max(...sortedResults.map(p => p.votos));
192|    
193|    // Configuración
194|    const padding = 60;
195|    const chartWidth = canvas.width - padding * 2;
196|    const chartHeight = canvas.height - padding * 2;
197|    const barWidth = chartWidth / sortedResults.length - 20;
198|    const isDarkMode = document.body.classList.contains('dark-mode');
199|    
200|    // Colores para cada partido
201|    const colors = [
202|        '#2563eb', // Azul
203|        '#dc2626', // Rojo
204|        '#059669', // Verde
205|        '#d97706', // Naranja
206|        '#7c3aed', // Púrpura
207|        '#0891b2', // Cyan
208|    ];
209|    
210|    // Dibujar barras
211|    sortedResults.forEach((partido, index) => {
212|        const barHeight = (partido.votos / maxVotes) * chartHeight;
213|        const x = padding + index * (barWidth + 20) + 10;
214|        const y = canvas.height - padding - barHeight;
215|        
216|        // Barra
217|        ctx.fillStyle = colors[index % colors.length];
218|        ctx.fillRect(x, y, barWidth, barHeight);
219|        
220|        // Porcentaje encima de la barra
221|        ctx.fillStyle = isDarkMode ? '#e8eaed' : '#1a1a1a';
222|        ctx.font = 'bold 14px Segoe UI';
223|        ctx.textAlign = 'center';
224|        ctx.fillText(`${partido.porcentaje}%`, x + barWidth / 2, y - 10);
225|        
226|        // Votos
227|        ctx.font = '12px Segoe UI';
228|        ctx.fillText(partido.votos.toLocaleString('es-HN'), x + barWidth / 2, y - 25);
229|        
230|        // Nombre del partido (rotado si es necesario)
231|        ctx.save();
232|        ctx.translate(x + barWidth / 2, canvas.height - padding + 20);
233|        ctx.rotate(-Math.PI / 6);
234|        ctx.textAlign = 'right';
235|        ctx.font = '12px Segoe UI';
236|        ctx.fillStyle = isDarkMode ? '#9ba1a6' : '#6c757d';
237|        ctx.fillText(partido.partido, 0, 0);
238|        ctx.restore();
239|        
240|        // Indicador de ganador
241|        if (index === 0) {
242|            ctx.fillStyle = '#fbbf24';
243|            ctx.font = 'bold 20px Segoe UI';
244|            ctx.textAlign = 'center';
245|            ctx.fillText('🏆', x + barWidth / 2, y - 40);
246|        }
247|    });
248|    
249|    // Línea base
250|    ctx.strokeStyle = isDarkMode ? '#2a3441' : '#dee2e6';
251|    ctx.lineWidth = 2;
252|    ctx.beginPath();
253|    ctx.moveTo(padding, canvas.height - padding);
254|    ctx.lineTo(canvas.width - padding, canvas.height - padding);
255|    ctx.stroke();
256|}
257|
258|// ================================
259|// GRÁFICA CIRCULAR (PIE CHART)
260|// ================================
261|
262|function drawPieChart(data) {
263|    const canvas = document.getElementById('pieChart');
264|    const ctx = canvas.getContext('2d');
265|    
266|    // Configurar tamaño del canvas
267|    const container = canvas.parentElement;
268|    canvas.width = container.clientWidth;
269|    canvas.height = container.clientHeight;
270|    
271|    // Limpiar canvas
272|    ctx.clearRect(0, 0, canvas.width, canvas.height);
273|    
274|    // Datos
275|    const results = data.resultados;
276|    const totalVotes = results.reduce((sum, p) => sum + p.votos, 0);
277|    
278|    // Configuración
279|    const centerX = canvas.width / 2;
280|    const centerY = canvas.height / 2;
281|    const radius = Math.min(canvas.width, canvas.height) / 2 - 40;
282|    const isDarkMode = document.body.classList.contains('dark-mode');
283|    
284|    // Colores
285|    const colors = [
286|        '#2563eb', // Azul
287|        '#dc2626', // Rojo
288|        '#059669', // Verde
289|        '#d97706', // Naranja
290|        '#7c3aed', // Púrpura
291|        '#0891b2', // Cyan
292|    ];
293|    
294|    // Dibujar sectores
295|    let currentAngle = -Math.PI / 2; // Empezar desde arriba
296|    
297|    results.forEach((partido, index) => {
298|        const sliceAngle = (partido.votos / totalVotes) * 2 * Math.PI;
299|        
300|        // Dibujar sector
301|        ctx.beginPath();
302|        ctx.moveTo(centerX, centerY);
303|        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
304|        ctx.closePath();
305|        ctx.fillStyle = colors[index % colors.length];
306|        ctx.fill();
307|        
308|        // Borde
309|        ctx.strokeStyle = isDarkMode ? '#1e2530' : '#ffffff';
310|        ctx.lineWidth = 3;
311|        ctx.stroke();
312|        
313|        // Etiqueta
314|        const labelAngle = currentAngle + sliceAngle / 2;
315|        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
316|        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
317|        
318|        ctx.fillStyle = '#ffffff';
319|        ctx.font = 'bold 14px Segoe UI';
320|        ctx.textAlign = 'center';
321|        ctx.textBaseline = 'middle';
322|        ctx.fillText(`${partido.porcentaje}%`, labelX, labelY);
323|        
324|        currentAngle += sliceAngle;
325|    });
326|    
327|    // Círculo central (estilo dona)
328|    ctx.beginPath();
329|    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
330|    ctx.fillStyle = isDarkMode ? '#1e2530' : '#ffffff';
331|    ctx.fill();
332|    
333|    // Texto central
334|    ctx.fillStyle = isDarkMode ? '#e8eaed' : '#1a1a1a';
335|    ctx.font = 'bold 16px Segoe UI';
336|    ctx.textAlign = 'center';
337|    ctx.textBaseline = 'middle';
338|    ctx.fillText('Total', centerX, centerY - 15);
339|    ctx.font = 'bold 20px Segoe UI';
340|    ctx.fillText(totalVotes.toLocaleString('es-HN'), centerX, centerY + 10);
341|    
342|    // Actualizar leyenda
343|    updatePieLegend(results, colors);
344|}
345|
346|function updatePieLegend(results, colors) {
347|    const legend = document.getElementById('pieLegend');
348|    legend.innerHTML = '';
349|    
350|    results.forEach((partido, index) => {
351|        const item = document.createElement('div');
352|        item.className = 'legend-item';
353|        item.innerHTML = `
354|            <div class="legend-color" style="background-color: ${colors[index % colors.length]}"></div>
355|            <span class="legend-text">${partido.partido}</span>
356|            <span class="legend-percentage">${partido.porcentaje}%</span>
357|        `;
358|        legend.appendChild(item);
359|    });
360|}
361|
362|// ================================
363|// REDIMENSIONAMIENTO
364|// ================================
365|
366|window.addEventListener('resize', () => {
367|    if (electionData[currentElection]) {
368|        drawBarChart(electionData[currentElection]);
369|        drawPieChart(electionData[currentElection]);
370|    }
371|});
