const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

function updateTheme() {
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
        if(themeToggleLightIcon) themeToggleLightIcon.classList.remove('hidden');
        if(themeToggleDarkIcon) themeToggleDarkIcon.classList.add('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
        if(themeToggleDarkIcon) themeToggleDarkIcon.classList.remove('hidden');
        if(themeToggleLightIcon) themeToggleLightIcon.classList.add('hidden');
    }
}
updateTheme();

if(themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
        localStorage.setItem('color-theme', document.documentElement.classList.contains('dark') ? 'light' : 'dark');
        updateTheme();
    });
}

const subjectColors = {
    'Proyectos 1': 'text-amber-500 border-amber-500',
    'Estructuras 1': 'text-blue-500 border-blue-500',
    'Comunicación 1': 'text-purple-500 border-purple-500',
    'Representación 1': 'text-emerald-500 border-emerald-500',
    'Arquitectura 1': 'text-rose-500 border-rose-500',
    'General': 'text-slate-500 border-slate-500'
};

const statusConfig = {
    'pending': { label: 'Pendiente', color: 'bg-red-100 border-red-300 text-red-950 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-100 hover:border-red-400 dark:hover:border-red-800', icon: 'fa-circle-exclamation text-red-600 dark:text-red-500', badge: 'bg-white/60 dark:bg-black/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-900/50' },
    'progress': { label: 'En Progreso', color: 'bg-blue-100 border-blue-300 text-blue-950 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-100 hover:border-blue-400 dark:hover:border-red-800', icon: 'fa-spinner fa-spin-pulse text-blue-600 dark:text-blue-500', badge: 'bg-white/60 dark:bg-black/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-900/50' },
    'completed': { label: 'Lista', color: 'bg-emerald-100 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-100 opacity-60 grayscale-[0.3]', icon: 'fa-circle-check text-emerald-600 dark:text-emerald-500', badge: 'bg-white/60 dark:bg-black/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-900/50' }
};

const BIN_ID = "69bb91abb7ec241ddc808ad7";
const API_KEY = "$2a$10$Cp1QYKCiLNyV5X7QTSPtau71EzDFlGNzeh3Hri7WbH1U7kR5Un9P6";
const API_URL = `https://api.jsonbin.io/v3/b/69bb91abb7ec241ddc808ad7`;

let tasks = [];
let currentActiveTaskId = null;
let editingTaskId = null;
let tempSubtasks = [];

// Base de Datos de Conceptos para el Glosario
const conceptosGlosario = [
    { nombre: "Expuesto", desc: "Espacio sin paredes ni techos que lo cierren, quedando completamente abierto y vulnerable al clima y la vista.", ejemplo: "Una terraza descubierta, un balcón saliente o una plaza pública sin sombra.", icon: "fa-eye", color: "amber" },
    { nombre: "Dinamismo", desc: "Sensación de energía y movimiento en un diseño, evitando que se vea como un cajón aburrido o rígido.", ejemplo: "Un edificio con techos inclinados o formas curvas continuas que parece estar en movimiento.", icon: "fa-bolt", color: "rose" },
    { nombre: "Converger", desc: "Cuando varias líneas, pasillos o paredes se dirigen y se unen en un mismo punto central.", ejemplo: "Varias calles que terminan encontrándose exactamente en la misma plaza redonda.", icon: "fa-arrows-to-dot", color: "blue" },
    { nombre: "Divergente", desc: "Elementos o caminos que nacen juntos en un mismo lugar pero se separan hacia distintas direcciones.", ejemplo: "El hall principal de un hospital desde donde nacen tres pasillos yendo a alas distintas.", icon: "fa-arrows-split-up-and-left", color: "teal" },
    { nombre: "Fluidez", desc: "Transición muy suave entre espacios, sin cortes bruscos ni muros, permitiendo moverse o mirar de forma continua.", ejemplo: "Una casa donde la sala, el comedor y la cocina están unidos en un solo gran espacio sin puertas.", icon: "fa-water", color: "cyan" },
    { nombre: "Descendente", desc: "Recorrido, escalera o terreno diseñado para ir bajando poco a poco de nivel.", ejemplo: "Una rampa peatonal que desciende suavemente hacia una estación de metro subterránea.", icon: "fa-stairs", color: "slate" },
    { nombre: "Concentrado", desc: "Agrupar muchos elementos, personas o actividades en un área pequeña, creando un 'núcleo' apretado.", ejemplo: "Juntar todos los baños, escaleras y ascensores justo en el centro de una torre.", icon: "fa-compress", color: "purple" },
    { nombre: "Cambio de dirección", desc: "Cuando un pasillo o ruta gira (por ejemplo, a 90 grados) forzando a mirar hacia otro lado y rompiendo la línea recta.", ejemplo: "Un pasillo en forma de 'L' que mantiene en secreto lo que hay a la vuelta.", icon: "fa-route", color: "amber" },
    { nombre: "Amplitud", desc: "Sensación de espacio inmenso y holgado, con mucha distancia entre las paredes y altura hacia el techo.", ejemplo: "El interior de una gran catedral antigua o un coliseo deportivo.", icon: "fa-maximize", color: "emerald" },
    { nombre: "Reducir", desc: "Hacer un espacio más pequeño o bajo a propósito para que se sienta más íntimo, privado o apretado.", ejemplo: "Bajar un poco la altura del techo en una sala de estar para hacerla sentir más acogedora.", icon: "fa-minimize", color: "rose" },
    { nombre: "Continuo", desc: "Una superficie o espacio ininterrumpido, manteniéndose unido sin divisiones que lo rompan.", ejemplo: "Un suelo de madera o porcelanato que recorre toda una casa sin tener umbrales en las puertas.", icon: "fa-infinity", color: "blue" },
    { nombre: "Orgánico", desc: "Diseño libre que imita las formas curvas, de crecimiento y la adaptación suave de la naturaleza.", ejemplo: "Un techo ondulado cubierto de pasto que se camufla visualmente con las lomas de un cerro.", icon: "fa-leaf", color: "emerald" },
    { nombre: "Estrechez", desc: "Un espacio muy angosto que te obliga a caminar rápido o que genera una sensación de estar 'apretado'.", ejemplo: "Un callejón oscuro y muy delgado entre dos edificios gigantes.", icon: "fa-arrows-left-right-to-line", color: "slate" },
    { nombre: "Pausa", desc: "Un lugar diseñado específicamente para detenerse, descansar o pensar antes de seguir caminando.", ejemplo: "Un pequeño balconcito con una banca situado justo a la mitad de un pasillo muy largo.", icon: "fa-pause", color: "amber" },
    { nombre: "Resguardo", desc: "Un lugar que da la sensación psicológica y física de protección y cobijo frente al clima o la calle.", ejemplo: "El portal techado en la entrada de una cabaña donde te pones a salvo mientras llueve.", icon: "fa-shield-halved", color: "purple" },
    { nombre: "Entrelazar", desc: "Cuando dos o más espacios, formas o materiales se cruzan, montan y mezclan entre sí como si fueran un tejido.", ejemplo: "Un pasillo de losa que cruza por medio de una piscina, o escaleras cruzadas.", icon: "fa-diagram-project", color: "rose" },
    { nombre: "Tramo", desc: "Un segmento recto e ininterrumpido de un pasillo o escalera, justo el trozo que está entre dos descansos.", ejemplo: "Los primeros diez escalones seguidos que subes antes de llegar al descanso para girar.", icon: "fa-grip-lines", color: "blue" },
    { nombre: "Progresivo", desc: "Un espacio que va cambiando y transformándose poco a poco (haciéndose más grande, más alto o más claro).", ejemplo: "Un túnel que empieza muy estrecho y oscuro, y se va ensanchando hacia la salida.", icon: "fa-arrow-trend-up", color: "emerald" },
    { nombre: "Dispersión", desc: "Separar las partes de un proyecto y repartirlas de forma suelta por el terreno dejando espacios libres.", ejemplo: "Un colegio con las salas en forma de cabañas separadas rodeadas de áreas verdes.", icon: "fa-braille", color: "amber" },
    { nombre: "Horizontalidad", desc: "Un diseño donde reinan las formas a ras de suelo, dando una sensación visual de calma, arraigo y descanso.", ejemplo: "Una casa de campo de un solo piso, muy plana, rectangular y de techos extensos.", icon: "fa-arrows-left-right", color: "slate" },
    { nombre: "Verticalidad", desc: "Diseño donde mandan las líneas hacia arriba, expresando altitud, fuerza y ganas de tocar el cielo.", ejemplo: "Los rascacielos o las altísimas naves y agujas de las iglesias góticas.", icon: "fa-arrows-up-down", color: "teal" },
    { nombre: "Lineal", desc: "Una organización tipo 'tren', donde los recintos están acomodados uno detrás de otro a lo largo de un eje o pasillo.", ejemplo: "Las salas de clases en un pasillo largo, o las habitaciones a lo largo de un tren.", icon: "fa-ruler", color: "blue" },
    { nombre: "Fragmentada", desc: "Cuando un edificio grande no se ve como un bloque sólido, sino que parece haber sido dividido en 'pedazos' más chicos.", ejemplo: "Una casa compuesta por tres cubos diferentes pero que se unen por pequeños puentes de vidrio.", icon: "fa-puzzle-piece", color: "purple" },
    { nombre: "Recorrido", desc: "El camino intencional diseñado por el arquitecto para que la persona viva el edificio como si fuera una película.", ejemplo: "El camino laberíntico de tiendas como IKEA que te guía para que veas todo paso a paso.", icon: "fa-map-location-dot", color: "rose" }
];

// Variables para el Calendario
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentDateFilter = null; 

// --- FUNCIONES DE IMPORTACIÓN Y EXPORTACIÓN (.TXT) ---
window.handleExportTasks = function() {
    if(tasks.length === 0) {
        alert("No hay tareas para exportar.");
        return;
    }
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "respaldo_tareas_arquitectura.txt";
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

window.handleImportTasks = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedTasks = JSON.parse(e.target.result);
            if (!Array.isArray(importedTasks)) throw new Error("El archivo no contiene un formato válido.");
            
            let addedCount = 0;
            let updatedCount = 0;
            
            importedTasks.forEach(impTask => {
                const existingIdx = tasks.findIndex(t => t.id === impTask.id);
                if (existingIdx !== -1) {
                    tasks[existingIdx] = impTask; 
                    updatedCount++;
                } else {
                    tasks.push(impTask); 
                    addedCount++;
                }
            });

            saveTasks(); 
            alert(`Importación exitosa.\n\nTareas nuevas añadidas: ${addedCount}\nTareas actualizadas: ${updatedCount}`);
        } catch (err) {
            alert("Error al importar. Asegúrate de seleccionar un archivo .txt válido generado previamente por la plataforma.");
        }
        event.target.value = ''; // Reset input
    };
    reader.readAsText(file);
};

// --- FIN FUNCIONES IMPORT/EXPORT ---

async function initCloudDB() {
    try {
        const res = await fetch(`${API_URL}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        const data = await res.json();
        tasks = Array.isArray(data.record) ? data.record : [];
    } catch (e) {
        tasks = JSON.parse(localStorage.getItem('arquitectura_respaldo')) || [];
    }
    
    router(); 
}

function saveTasks() {
    localStorage.setItem('arquitectura_respaldo', JSON.stringify(tasks));
    
    const hash = window.location.hash || '#home';
    if(hash === '#home') renderDashboardTasks();
    if(hash === '#tareas') {
        renderCalendar();
        renderTasksGrid();
    }
    checkNotifications();

    fetch(API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY
        },
        body: JSON.stringify(tasks)
    });
}

function getDaysDiff(dateStr) {
    if(!dateStr) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    return Math.ceil((new Date(dateStr + 'T00:00:00') - today) / (1000 * 60 * 60 * 24));
}

function formatDate(dateString) {
    if (!dateString) return 'Sin fecha límite';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

window.requestNotif = function() {
    if ("Notification" in window) {
        Notification.requestPermission().then(p => { if(p === "granted") checkNotifications(); });
    }
};

function checkNotifications() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const today = new Date(); today.setHours(0,0,0,0);
    tasks.forEach(t => {
        if(t.status === 'completed' || !t.date) return;
        const diff = Math.ceil((new Date(t.date + 'T00:00:00') - today) / (1000 * 60 * 60 * 24));
        if(diff === 1 || diff === 0) new Notification("Entrega Próxima", { body: `${t.title} - ${t.subject}` });
    });
}

function router() {
    const hash = window.location.hash || '#home';
    const template = document.querySelector(`template[data-route="${hash}"]`);
    const appRoot = document.getElementById('app-root');
    
    if (template) {
        appRoot.innerHTML = template.innerHTML;
        
        updateBreadcrumb(hash);
        updateNavState(hash);
        
        if(hash === '#home') {
            renderDashboardTasks();
            if(window.checkAttendanceAlert) window.checkAttendanceAlert();
        }
        if(hash === '#tareas') {
            currentDateFilter = null; // Resetear filtro al entrar
            renderCalendar();
            renderTasksGrid();
            document.getElementById('filter-status').addEventListener('change', renderTasksGrid);
            document.getElementById('filter-subject').addEventListener('change', renderTasksGrid);
        }
        if(hash === '#glosario') {
            renderGlosario();
            const searchInput = document.getElementById('search-input');
            if(searchInput) {
                searchInput.addEventListener('input', (e) => renderGlosario(e.target.value));
            }
        }
        if(hash === '#proyectos_1') renderDirectorio();
        
        if(hash === '#conjuntos') {
            if (window.MathJax) { MathJax.typesetPromise(); }
        }
        if(hash === '#ritmo_y_movimiento') {
            updateRhythm(); 
            updateMovement();
        }
    } else {
        window.location.hash = '#home';
    }
}

function updateBreadcrumb(hash) {
    const b = document.getElementById('breadcrumb');
    const baseAmber = `<a href="#home" class="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Portal</a>`;
    const baseBlue = `<a href="#home" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Portal</a>`;
    const baseRose = `<a href="#home" class="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">Portal</a>`;
    
    if(hash === '#home') b.innerHTML = `<span class="text-slate-900 dark:text-slate-200 font-semibold">Portal</span>`;
    else if(hash === '#tareas') b.innerHTML = `${baseAmber} <i class="fa-solid fa-chevron-right text-[10px] md:text-xs"></i> <span class="text-slate-900 dark:text-slate-200 font-semibold">Calendario</span>`;
    else if(hash === '#horario') b.innerHTML = `${baseAmber} <i class="fa-solid fa-chevron-right text-[10px] md:text-xs"></i> <span class="text-slate-900 dark:text-slate-200 font-semibold">Horario</span>`;
    else if(hash === '#glosario') b.innerHTML = `${baseAmber} <i class="fa-solid fa-chevron-right text-[10px] md:text-xs"></i> <span class="text-slate-900 dark:text-slate-200 font-semibold">Glosario</span>`;
    else if(hash === '#proyectos_1') b.innerHTML = `${baseAmber} <i class="fa-solid fa-chevron-right text-[10px] md:text-xs"></i> <span class="text-slate-900 dark:text-slate-200 font-semibold">Proyectos 1</span>`;
    else if(hash === '#estructuras_1') b.innerHTML = `${baseBlue} <i class="fa-solid fa-chevron-right text-[10px] md:text-xs"></i> <span class="text-slate-900 dark:text-slate-200 font-semibold">Estructuras 1</span>`;
    else if(hash === '#arquitectura_1') b.innerHTML = `${baseRose} <i class="fa-solid fa-chevron-right text-[10px] md:text-xs"></i> <span class="text-slate-900 dark:text-slate-200 font-semibold">Arquitectura 1</span>`;
    else if(hash === '#origenes_y_evolucion') b.innerHTML = `${baseRose} <i class="fa-solid fa-chevron-right text-[10px] md:text-xs"></i> <a href="#arquitectura_1" class="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">Arquitectura 1</a> <i class="fa-solid fa-chevron-right text-[10px] md:text-xs"></i> <span class="text-slate-900 dark:text-slate-200 font-semibold">Orígenes y Evolución</span>`;
    else if(hash === '#conjuntos') b.innerHTML = `${baseBlue} <i class="fa-solid fa-chevron-right text-[10px] md:text-xs"></i> <a href="#estructuras_1" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Estructuras 1</a> <i class="fa-solid fa-chevron-right text-[10px] md:text-xs"></i> <span class="text-slate-900 dark:text-slate-200 font-semibold">Teoría de Conjuntos</span>`;
    else if(hash === '#ritmo_y_movimiento') b.innerHTML = `${baseAmber} <i class="fa-solid fa-chevron-right text-[10px] md:text-xs"></i> <a href="#proyectos_1" class="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Proyectos 1</a> <i class="fa-solid fa-chevron-right text-[10px] md:text-xs"></i> <span class="text-slate-900 dark:text-slate-200 font-semibold">Ritmo y Movimiento</span>`;
}

function updateNavState(hash) {
    const navT = document.getElementById('nav-tareas');
    const navH = document.getElementById('nav-horario');
    const navG = document.getElementById('nav-glosario');
    if(hash === '#tareas') navT.classList.add('border-amber-500', 'text-amber-600', 'dark:text-amber-400');
    else navT.classList.remove('border-amber-500', 'text-amber-600', 'dark:text-amber-400');
    
    if(hash === '#horario') navH.classList.add('border-amber-500', 'text-amber-600', 'dark:text-amber-400');
    else navH.classList.remove('border-amber-500', 'text-amber-600', 'dark:text-amber-400');

    if(navG) {
        if(hash === '#glosario') navG.classList.add('border-amber-500', 'text-amber-600', 'dark:text-amber-400');
        else navG.classList.remove('border-amber-500', 'text-amber-600', 'dark:text-amber-400');
    }
}

function renderDirectorio() {
    const contenedor = document.getElementById('contenedor-unidades');
    if(!contenedor) return;
    contenedor.innerHTML = typeof directorioProyectos1 !== 'undefined' ? directorioProyectos1.map(unidad => `
        <a href="${unidad.archivo}" class="bg-${unidad.color}-100 dark:bg-${unidad.color}-950/30 border border-${unidad.color}-300 dark:border-${unidad.color}-800/50 rounded-xl p-4 sm:p-6 flex items-center justify-between group block transition-all max-w-4xl hover:shadow-md hover:-translate-y-1 hover:border-${unidad.color}-400 dark:hover:border-${unidad.color}-700">
            <div class="flex items-center gap-3 sm:gap-4">
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-${unidad.color}-200/50 dark:bg-${unidad.color}-900/50 flex items-center justify-center border border-${unidad.color}-300 dark:border-${unidad.color}-700 shrink-0">
                    <i class="fa-solid ${unidad.icono} text-${unidad.color}-700 dark:text-${unidad.color}-400 text-lg"></i>
                </div>
                <div>
                    <h3 class="text-lg sm:text-xl font-bold text-${unidad.color}-950 dark:text-${unidad.color}-50 mb-1">${unidad.titulo}</h3>
                    <p class="text-${unidad.color}-700/80 dark:text-${unidad.color}-200/60 text-xs sm:text-sm">${unidad.descripcion}</p>
                </div>
            </div>
            <i class="fa-solid fa-arrow-right text-${unidad.color}-600 dark:text-${unidad.color}-400 group-hover:translate-x-1 transition-all ml-2"></i>
        </a>
    `).join('') : '<p class="text-slate-500">No se ha cargado unidades.js</p>';
}

function renderDashboardTasks() {
    const container = document.getElementById('dashboard-tasks');
    if(!container) return;
    
    const pendingTasks = tasks.filter(t => t.status !== 'completed').sort((a, b) => {
        if(!a.date) return 1; if(!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
    });

    container.innerHTML = '';
    if(pendingTasks.length === 0) {
        container.innerHTML = `<div class="col-span-full py-8 text-center text-slate-500"><i class="fa-solid fa-clipboard-check text-3xl sm:text-5xl mb-3 sm:mb-4 opacity-50 block"></i><p class="text-sm sm:text-base font-bold">Todo al día.</p></div>`;
        return;
    }

    pendingTasks.slice(0, 4).forEach(task => {
        const daysDiff = getDaysDiff(task.date);
        let alertBadge = '';
        if(daysDiff !== null) {
            if(daysDiff < 0) alertBadge = `<span class="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded ml-2 uppercase animate-pulse shadow-sm">Vencida</span>`;
            else if(daysDiff <= 2) alertBadge = `<span class="bg-amber-500 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded ml-2 uppercase animate-pulse shadow-sm">Urgente</span>`;
        }

        let dateDisplay = `<div class="w-16 sm:w-20 h-16 sm:h-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 shrink-0"><i class="fa-solid fa-calendar text-slate-400 text-xl"></i></div>`;
        if(task.date) {
            const d = new Date(task.date + 'T00:00:00');
            dateDisplay = `<div class="w-16 sm:w-20 h-16 sm:h-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 shrink-0"><span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">${d.getDate()}</span><span class="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">${d.toLocaleDateString('es-CL', {month:'short'})}</span></div>`;
        }

        container.innerHTML += `
            <div class="${statusConfig[task.status].color} border p-4 sm:p-5 rounded-xl shadow-sm flex items-center gap-4 sm:gap-5 transition-colors cursor-pointer" onclick="openDetailsModal('${task.id}')">
                ${dateDisplay}
                <div class="flex-grow min-w-0">
                    <div class="flex items-center mb-1.5">
                        <span class="bg-white/60 dark:bg-black/20 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase truncate">${task.subject}</span>
                        ${alertBadge}
                    </div>
                    <h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">${task.title}</h4>
                </div>
            </div>`;
    });
}

// --- FUNCIONES DEL CALENDARIO ---
function renderCalendar() {
    const calGrid = document.getElementById('calendar-grid');
    const calMonthYear = document.getElementById('calendar-month-year');
    if (!calGrid || !calMonthYear) return;

    let firstDay = new Date(currentYear, currentMonth, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1; // Ajuste para que la semana empiece en Lunes
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    calMonthYear.innerText = `${monthNames[currentMonth]} ${currentYear}`;

    calGrid.innerHTML = '';

    // Días vacíos iniciales
    for (let i = 0; i < firstDay; i++) {
        calGrid.innerHTML += `<div class="p-2 sm:p-4 rounded-xl opacity-0 pointer-events-none"></div>`;
    }

    const today = new Date();
    
    // Generar días del mes
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayTasks = tasks.filter(t => t.date === dateStr);
        
        const isToday = i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        const isSelected = currentDateFilter === dateStr;
        
        let borderClass = 'border-slate-200 dark:border-slate-700';
        if(isSelected) borderClass = 'border-amber-500 ring-2 ring-amber-500/30';
        else if(isToday) borderClass = 'border-amber-300 dark:border-amber-700';

        const bgClass = isToday && !isSelected ? 'bg-amber-100 dark:bg-amber-900/20' : 'bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800';

        let tasksHtml = '';
        dayTasks.forEach(t => {
            const colorMap = {
                'Proyectos 1': 'bg-amber-500', 'Estructuras 1': 'bg-blue-500', 'Comunicación 1': 'bg-purple-500', 
                'Representación 1': 'bg-emerald-500', 'Arquitectura 1': 'bg-rose-500', 'General': 'bg-slate-500'
            };
            const dotColor = colorMap[t.subject] || 'bg-amber-500';
            const textOpacity = t.status === 'completed' ? 'opacity-40 line-through' : 'text-slate-700 dark:text-slate-300';
            
            tasksHtml += `<div class="text-[9px] sm:text-[10px] font-bold mt-1 truncate flex items-center gap-1 ${textOpacity}" title="${t.title}"><span class="w-1.5 h-1.5 rounded-full ${dotColor} shrink-0"></span><span class="truncate">${t.title}</span></div>`;
        });

        calGrid.innerHTML += `
            <div class="border ${borderClass} rounded-xl p-1.5 sm:p-2 min-h-[60px] sm:min-h-[80px] flex flex-col ${bgClass} transition-all cursor-pointer shadow-sm" onclick="filterByDate('${dateStr}')">
                <span class="text-xs sm:text-sm font-bold ${isToday ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}">${i}</span>
                <div class="flex-grow overflow-y-auto scrollbar-hide mt-1 space-y-0.5 max-h-[50px]">
                    ${tasksHtml}
                </div>
            </div>
        `;
    }
}

window.filterByDate = function(dateStr) {
    if (currentDateFilter === dateStr) {
        currentDateFilter = null; // Toggle (Desactivar filtro si se vuelve a hacer clic)
    } else {
        currentDateFilter = dateStr;
    }
    
    // Al filtrar por fecha en el calendario, limpiamos los filtros superiores para que funcione bien
    if(currentDateFilter) {
        document.getElementById('filter-status').value = 'all';
        document.getElementById('filter-subject').value = 'all';
    }
    
    renderCalendar();
    renderTasksGrid();
    
    // Scroll a la grilla si activamos un filtro
    if(currentDateFilter) {
        document.getElementById('view-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// --- FIN CALENDARIO ---


function renderTasksGrid() {
    const grid = document.getElementById('view-grid');
    const emptyState = document.getElementById('empty-state');
    const activeDateIndicator = document.getElementById('active-date-indicator');
    const activeDateText = document.getElementById('active-date-text');
    if(!grid) return;
    
    const filterStatus = document.getElementById('filter-status').value;
    const filterSubject = document.getElementById('filter-subject').value;
    
    // Aplicar filtros: Estado + Asignatura + Fecha (Calendario)
    let filteredTasks = tasks.filter(t => 
        (filterStatus === 'all' || t.status === filterStatus) && 
        (filterSubject === 'all' || t.subject === filterSubject) &&
        (!currentDateFilter || t.date === currentDateFilter)
    );
    
    filteredTasks.sort((a, b) => {
        if(!a.date && !b.date) return 0; if(!a.date) return 1; if(!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
    });

    // Mostrar/Ocultar indicador visual de fecha activa
    if(currentDateFilter) {
        activeDateIndicator.classList.remove('hidden');
        activeDateIndicator.classList.add('flex');
        activeDateText.innerText = formatDate(currentDateFilter);
    } else {
        activeDateIndicator.classList.add('hidden');
        activeDateIndicator.classList.remove('flex');
    }

    grid.innerHTML = '';
    if (filteredTasks.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden'); emptyState.classList.add('flex');
        return;
    }
    grid.classList.remove('hidden');
    emptyState.classList.add('hidden'); emptyState.classList.remove('flex');

    filteredTasks.forEach(task => {
        const statInfo = statusConfig[task.status];
        const daysDiff = getDaysDiff(task.date);
        let alertBadge = '';
        if(task.status !== 'completed' && daysDiff !== null) {
            if(daysDiff < 0) alertBadge = `<span class="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded ml-2 uppercase animate-pulse shadow-sm">Vencida</span>`;
            else if(daysDiff <= 2) alertBadge = `<span class="bg-amber-500 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded ml-2 uppercase animate-pulse shadow-sm">Urgente</span>`;
        }

        const subtext = (task.subtasks && task.subtasks.length > 0) ? `<div class="mt-2 text-[10px] font-bold text-slate-500"><i class="fa-solid fa-list-check"></i> ${task.subtasks.filter(s=>s.completed).length}/${task.subtasks.length}</div>` : '';
        
        const card = document.createElement('div');
        card.onclick = () => openDetailsModal(task.id);
        card.className = `border rounded-2xl p-5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 relative flex flex-col h-full shadow-sm ${statInfo.color}`;
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <span class="px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase border ${statInfo.badge}">${task.subject}</span>
                <button onclick="event.stopPropagation(); openEditTaskModal('${task.id}')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1" title="Editar"><i class="fa-solid fa-pen text-xs"></i></button>
            </div>
            <h3 class="font-bold text-lg mb-1 leading-tight pr-4 ${task.status === 'completed' ? 'line-through' : ''}">${task.title} ${alertBadge}</h3>
            ${subtext}
            <div class="mt-auto pt-4 flex justify-between items-center w-full">
                <div class="flex items-center text-xs font-bold opacity-70 gap-1.5">
                    <i class="fa-regular fa-calendar"></i> ${task.date ? new Date(task.date + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : 'Sin fecha'}
                </div>
                <div class="text-sm" title="${statInfo.label}"><i class="fa-solid ${statInfo.icon}"></i></div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- FUNCIONES DEL GLOSARIO ---
function renderGlosario(filtro = '') {
    const grid = document.getElementById('glosario-grid');
    const emptyState = document.getElementById('empty-state-glosario');
    if(!grid || !emptyState) return;
    
    grid.innerHTML = '';
    const filtrados = conceptosGlosario.filter(c => 
        c.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        c.desc.toLowerCase().includes(filtro.toLowerCase()) ||
        c.ejemplo.toLowerCase().includes(filtro.toLowerCase())
    ).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

    if (filtrados.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden'); emptyState.classList.add('flex');
        return;
    }
    grid.classList.remove('hidden');
    emptyState.classList.add('hidden'); emptyState.classList.remove('flex');

    filtrados.forEach(c => {
        const colors = {
            amber: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400' },
            rose: { bg: 'bg-rose-100 dark:bg-rose-900/50', text: 'text-rose-600 dark:text-rose-400' },
            blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400' },
            teal: { bg: 'bg-teal-100 dark:bg-teal-900/50', text: 'text-teal-600 dark:text-teal-400' },
            cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/50', text: 'text-cyan-600 dark:text-cyan-400' },
            slate: { bg: 'bg-slate-200 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
            purple: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400' },
            emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-600 dark:text-emerald-400' }
        };
        const clr = colors[c.color] || colors.slate;
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 group flex flex-col h-full";
        card.innerHTML = `
            <div class="w-10 h-10 rounded-xl ${clr.bg} flex items-center justify-center ${clr.text} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner shrink-0">
                <i class="fa-solid ${c.icon} text-lg"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">${c.nombre}</h3>
            <p class="text-[13px] sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">${c.desc}</p>
            <div class="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <p class="text-[10px] font-bold uppercase tracking-widest ${clr.text} mb-1 flex items-center gap-1.5"><i class="fa-regular fa-lightbulb"></i> Ejemplo</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed font-medium">${c.ejemplo}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

function toggleModal(id, show) {
    const modal = document.getElementById(id);
    if(!modal) return;
    const content = modal.children[0];
    if(show) {
        modal.classList.remove('hidden');
        void modal.offsetWidth;
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    } else {
        modal.classList.add('opacity-0');
        content.classList.remove('scale-100');
        content.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

function renderTempSubtasks() {
    const list = document.getElementById('temp-subtasks-list');
    if(list) list.innerHTML = tempSubtasks.map((s, index) => `
        <li class="text-xs font-medium text-slate-600 dark:text-slate-300 border-l-2 border-amber-500 pl-2 flex justify-between items-center">
            <span><i class="fa-regular fa-square mr-1"></i> ${s.title}</span>
            <button type="button" onclick="removeTempSubtask(${index})" class="text-red-500 hover:text-red-700 px-2 py-1"><i class="fa-solid fa-xmark"></i></button>
        </li>`).join('');
}

window.removeTempSubtask = function(index) { tempSubtasks.splice(index, 1); renderTempSubtasks(); };
window.addTempSubtask = function() {
    const inp = document.getElementById('subtask-input');
    if(!inp) return;
    const v = inp.value.trim();
    if(!v) return;
    tempSubtasks.push({ id: Date.now().toString(), title: v, completed: false });
    inp.value = '';
    renderTempSubtasks();
};

window.openNewTaskModal = function() {
    editingTaskId = null; tempSubtasks = [];
    document.getElementById('task-form').reset();
    document.querySelector('input[name="subject"][value="Proyectos 1"]').checked = true;
    
    // Si hay un filtro de fecha activo, pre-llenarlo en el formulario
    if(currentDateFilter) {
        document.getElementById('task-date').value = currentDateFilter;
    }

    document.getElementById('modal-form-title').innerText = "Crear Tarea";
    renderTempSubtasks();
    toggleModal('modal-task-form', true);
};

window.openEditTaskModal = function(id) {
    const task = tasks.find(t => t.id === id);
    if(!task) return;
    toggleModal('modal-task-details', false);
    editingTaskId = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-desc').value = task.desc || '';
    document.getElementById('task-date').value = task.date || '';
    document.querySelector(`input[name="subject"][value="${task.subject}"]`).checked = true;
    tempSubtasks = task.subtasks ? [...task.subtasks] : [];
    renderTempSubtasks();
    document.getElementById('modal-form-title').innerText = "Editar Tarea";
    toggleModal('modal-task-form', true);
};

window.openDetailsModal = function(id) {
    currentActiveTaskId = id;
    const task = tasks.find(t => t.id === id);
    if(!task) return;

    document.getElementById('dt-title').innerText = task.title;
    document.getElementById('dt-date').innerText = formatDate(task.date);
    document.getElementById('dt-desc').innerText = task.desc || "Sin descripción adicional.";
    
    const subjectIndicator = document.getElementById('dt-subject');
    subjectIndicator.className = `px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase border ${subjectColors[task.subject]} bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700`;
    subjectIndicator.innerText = task.subject;

    const subContainer = document.getElementById('dt-subtasks');
    if(task.subtasks && task.subtasks.length > 0) {
        subContainer.innerHTML = task.subtasks.map(s => `
            <div class="flex items-center gap-2 cursor-pointer" onclick="toggleSubtaskStatus('${s.id}')">
                <i class="${s.completed ? 'fa-solid fa-square-check text-amber-500' : 'fa-regular fa-square text-slate-400'} text-lg transition-colors"></i>
                <span class="text-sm font-medium ${s.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}">${s.title}</span>
            </div>
        `).join('');
        subContainer.parentElement.classList.remove('hidden');
    } else {
        subContainer.parentElement.classList.add('hidden');
    }

    document.querySelectorAll('.btn-status').forEach(btn => {
        btn.className = `btn-status border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm`;
    });

    const activeBtn = document.querySelector(`.btn-status[data-status="${task.status}"]`);
    if(task.status === 'pending') activeBtn.className = 'btn-status border border-red-300 dark:border-red-700 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 shadow-sm';
    if(task.status === 'progress') activeBtn.className = 'btn-status border border-blue-300 dark:border-blue-700 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-sm';
    if(task.status === 'completed') activeBtn.className = 'btn-status border border-emerald-300 dark:border-emerald-700 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 shadow-sm';

    toggleModal('modal-task-details', true);
};

window.toggleSubtaskStatus = function(subId) {
    const task = tasks.find(t => t.id === currentActiveTaskId);
    if(!task) return;
    const sub = task.subtasks.find(s => s.id === subId);
    if(sub) { sub.completed = !sub.completed; saveTasks(); openDetailsModal(currentActiveTaskId); }
};

const subjectDetailsData = {
    'Proyectos 1: Espacio': [
        { name: 'Denise Engler', email: 'denise.engler@ulagos.cl' },
        { name: 'María José Pagliero', email: 'mariajose.pagliero@ulagos.cl' },
        { name: 'Francisco Martínez', email: 'francisco.martinez@ulagos.cl' },
        { name: 'Raquel Paillacar', email: 'raquel.paillacar@ulagos.cl' },
        { name: 'Yasmine Álvarez', email: 'yasmine.alvarez@ulagos.cl' },
        { name: 'Lorena Ruiz', email: 'lorena.ruiz@ulagos.cl' }
    ]
};

window.openClassModal = function(title, time, room, teacher, color) {
    const classColorMap = {
        amber: 'bg-amber-200 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-amber-400 dark:border-amber-800/50',
        blue: 'bg-blue-200 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-400 dark:border-blue-800/50',
        purple: 'bg-purple-200 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-400 dark:border-purple-800/50',
        emerald: 'bg-emerald-200 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border-emerald-400 dark:border-emerald-800/50',
        rose: 'bg-rose-200 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400 border-rose-400 dark:border-rose-800/50'
    };
    document.getElementById('class-title').innerText = title;
    document.getElementById('class-time').innerText = time;
    document.getElementById('class-room').innerText = room;
    document.getElementById('class-teacher').innerText = teacher;
    document.getElementById('class-color-indicator').className = `px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 border ${classColorMap[color]}`;
    
    const detailsContainer = document.getElementById('class-details-container');
    const emailsList = document.getElementById('class-emails-list');
    
    if (subjectDetailsData[title]) {
        emailsList.innerHTML = subjectDetailsData[title].map(prof => `
            <li class="flex flex-col bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50 shadow-sm mt-2 sm:mt-0">
                <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 truncate" title="${prof.name}">${prof.name}</span>
                <a href="mailto:${prof.email}" class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 truncate" title="Enviar correo a ${prof.email}">
                    <i class="fa-regular fa-envelope shrink-0"></i> <span class="truncate">${prof.email}</span>
                </a>
            </li>
        `).join('');
        detailsContainer.classList.remove('hidden');
    } else {
        detailsContainer.classList.add('hidden');
        emailsList.innerHTML = '';
    }

    toggleModal('modal-class-info', true);
};

// Listeners de Click Global
document.addEventListener('click', e => {
    // Controles de Importar/Exportar
    if(e.target.closest('#btn-export-tasks')) handleExportTasks();

    // Controles del Mes Calendario
    if(e.target.closest('#btn-prev-month')) {
        currentMonth--;
        if(currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    }
    if(e.target.closest('#btn-next-month')) {
        currentMonth++;
        if(currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar();
    }

    if(e.target.closest('#btn-new-task')) openNewTaskModal();
    if(e.target.closest('#btn-add-subtask')) addTempSubtask();
    if(e.target.closest('#btn-close-form')) toggleModal('modal-task-form', false);
    if(e.target.closest('#btn-close-details')) { toggleModal('modal-task-details', false); currentActiveTaskId = null; }
    if(e.target.closest('#btn-close-class')) toggleModal('modal-class-info', false);
    
    if(e.target.closest('#btn-delete-task')) {
        if(confirm('¿Eliminar tarea definitivamente?')) {
            tasks = tasks.filter(t => t.id !== currentActiveTaskId);
            saveTasks(); toggleModal('modal-task-details', false);
        }
    }
    if(e.target.closest('#btn-edit-task')) openEditTaskModal(currentActiveTaskId);
    
    if(e.target.closest('.btn-status')) {
        const status = e.target.closest('.btn-status').dataset.status;
        if(!currentActiveTaskId) return;
        const idx = tasks.findIndex(t => t.id === currentActiveTaskId);
        if(idx !== -1) { tasks[idx].status = status; saveTasks(); openDetailsModal(currentActiveTaskId); }
    }
    
    if(e.target === document.getElementById('modal-task-form')) toggleModal('modal-task-form', false);
    if(e.target === document.getElementById('modal-task-details')) toggleModal('modal-task-details', false);
    if(e.target === document.getElementById('modal-class-info')) toggleModal('modal-class-info', false);
    
    // Controles para Teoría de Conjuntos
    if(e.target.closest('#btn-comp')) {
        const btnComp = document.getElementById('btn-comp');
        const btnExt = document.getElementById('btn-ext');
        const contentComp = document.getElementById('content-comp');
        const contentExt = document.getElementById('content-ext');
        btnComp.className = "px-4 py-1.5 text-sm font-bold rounded-md bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow transition-all";
        btnExt.className = "px-4 py-1.5 text-sm font-bold rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all";
        contentComp.classList.remove('opacity-0', 'pointer-events-none');
        contentExt.classList.add('opacity-0', 'pointer-events-none');
    }
    if(e.target.closest('#btn-ext')) {
        const btnComp = document.getElementById('btn-comp');
        const btnExt = document.getElementById('btn-ext');
        const contentComp = document.getElementById('content-comp');
        const contentExt = document.getElementById('content-ext');
        btnExt.className = "px-4 py-1.5 text-sm font-bold rounded-md bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow transition-all";
        btnComp.className = "px-4 py-1.5 text-sm font-bold rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all";
        contentExt.classList.remove('opacity-0', 'pointer-events-none');
        contentComp.classList.add('opacity-0', 'pointer-events-none');
    }
});

// Listener de Inputs File (Para Importación)
document.addEventListener('change', e => {
    if(e.target.id === 'file-import-tasks') {
        handleImportTasks(e);
    }
});

document.addEventListener('input', e => {
    if(e.target.id === 'rhythm-freq' || e.target.id === 'rhythm-gap' || e.target.id === 'rhythm-pattern') {
        window.updateRhythm();
    }
    if(e.target.id === 'mov-curve' || e.target.id === 'mov-width') {
        window.updateMovement();
    }
});

window.updateRhythm = function() {
    const freqInp = document.getElementById('rhythm-freq');
    const gapInp = document.getElementById('rhythm-gap');
    const patInp = document.getElementById('rhythm-pattern');
    const display = document.getElementById('rhythm-display');
    if(!freqInp || !gapInp || !patInp || !display) return;
    
    const freq = parseInt(freqInp.value), gap = parseInt(gapInp.value), pattern = patInp.value;
    display.innerHTML = '';
    display.style.gap = `${gap * 0.25}rem`;

    for (let i = 0; i < freq; i++) {
        const element = document.createElement('div');
        let height = '60%', width = '1.5rem', colorClass = 'bg-slate-300 dark:bg-slate-600 border border-slate-400 dark:border-slate-500';
        if (pattern === 'alternating') {
            if (i % 2 === 0) { height = '80%'; width = '2rem'; } 
            else { height = '40%'; width = '1rem'; colorClass = 'bg-amber-400 border border-amber-500 shadow-md shadow-amber-500/20'; }
        } else if (pattern === 'progressive') {
            height = `${20 + (i * (80/freq))}%`; width = `${0.75 + (i * 0.1)}rem`;
            colorClass = 'bg-slate-400 dark:bg-slate-400 border border-slate-500 dark:border-slate-300';
        }
        element.className = `${colorClass} rounded-t-sm transition-colors duration-300`;
        element.style.height = height; element.style.width = width;
        display.appendChild(element);
    }
};

window.updateMovement = function() {
    const movCurve = document.getElementById('mov-curve');
    const movWidth = document.getElementById('mov-width');
    if(!movCurve || !movWidth) return;
    
    const c = parseInt(movCurve.value), w = parseInt(movWidth.value);
    document.getElementById('val-curve').innerText = c;
    document.getElementById('val-width').innerText = `${Math.round(w)}%`;
    const sY = 200, eY = sY + c;
    document.getElementById('svg-wall-top').setAttribute('d', `M -50,${sY - 100} C 250,${sY - 100} 550,${eY - w} 850,${eY - w}`);
    document.getElementById('svg-wall-bottom').setAttribute('d', `M -50,${sY + 100} C 250,${sY + 100} 550,${eY + w} 850,${eY + w}`);
    document.getElementById('svg-flow-1').setAttribute('d', `M -50,${sY - 50} C 250,${sY - 50} 550,${eY - w/2} 850,${eY - w/2}`);
    document.getElementById('svg-flow-2').setAttribute('d', `M -50,${sY} C 250,${sY} 550,${eY} 850,${eY}`);
    document.getElementById('svg-flow-3').setAttribute('d', `M -50,${sY + 50} C 250,${sY + 50} 550,${eY + w/2} 850,${eY + w/2}`);
};

document.addEventListener('submit', e => {
    if(e.target.id === 'task-form') {
        e.preventDefault();
        const subject = document.querySelector('input[name="subject"]:checked').value;
        if(editingTaskId) {
            const idx = tasks.findIndex(t => t.id === editingTaskId);
            if(idx > -1) {
                tasks[idx].title = document.getElementById('task-title').value.trim();
                tasks[idx].desc = document.getElementById('task-desc').value.trim();
                tasks[idx].date = document.getElementById('task-date').value;
                tasks[idx].subject = subject;
                tasks[idx].subtasks = [...tempSubtasks];
            }
        } else {
            tasks.push({
                id: Date.now().toString(),
                title: document.getElementById('task-title').value.trim(),
                desc: document.getElementById('task-desc').value.trim(),
                date: document.getElementById('task-date').value,
                subject: subject,
                status: 'pending',
                subtasks: [...tempSubtasks]
            });
        }
        saveTasks();
        toggleModal('modal-task-form', false);
    }
});

window.addEventListener('hashchange', router);

function initializeApp() {
    initCloudDB();
    // Evalúa la asistencia cada minuto
    setInterval(() => {
        if(window.checkAttendanceAlert) window.checkAttendanceAlert();
    }, 60000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Lógica de la Alerta de Asistencia
const classSchedule = [
    { day: 1, subject: 'Proyectos 1: Espacio', start: '09:30' },
    { day: 2, subject: 'Estructuras 1: Matemáticas', start: '14:15' },
    { day: 2, subject: 'Comunicación 1', start: '16:15' },
    { day: 3, subject: 'Representación 1: Composición', start: '09:30' },
    { day: 3, subject: 'Estructuras 1: Matemáticas', start: '11:30' },
    { day: 4, subject: 'Proyectos 1: Espacio', start: '09:30' },
    { day: 5, subject: 'Arquitectura 1: Clásica', start: '11:30' }
];

window.checkAttendanceAlert = function() {
    const container = document.getElementById('attendance-alert-container');
    if (!container) return; // Solo existe en la pestaña "Portal"

    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let activeClass = null;
    for (const cls of classSchedule) {
        if (cls.day === currentDay) {
            const [startH, startM] = cls.start.split(':').map(Number);
            const startInMinutes = startH * 60 + startM;
            // 15 minutos antes y 15 minutos después
            if (currentMinutes >= startInMinutes - 15 && currentMinutes <= startInMinutes + 15) {
                activeClass = cls;
                break;
            }
        }
    }

    if (activeClass) {
        container.innerHTML = `
            <div class="bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 transform transition-all hover:scale-[1.01] border border-rose-400">
                <div class="absolute -right-10 -top-10 opacity-20 pointer-events-none"><i class="fa-solid fa-clock text-9xl"></i></div>
                <div class="relative z-10 text-center md:text-left flex-1">
                    <div class="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-3 backdrop-blur-sm border border-white/30"><span class="w-2 h-2 rounded-full bg-rose-200 animate-ping"></span> Recordatorio de Asistencia</div>
                    <h2 class="text-2xl sm:text-3xl font-black mb-1 leading-tight">Clase de <span class="text-amber-300">${activeClass.subject}</span></h2>
                    <p class="text-rose-100 font-medium text-sm sm:text-base">La clase comienza a las <strong class="text-white">${activeClass.start}</strong>. ¡No olvides registrar tu asistencia en el portal de ULAGOS!</p>
                </div>
                <a href="https://asistencia.ulagos.cl/" target="_blank" class="relative z-10 shrink-0 bg-white text-rose-600 hover:bg-rose-50 font-black text-sm sm:text-base py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 sm:gap-3"><i class="fa-solid fa-check-to-slot text-lg"></i> Marcar Asistencia</a>
            </div>`;
        container.classList.remove('hidden');
        container.classList.add('block');
    } else {
        container.innerHTML = '';
        container.classList.add('hidden');
        container.classList.remove('block');
    }
};