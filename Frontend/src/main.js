import './style.css'

const API = 'http://localhost:3000';

const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const tablaUsuarios = document.getElementById('tabla-usuarios-body');
const tablaMaterias = document.getElementById('tabla-materias-body');

// --- LOGIN ---
document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const cedula = document.getElementById('login-cedula').value;
  const clave = document.getElementById('login-clave').value;

  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cedula, clave })
    });
    const data = await res.json();

    if (res.ok) {
      // Alerta bonita de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: `Hola, ${data.usuario.nombre}`,
        timer: 1500,
        showConfirmButton: false
      });

      document.getElementById('usuario-logueado').innerText = data.usuario.nombre;
      loginSection.classList.add('oculto');
      loginSection.classList.remove('d-flex'); // Quitar el centrado flex
      dashboardSection.classList.remove('oculto');
      
      cargarUsuarios();
      cargarMaterias();
    } else {
      Swal.fire('Error', data.msg, 'error');
    }
  } catch (error) {
    Swal.fire('Error de Conexión', 'No se pudo conectar al servidor', 'error');
  }
});

document.getElementById('btn-logout').addEventListener('click', () => {
  Swal.fire({
    title: '¿Cerrar sesión?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Sí, salir'
  }).then((result) => {
    if (result.isConfirmed) {
      location.reload();
    }
  });
});

// --- USUARIOS ---
async function cargarUsuarios() {
  const res = await fetch(`${API}/usuarios`);
  const usuarios = await res.json();
  tablaUsuarios.innerHTML = '';
  
  usuarios.forEach(u => {
    tablaUsuarios.innerHTML += `
      <tr>
        <td class="ps-4 fw-bold text-muted">#${u.id}</td>
        <td><span class="badge bg-light text-dark border">${u.cedula}</span></td>
        <td class="fw-semibold">${u.nombre}</td>
        <td class="text-end pe-4">
          <button class="btn btn-sm btn-outline-primary me-1" onclick="prepararEdicionUsuario('${u.id}', '${u.cedula}', '${u.nombre}', '${u.clave}')">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminarUsuario('${u.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

document.getElementById('form-usuario').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('user-id').value;
  const cedula = document.getElementById('user-cedula').value;
  const nombre = document.getElementById('user-nombre').value;
  const clave = document.getElementById('user-clave').value;

  const endpoint = id ? `${API}/usuarios/${id}` : `${API}/usuarios`;
  const metodo = id ? 'PUT' : 'POST';

  await fetch(endpoint, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cedula, nombre, clave })
  });

  Swal.fire('Guardado', 'Usuario procesado correctamente', 'success');
  window.limpiarFormUsuario();
  cargarUsuarios();
});

window.eliminarUsuario = async (id) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "No podrás revertir esto",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Sí, borrar'
  });

  if (result.isConfirmed) {
    await fetch(`${API}/usuarios/${id}`, { method: 'DELETE' });
    Swal.fire('Eliminado', 'El usuario ha sido borrado.', 'success');
    cargarUsuarios();
  }
};

window.prepararEdicionUsuario = (id, cedula, nombre, clave) => {
  document.getElementById('user-id').value = id;
  document.getElementById('user-cedula').value = cedula;
  document.getElementById('user-nombre').value = nombre;
  document.getElementById('user-clave').value = clave;
  document.getElementById('titulo-form-usuario').innerHTML = '<i class="bi bi-pencil-square"></i> Editar Usuario #' + id;
};

// --- MATERIAS ---
async function cargarMaterias() {
  const res = await fetch(`${API}/materias`);
  const materias = await res.json();
  tablaMaterias.innerHTML = '';

  materias.forEach(m => {
    tablaMaterias.innerHTML += `
      <tr>
        <td class="ps-4 fw-bold text-muted">#${m.id}</td>
        <td><span class="badge bg-info bg-opacity-10 text-info border border-info">${m.codigo}</span></td>
        <td class="fw-semibold">${m.nombre}</td>
        <td class="text-end pe-4">
          <button class="btn btn-sm btn-outline-info me-1" onclick="prepararEdicionMateria('${m.id}', '${m.codigo}', '${m.nombre}')">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminarMateria('${m.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

document.getElementById('form-materia').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('materia-id').value;
  const codigo = document.getElementById('materia-codigo').value;
  const nombre = document.getElementById('materia-nombre').value;

  const endpoint = id ? `${API}/materias/${id}` : `${API}/materias`;
  const metodo = id ? 'PUT' : 'POST';

  await fetch(endpoint, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo, nombre })
  });

  Swal.fire('Guardado', 'Materia procesada correctamente', 'success');
  window.limpiarFormMateria();
  cargarMaterias();
});

window.eliminarMateria = async (id) => {
  const result = await Swal.fire({
    title: '¿Borrar Materia?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Sí, borrar'
  });

  if (result.isConfirmed) {
    await fetch(`${API}/materias/${id}`, { method: 'DELETE' });
    Swal.fire('Eliminado', 'La materia ha sido eliminada.', 'success');
    cargarMaterias();
  }
};

window.prepararEdicionMateria = (id, codigo, nombre) => {
  document.getElementById('materia-id').value = id;
  document.getElementById('materia-codigo').value = codigo;
  document.getElementById('materia-nombre').value = nombre;
  document.getElementById('titulo-form-materia').innerHTML = '<i class="bi bi-pencil-square"></i> Editar Materia #' + id;
};