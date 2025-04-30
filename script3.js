// Función para abrir o crear la base de datos
function abrirBaseDeDatos() {
  return new Promise(function(resolve, reject) {
    var request = indexedDB.open("MiBaseDeDatos", 1);

    request.onerror = function(event) {
      reject("Error al abrir la base de datos: " + event.target.errorCode);
    };

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };

    request.onupgradeneeded = function(event) {
      var db = event.target.result;
      if (!db.objectStoreNames.contains("MiAlmacen")) {
        db.createObjectStore("MiAlmacen", { autoIncrement: true });
      }
    };
  });
}

// Función para agregar un objeto al almacén
function agregarObjeto(nombre, edad) {
  abrirBaseDeDatos()
    .then(function(db) {
      var transaction = db.transaction(["MiAlmacen"], "readwrite");
      var store = transaction.objectStore("MiAlmacen");
      var persona = { nombre: nombre, edad: edad };
      return store.add(persona);
    })
    .then(function() {
      console.log("Objeto añadido con éxito");
      mostrarObjetos();
    })
    .catch(function(error) {
      console.error(error);
    });
}

// Función para mostrar los objetos en la página
function mostrarObjetos() {
  abrirBaseDeDatos()
    .then(function(db) {
      var transaction = db.transaction(["MiAlmacen"], "readonly");
      var store = transaction.objectStore("MiAlmacen");
      var requestGetAll = store.getAll();

      requestGetAll.onsuccess = function(event) {
        var personas = event.target.result;
        var output = document.getElementById("output");

        output.innerHTML = "<h2>Personas:</h2>";
        for (var i = 0; i < personas.length; i++) {
          output.innerHTML += "<p>Nombre: " + personas[i].nombre + ", Edad: " + personas[i].edad + "</p>";
        }
      };
    })
    .catch(function(error) {
      console.error(error);
    });
}

// Función para borrar los datos ingresados
function borrarDatos() {
  abrirBaseDeDatos()
    .then(function(db) {
      var transaction = db.transaction(["MiAlmacen"], "readwrite");
      var store = transaction.objectStore("MiAlmacen");
      store.clear();
      mostrarObjetos();
    })
    .catch(function(error) {
      console.error(error);
    });
}

// Manejar el envío del formulario
var form = document.getElementById("form");

form.addEventListener("submit", function(event) {
  event.preventDefault();
  var nombre = document.getElementById("nombre").value;
  var edad = document.getElementById("edad").value;
  agregarObjeto(nombre, edad);
  form.reset();
});

// Agregar botón para borrar datos
var btnBorrar = document.getElementById("btn-borrar");
btnBorrar.addEventListener("click", function(event) {
  event.preventDefault();
  borrarDatos();
});

// Mostrar los objetos al cargar la página
mostrarObjetos();
