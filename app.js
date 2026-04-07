// =============================================
//   TEXTILCONTROL — app.js
//   JavaScript puro, sin librerías externas
// =============================================

// ---- STATE ----
const state = {
  empleados: [],
  inventario: [],
  secciones: [],
  editingEmpleado: null,
  editingItem: null,
};

// ---- COLORS for charts ----
const COLORS = ['#6c63ff','#10b981','#f59e0b','#ef4444','#3b82f6','#ec4899','#8b5cf6'];

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  setDate();
  setupNav();
  setupEmpleados();
  setupInventario();
  setupSecciones();
  updateDashboard();
});

function setDate() {
  const d = new Date();
  document.getElementById('pageDate').textContent =
    d.toLocaleDateString('es-CO', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

// ---- NAVIGATION ----
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const sec = item.dataset.section;
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById('section-' + sec).classList.add('active');
      const titles = { dashboard:'Dashboard', empleados:'Empleados', inventario:'Inventario', secciones:'Secciones' };
      document.getElementById('pageTitle').textContent = titles[sec] || sec;
    });
  });
}

// ============================================================
// SECCIONES
// ============================================================
function setupSecciones() {
  document.getElementById('btnNuevaSeccion').addEventListener('click', () => {
    document.getElementById('formSeccion').style.display = 'block';
  });
  document.getElementById('btnCancelarSeccion').addEventListener('click', () => {
    document.getElementById('formSeccion').style.display = 'none';
    clearSeccionForm();
  });
  document.getElementById('btnGuardarSeccion').addEventListener('click', guardarSeccion);
}

function guardarSeccion() {
  const nombre = document.getElementById('secNombre').value.trim();
  const responsable = document.getElementById('secResponsable').value.trim();
  const descripcion = document.getElementById('secDescripcion').value.trim();
  if (!nombre) { showToast('⚠️ El nombre es obligatorio'); return; }
  state.secciones.push({ id: Date.now(), nombre, responsable, descripcion });
  clearSeccionForm();
  document.getElementById('formSeccion').style.display = 'none';
  renderSecciones();
  updateSeccionSelects();
  updateDashboard();
  showToast('✅ Sección registrada');
}

function clearSeccionForm() {
  ['secNombre','secResponsable','secDescripcion'].forEach(id => document.getElementById(id).value = '');
}

function renderSecciones() {
  const grid = document.getElementById('seccionesGrid');
  if (state.secciones.length === 0) {
    grid.innerHTML = '<div class="empty-state">No hay secciones registradas aún.</div>';
    return;
  }
  grid.innerHTML = state.secciones.map(s => `
    <div class="seccion-card">
      <div class="seccion-name">🏭 ${s.nombre}</div>
      <div class="seccion-resp">👤 ${s.responsable || 'Sin responsable'}</div>
      <div class="seccion-desc">${s.descripcion || ''}</div>
      <div class="seccion-actions">
        <button class="btn btn-danger" onclick="eliminarSeccion(${s.id})">Eliminar</button>
      </div>
    </div>
  `).join('');
}

function eliminarSeccion(id) {
  state.secciones = state.secciones.filter(s => s.id !== id);
  renderSecciones();
  updateSeccionSelects();
  updateDashboard();
  showToast('🗑️ Sección eliminada');
}

function updateSeccionSelects() {
  const opts = '<option value="">Seleccionar...</option>' +
    state.secciones.map(s => `<option value="${s.nombre}">${s.nombre}</option>`).join('');
  document.getElementById('empSeccion').innerHTML = opts;
  document.getElementById('invSeccion').innerHTML = opts;
}

// ============================================================
// EMPLEADOS
// ============================================================
function setupEmpleados() {
  document.getElementById('btnNuevoEmpleado').addEventListener('click', () => {
    state.editingEmpleado = null;
    document.getElementById('formEmpleadoTitle').textContent = 'Registrar Empleado';
    clearEmpleadoForm();
    document.getElementById('formEmpleado').style.display = 'block';
  });
  document.getElementById('btnCancelarEmpleado').addEventListener('click', () => {
    document.getElementById('formEmpleado').style.display = 'none';
    clearEmpleadoForm();
  });
  document.getElementById('btnGuardarEmpleado').addEventListener('click', guardarEmpleado);
  document.getElementById('searchEmpleado').addEventListener('input', renderEmpleados);
}

function guardarEmpleado() {
  const nombre = document.getElementById('empNombre').value.trim();
  const apellido = document.getElementById('empApellido').value.trim();
  const cedula = document.getElementById('empCedula').value.trim();
  const seccion = document.getElementById('empSeccion').value;
  const unidad = document.getElementById('empUnidad').value;
  const unidades = parseInt(document.getElementById('empUnidades').value) || 0;

  if (!nombre || !apellido || !cedula) {
    showToast('⚠️ Nombre, apellido y cédula son obligatorios');
    return;
  }

  if (state.editingEmpleado !== null) {
    const idx = state.empleados.findIndex(e => e.id === state.editingEmpleado);
    if (idx !== -1) state.empleados[idx] = { ...state.empleados[idx], nombre, apellido, cedula, seccion, unidad, unidades };
    showToast('✅ Empleado actualizado');
  } else {
    const existe = state.empleados.find(e => e.cedula === cedula);
    if (existe) { showToast('⚠️ Ya existe un empleado con esa cédula'); return; }
    state.empleados.push({ id: Date.now(), nombre, apellido, cedula, seccion, unidad, unidades });
    showToast('✅ Empleado registrado');
  }

  clearEmpleadoForm();
  document.getElementById('formEmpleado').style.display = 'none';
  renderEmpleados();
  updateDashboard();
}

function clearEmpleadoForm() {
  ['empNombre','empApellido','empCedula','empUnidades'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('empSeccion').value = '';
  document.getElementById('empUnidad').value = 'Sacos';
  state.editingEmpleado = null;
}

function editarEmpleado(id) {
  const emp = state.empleados.find(e => e.id === id);
  if (!emp) return;
  state.editingEmpleado = id;
  document.getElementById('empNombre').value = emp.nombre;
  document.getElementById('empApellido').value = emp.apellido;
  document.getElementById('empCedula').value = emp.cedula;
  document.getElementById('empSeccion').value = emp.seccion;
  document.getElementById('empUnidad').value = emp.unidad;
  document.getElementById('empUnidades').value = emp.unidades;
  document.getElementById('formEmpleadoTitle').textContent = 'Editar Empleado';
  document.getElementById('formEmpleado').style.display = 'block';
  document.getElementById('section-empleados').scrollTo(0, 0);
}

function eliminarEmpleado(id) {
  state.empleados = state.empleados.filter(e => e.id !== id);
  renderEmpleados();
  updateDashboard();
  showToast('🗑️ Empleado eliminado');
}

function renderEmpleados() {
  const query = document.getElementById('searchEmpleado').value.toLowerCase();
  const filtered = state.empleados.filter(e =>
    e.nombre.toLowerCase().includes(query) ||
    e.apellido.toLowerCase().includes(query) ||
    e.cedula.includes(query)
  );
  const tbody = document.getElementById('empleadosTableBody');
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row">Sin empleados registrados</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map(e => `
    <tr>
      <td>${e.nombre}</td>
      <td>${e.apellido}</td>
      <td>${e.cedula}</td>
      <td>${e.seccion || '—'}</td>
      <td>${e.unidad}</td>
      <td>${e.unidades}</td>
      <td>
        <button class="btn btn-edit" onclick="editarEmpleado(${e.id})">Editar</button>
        <button class="btn btn-danger" onclick="eliminarEmpleado(${e.id})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// ============================================================
// INVENTARIO
// ============================================================
function setupInventario() {
  document.getElementById('btnNuevoItem').addEventListener('click', () => {
    state.editingItem = null;
    document.getElementById('formInventarioTitle').textContent = 'Registrar Ítem';
    clearItemForm();
    document.getElementById('formInventario').style.display = 'block';
  });
  document.getElementById('btnCancelarItem').addEventListener('click', () => {
    document.getElementById('formInventario').style.display = 'none';
    clearItemForm();
  });
  document.getElementById('btnGuardarItem').addEventListener('click', guardarItem);
  document.getElementById('searchInventario').addEventListener('input', renderInventario);
}

function guardarItem() {
  const nombre = document.getElementById('invNombre').value.trim();
  const categoria = document.getElementById('invCategoria').value;
  const seccion = document.getElementById('invSeccion').value;
  const cantidad = parseInt(document.getElementById('invCantidad').value) || 0;
  const unidad = document.getElementById('invUnidad').value;
  const minimo = parseInt(document.getElementById('invMinimo').value) || 0;

  if (!nombre) { showToast('⚠️ El nombre del ítem es obligatorio'); return; }

  if (state.editingItem !== null) {
    const idx = state.inventario.findIndex(i => i.id === state.editingItem);
    if (idx !== -1) state.inventario[idx] = { ...state.inventario[idx], nombre, categoria, seccion, cantidad, unidad, minimo };
    showToast('✅ Ítem actualizado');
  } else {
    state.inventario.push({ id: Date.now(), nombre, categoria, seccion, cantidad, unidad, minimo });
    showToast('✅ Ítem registrado');
  }

  clearItemForm();
  document.getElementById('formInventario').style.display = 'none';
  renderInventario();
  updateDashboard();
}

function clearItemForm() {
  ['invNombre','invCantidad','invMinimo'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('invSeccion').value = '';
  document.getElementById('invCategoria').value = 'Materia Prima';
  document.getElementById('invUnidad').value = 'unidades';
  state.editingItem = null;
}

function editarItem(id) {
  const item = state.inventario.find(i => i.id === id);
  if (!item) return;
  state.editingItem = id;
  document.getElementById('invNombre').value = item.nombre;
  document.getElementById('invCategoria').value = item.categoria;
  document.getElementById('invSeccion').value = item.seccion;
  document.getElementById('invCantidad').value = item.cantidad;
  document.getElementById('invUnidad').value = item.unidad;
  document.getElementById('invMinimo').value = item.minimo;
  document.getElementById('formInventarioTitle').textContent = 'Editar Ítem';
  document.getElementById('formInventario').style.display = 'block';
}

function eliminarItem(id) {
  state.inventario = state.inventario.filter(i => i.id !== id);
  renderInventario();
  updateDashboard();
  showToast('🗑️ Ítem eliminado');
}

function getEstado(item) {
  if (item.cantidad === 0) return '<span class="badge badge-danger">Sin stock</span>';
  if (item.cantidad <= item.minimo) return '<span class="badge badge-warn">Stock bajo</span>';
  return '<span class="badge badge-ok">OK</span>';
}

function renderInventario() {
  const query = document.getElementById('searchInventario').value.toLowerCase();
  const filtered = state.inventario.filter(i =>
    i.nombre.toLowerCase().includes(query) ||
    i.categoria.toLowerCase().includes(query)
  );
  const tbody = document.getElementById('inventarioTableBody');
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row">Sin ítems registrados</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map(i => `
    <tr>
      <td>${i.nombre}</td>
      <td>${i.categoria}</td>
      <td>${i.seccion || '—'}</td>
      <td>${i.cantidad}</td>
      <td>${i.unidad}</td>
      <td>${getEstado(i)}</td>
      <td>
        <button class="btn btn-edit" onclick="editarItem(${i.id})">Editar</button>
        <button class="btn btn-danger" onclick="eliminarItem(${i.id})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// ============================================================
// DASHBOARD
// ============================================================
function updateDashboard() {
  // KPIs
  document.getElementById('kpi-empleados').textContent = state.empleados.length;
  document.getElementById('kpi-items').textContent = state.inventario.length;
  const totalUnidades = state.empleados.reduce((s, e) => s + e.unidades, 0);
  document.getElementById('kpi-unidades').textContent = totalUnidades;
  const stockBajo = state.inventario.filter(i => i.cantidad <= i.minimo && i.minimo > 0).length;
  document.getElementById('kpi-bajo').textContent = stockBajo;

  // Dashboard table
  const tbody = document.getElementById('dashboardTableBody');
  const recent = [...state.empleados].slice(-5).reverse();
  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-row">Sin datos aún</td></tr>';
  } else {
    tbody.innerHTML = recent.map(e => `
      <tr>
        <td>${e.nombre} ${e.apellido}</td>
        <td>${e.cedula}</td>
        <td>${e.seccion || '—'}</td>
        <td>${e.unidades}</td>
      </tr>
    `).join('');
  }

  renderBarChart();
  renderDonutChart();
}

function renderBarChart() {
  const container = document.getElementById('barChart');
  // Agrupar unidades por tipo
  const map = {};
  state.empleados.forEach(e => {
    map[e.unidad] = (map[e.unidad] || 0) + e.unidades;
  });
  const keys = Object.keys(map);
  if (keys.length === 0) {
    container.innerHTML = '<div style="color:var(--text2);font-size:0.85rem;margin:auto">Sin datos de producción</div>';
    return;
  }
  const max = Math.max(...Object.values(map), 1);
  container.innerHTML = keys.map((k, i) => {
    const pct = Math.round((map[k] / max) * 100);
    return `
      <div class="bar-wrap">
        <span class="bar-val">${map[k]}</span>
        <div class="bar" style="height:${pct}%;background:${COLORS[i % COLORS.length]}"></div>
        <span class="bar-label">${k}</span>
      </div>
    `;
  }).join('');
}

function renderDonutChart() {
  const svg = document.getElementById('donutSVG');
  const legend = document.getElementById('donutLegend');

  // Agrupar inventario por sección
  const map = {};
  state.inventario.forEach(i => {
    const key = i.seccion || 'Sin sección';
    map[key] = (map[key] || 0) + i.cantidad;
  });

  const keys = Object.keys(map);
  if (keys.length === 0) {
    svg.innerHTML = '<circle cx="60" cy="60" r="45" fill="none" stroke="#2e3350" stroke-width="18"/>';
    legend.innerHTML = '<span style="color:var(--text2);font-size:0.78rem">Sin datos</span>';
    return;
  }

  const total = Object.values(map).reduce((a, b) => a + b, 0);
  let angle = -90;
  let paths = '';

  keys.forEach((key, i) => {
    const pct = map[key] / total;
    const endAngle = angle + pct * 360;
    const r = 45, cx = 60, cy = 60;
    const toRad = a => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(angle));
    const y1 = cy + r * Math.sin(toRad(angle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const large = pct > 0.5 ? 1 : 0;
    const color = COLORS[i % COLORS.length];
    paths += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z" fill="${color}" opacity="0.9"/>`;
    angle = endAngle;
  });

  // Center hole
  paths += `<circle cx="60" cy="60" r="28" fill="var(--bg2)"/>`;
  svg.innerHTML = paths;

  legend.innerHTML = keys.map((k, i) => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${COLORS[i % COLORS.length]}"></div>
      <span>${k}: ${map[k]}</span>
    </div>
  `).join('');
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}