let DB;

// Selectores
const paciente = document.querySelector('#paciente');
const propietario = document.querySelector('#propietario');
const email = document.querySelector('#email');
const fecha = document.querySelector('#fecha');
const sintomas = document.querySelector('#sintomas');
const numero = document.querySelector('#numero');

const formulario = document.querySelector('#formulario-cita');
const formularioInput = document.querySelector('#formulario-cita input[type="submit"]');
const contenedorCitas = document.querySelector('#citas');

const btnEditar = document.querySelector('.btn-editar');

// Events
function eventsListeners() {
    paciente.addEventListener('change', datosCita);
    propietario.addEventListener('change', datosCita);
    numero.addEventListener('change', datosCita);
    email.addEventListener('change', datosCita);
    fecha.addEventListener('change', datosCita);
    sintomas.addEventListener('change', datosCita);

    formulario.addEventListener('submit', validarCampos);
}

let editando = false;

window.onload = () => {
    eventsListeners();

    crearDB();
}

// Objeto de cita
const citaObj = {
    id: generarId(),
    paciente: '',
    propietario: '',
    numero: '',
    email: '',
    fecha: '',
    sintomas: ''
};


// Classes

class Notificacion {

    constructor({ texto, tipo }) {
        this.texto = texto;
        this.tipo = tipo;

        this.mostrar();
    }

    mostrar() {
        // Crear la notificacion
        const alerta = document.createElement('div');
        alerta.classList.add('text-center', 'w-full', 'p-3', 'text-white', 'my-5', 'alert', 'uppercase', 'font-bold', 'text-sm');

        // Eliminar alertas duplicadas
        const alertaPrevia = document.querySelector('.alert');
        // if(alertaPrevia) {
        //     alertaPrevia.remove();
        // }

        // Otra forma de hacer lo optional chaining (encadenamiento opcional) 
        alertaPrevia?.remove(); // Esto significa que si es verdadero lo del lado izquierdo, que se ejecute lo del lado derecho y sino, que no se ejecute nada

        // Si es de tipo error agrega una clase
        this.tipo === 'error' ? alerta.classList.add('bg-red-500') : alerta.classList.add('bg-green-500'); // Si se cumple lo primero '?' se traduce como 'entonces' y ':' => si no se cumple entonces esto, esto es un TERNARIO

        // Mensaje de error
        alerta.textContent = this.texto;

        // Insertar en el DOM
        formulario.parentElement.insertBefore(alerta, formulario);

        // Quitar la alerta
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }

}

class AdminCitas {

    constructor() {
        this.citas = [];
    }

    agregar(cita) {
        this.citas = [...this.citas, cita];
        this.mostrar();
    }

    editar(citaActualizada) {
        this.citas = this.citas.map(cita => cita.id === citaActualizada.id ? citaActualizada : cita); // Foreach solo iterea, pero el map podemos modificarlo y nos regresa un arreglo nuevo
        this.mostrar();
    }

    mostrar() {

        // Limpiar el HTML previo
        while (contenedorCitas.firstChild) {
            contenedorCitas.removeChild(contenedorCitas.firstChild);
        }

        // Leer el contenido de la DB
        const objectStore = DB.transaction('citas').objectStore('citas');

        // Verificar cuántos registros existen
        const totalCitas = objectStore.count();

        objectStore.openCursor().onsuccess = function (e) {

            if (totalCitas.result === 0) {
                // No hay citas, mostrar mensaje
                contenedorCitas.innerHTML = '<p class="text-xl mt-5 mb-10 text-center">No Hay Pacientes</p>';
                return;
            }

            const cursor = e.target.result;

            if (cursor) {
                console.log(cursor.value);
                const { paciente, propietario, numero, email, fecha, sintomas, id } = cursor.value;

                const divCita = document.createElement('div');
                divCita.classList.add('mx-5', 'my-10', 'bg-white', 'shadow-md', 'px-5', 'py-10', 'rounded-xl', 'p-3');
                divCita.dataset.id = id;

                const pacienteP = document.createElement('p');
                pacienteP.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case')
                pacienteP.innerHTML = `<span class="font-bold uppercase">Paciente: </span> ${paciente}`;

                const propietarioP = document.createElement('p');
                propietarioP.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case')
                propietarioP.innerHTML = `<span class="font-bold uppercase">Propietario: </span> ${propietario}`;

                const numeroP = document.createElement('p');
                numeroP.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case');
                numeroP.innerHTML = `<span class="font-bold uppercase">Propietario: </span> ${numero}`;

                const emailP = document.createElement('p');
                emailP.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case')
                emailP.innerHTML = `<span class="font-bold uppercase">E-mail: </span> ${email}`;

                const fechaP = document.createElement('p');
                fechaP.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case')
                fechaP.innerHTML = `<span class="font-bold uppercase">Fecha: </span> ${fecha}`;

                const sintomasP = document.createElement('p');
                sintomasP.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case')
                sintomasP.innerHTML = `<span class="font-bold uppercase">Síntomas: </span> ${sintomas}`;

                // Botones de editar y eliminar

                const btnEditar = document.createElement('button');
                btnEditar.classList.add('py-2', 'px-10', 'bg-indigo-600', 'hover:bg-indigo-700', 'text-white', 'font-bold', 'uppercase', 'rounded-lg', 'flex', 'items-center', 'gap-2', 'btn-editar');
                btnEditar.innerHTML = 'Editar <svg fill="none" class="h-5 w-5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>';
                // Event handlers
                // const clon = {...cita};
                // const clon = structuredClone(cita);
                const cita = cursor.value;
                btnEditar.onclick = () => {
                    cargarEdicion(cita);
                }

                const btnEliminar = document.createElement('button');
                btnEliminar.classList.add('py-2', 'px-10', 'bg-red-600', 'hover:bg-red-700', 'text-white', 'font-bold', 'uppercase', 'rounded-lg', 'flex', 'items-center', 'gap-2');
                btnEliminar.innerHTML = 'Eliminar <svg fill="none" class="h-5 w-5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
                btnEliminar.onclick = () => eliminar(id);

                const contendorBotones = document.createElement('div');
                contendorBotones.classList.add('flex', 'justify-between', 'mt-10');

                contendorBotones.appendChild(btnEditar);
                contendorBotones.appendChild(btnEliminar);

                // Agregar al HTML
                divCita.appendChild(pacienteP);
                divCita.appendChild(propietarioP);
                divCita.appendChild(numeroP);
                divCita.appendChild(emailP);
                divCita.appendChild(fechaP);
                divCita.appendChild(sintomasP);
                divCita.appendChild(contendorBotones);
                contenedorCitas.appendChild(divCita);

                // Ve al siguiente elemento
                cursor.continue();
            }

        }

    }
}


// Functions 
function datosCita(e) {
    citaObj[e.target.name] = e.target.value;
}

const citas = new AdminCitas();

function validarCampos(e) {
    e.preventDefault();

    // if(Object.values(citaObj).some(value => value.trim() === '')) {

    //     console.log('Todos los campos son obligatorios');
    //     return;

    // }

    const { paciente, propietario, numero, email, fecha, sintomas } = citaObj;

    if (paciente.trim() === '' || propietario.trim() === '', numero.trim() === '', email.trim() === '', fecha.trim() === '' || sintomas.trim() === '') {

        new Notificacion({
            texto: 'Todos los campos son obligatorios',
            tipo: 'error'
        });
        return;
    }

    if (editando) {
        citas.editar({ ...citaObj });

        // Edita en IndexDB
        const transaction = DB.transaction(['citas'], 'readwrite');
        const objectStore = transaction.objectStore('citas');

        objectStore.put(citaObj);

        transaction.oncomplete = () => {
            new Notificacion({
                texto: 'Paciente actualizado con exito',
                tipo: 'success'
            });
        }

        transaction.onerror = () => {
            console.log('Hubo un error al editar');
        }


    } else {
        citas.agregar({ ...citaObj });

        // Insertar registro en IndexDB
        const transaction = DB.transaction(['citas'], 'readwrite');

        // Habilitar el objectStore
        const objectStore = transaction.objectStore('citas');

        // Insertar en la DB
        objectStore.add(citaObj);

        transaction.oncomplete = function () {

            new Notificacion({
                texto: 'Paciente registrado con exito',
                tipo: 'success'
            });
        }

    }

    formulario.reset();
    reiniciarObjetoCita();
    formularioInput.value = 'Registrar paciente';
    editando = false;
}

function reiniciarObjetoCita() {
    // Reiniciar el objeto
    // citaObj.id = generarId();
    // citaObj.paciente = '';
    // citaObj.propietario = '';
    // citaObj.email = '';
    // citaObj.fecha = '';
    // citaObj.sintomas = '';

    // Esta es otra forma de reiniciar un objeto

    Object.assign(citaObj, {
        id: generarId(),
        paciente: '',
        propietario: '',
        numero: '',
        email: '',
        fecha: '',
        sintomas: ''
    })
}

function generarId() {
    return Math.random().toString(36).substring(2) + Date.now();
}

function cargarEdicion(cita) {

    Object.assign(citaObj, cita);

    paciente.value = cita.paciente;
    propietario.value = cita.propietario;
    numero.value = cita.numero;
    email.value = cita.email;
    fecha.value = cita.fecha;
    sintomas.value = cita.sintomas;

    editando = true;

    formularioInput.value = 'Editar paciente';
}

function eliminar(id) {
    // this.citas = this.citas.filter(cita => cita.id !== id);

    const transaction = DB.transaction(['citas'], 'readwrite');
    const objectStore = transaction.objectStore('citas');

    objectStore.delete(id);

    transaction.oncomplete = () => {
        console.log(`Cita ${id} eliminada...`);
    
        citas.mostrar();
    }

    transaction.onerror = () => {
        console.log('Hubo un error al eliminar el paciente');
    }

}


function crearDB() {
    // Crear la base de datos version 1.0
    const crearDB = window.indexedDB.open('citas', 1);

    // Si hay un error
    crearDB.onerror = function () {
        console.log('Hubo un error');
    }

    // Si todo sale bien
    crearDB.onsuccess = function () {
        console.log('Base de datos creada');

        DB = crearDB.result;

        citas.mostrar();
    }

    // Definir el esquema
    crearDB.onupgradeneeded = function (e) {
        const db = e.target.result;

        const objectStore = db.createObjectStore('citas', {
            keyPath: 'id',
            autoincrement: true
        })

        // Definir todas la columnas
        objectStore.createIndex('id', 'id', { unique: true });
        objectStore.createIndex('paciente', 'paciente', { unique: false });
        objectStore.createIndex('propietario', 'propietario', { unique: false });
        objectStore.createIndex('numero', 'numero', { unique: false });
        objectStore.createIndex('email', 'email', { unique: false });
        objectStore.createIndex('fecha', 'fecha', { unique: false });
        objectStore.createIndex('sintomas', 'sintomas', { unique: false });

        console.log('DB creada y lista');
    }
}