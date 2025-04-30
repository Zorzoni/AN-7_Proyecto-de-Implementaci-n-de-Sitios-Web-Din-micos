   // Inicializamos la base de datos IndexedDB
   let db;
   const dbName = 'BibliotecaDB';
   const dbVersion = 1;
   
   // Datos de muestra
   const librosIniciales = [
       {
           titulo: "Cien años de soledad",
           autor: "Gabriel García Márquez",
           categoria: "Ficción",
           descripcion: "La historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo."
       },
       {
           titulo: "Breve historia del tiempo",
           autor: "Stephen Hawking",
           categoria: "Ciencia",
           descripcion: "Un libro de divulgación que trata sobre cosmología y el espacio-tiempo."
       },
       {
           titulo: "Sapiens: De animales a dioses",
           autor: "Yuval Noah Harari",
           categoria: "Historia",
           descripcion: "Una breve historia de la humanidad, desde la aparición del homo sapiens hasta la actualidad."
       },
       {
           titulo: "El código limpio",
           autor: "Robert C. Martin",
           categoria: "Tecnología",
           descripcion: "Un libro sobre cómo escribir código limpio y mantenible."
       },
       {
           titulo: "El mundo como voluntad y representación",
           autor: "Arthur Schopenhauer",
           categoria: "Filosofía",
           descripcion: "Una de las obras más importantes de la filosofía del siglo XIX."
       }
   ];
   
   // Elementos del DOM
   const formLibro = document.getElementById('form-libro');
   const librosContainer = document.getElementById('libros');
   const formMessages = document.getElementById('form-messages');
   const categoryButtons = document.querySelectorAll('.category-btn');
   const editModal = document.getElementById('edit-modal');
   const editForm = document.getElementById('edit-form');
   const closeModalButtons = document.querySelectorAll('.close-modal');
   
   // Inicializar la base de datos
   const request = indexedDB.open(dbName, dbVersion);
   
   request.onupgradeneeded = function(event) {
       const db = event.target.result;
       
       // Crear un almacén de objetos para los libros
       if (!db.objectStoreNames.contains('libros')) {
           const librosStore = db.createObjectStore('libros', { keyPath: 'id', autoIncrement: true });
           
           // Crear índices para búsquedas
           librosStore.createIndex('por_titulo', 'titulo', { unique: false });
           librosStore.createIndex('por_autor', 'autor', { unique: false });
           librosStore.createIndex('por_categoria', 'categoria', { unique: false });
       }
   };
   
   request.onsuccess = function(event) {
       db = event.target.result;
       console.log('Base de datos IndexedDB inicializada correctamente');
       
       // Cargar datos iniciales si la base de datos está vacía
       cargarDatosIniciales();
       
       // Cargar libros al cargar la página
       cargarLibros();
   };
   
   request.onerror = function(event) {
       console.error('Error al abrir la base de datos IndexedDB:', event.target.error);
       mostrarMensaje('Error al inicializar la base de datos', true);
   };
   
   // Función para cargar datos iniciales si está vacía
   function cargarDatosIniciales() {
       const transaction = db.transaction(['libros'], 'readonly');
       const librosStore = transaction.objectStore('libros');
       const countRequest = librosStore.count();
       
       countRequest.onsuccess = function() {
           if (countRequest.result === 0) {
               console.log('La base de datos está vacía, cargando datos iniciales...');
               
               const addTransaction = db.transaction(['libros'], 'readwrite');
               const addStore = addTransaction.objectStore('libros');
               
               librosIniciales.forEach(libro => {
                   addStore.add(libro);
               });
               
               addTransaction.oncomplete = function() {
                   console.log('Datos iniciales cargados correctamente');
                   cargarLibros();
               };
           }
       };
   }
   
   // Función para agregar un libro a la base de datos
   function agregarLibro(libro) {
       const transaction = db.transaction(['libros'], 'readwrite');
       const librosStore = transaction.objectStore('libros');
       
       const request = librosStore.add(libro);
       
       request.onsuccess = function() {
           console.log('Libro agregado correctamente a la base de datos');
           mostrarMensaje('¡Libro agregado correctamente!', false);
           formLibro.reset();
           cargarLibros();
       };
       
       request.onerror = function(event) {
           console.error('Error al agregar libro:', event.target.error);
           mostrarMensaje('Error al agregar el libro a la base de datos', true);
       };
   }
   
   // Función para actualizar un libro existente
   function actualizarLibro(id, libroActualizado) {
       const transaction = db.transaction(['libros'], 'readwrite');
       const librosStore = transaction.objectStore('libros');
       
       // Obtener el libro actual para mantener otros campos que no se actualizan
       const getRequest = librosStore.get(parseInt(id));
       
       getRequest.onsuccess = function(event) {
           const libro = event.target.result;
           
           // Actualizar solo los campos proporcionados
           libro.titulo = libroActualizado.titulo;
           libro.autor = libroActualizado.autor;
           libro.categoria = libroActualizado.categoria;
           libro.descripcion = libroActualizado.descripcion;
           
           // Guardar el libro actualizado
           const updateRequest = librosStore.put(libro);
           
           updateRequest.onsuccess = function() {
               console.log('Libro actualizado correctamente');
               mostrarMensaje('¡Libro actualizado correctamente!', false);
               cerrarModal();
               cargarLibros();
           };
           
           updateRequest.onerror = function(event) {
               console.error('Error al actualizar libro:', event.target.error);
               mostrarMensaje('Error al actualizar el libro', true);
           };
       };
   }
   
   // Función para eliminar un libro
   function eliminarLibro(id) {
       if (confirm('¿Estás seguro de que deseas eliminar este libro?')) {
           const transaction = db.transaction(['libros'], 'readwrite');
           const librosStore = transaction.objectStore('libros');
           
           const request = librosStore.delete(parseInt(id));
           
           request.onsuccess = function() {
               console.log('Libro eliminado correctamente');
               mostrarMensaje('Libro eliminado correctamente', false);
               cargarLibros();
           };
           
           request.onerror = function(event) {
               console.error('Error al eliminar libro:', event.target.error);
               mostrarMensaje('Error al eliminar el libro', true);
           };
       }
   }
   
   // Función para cargar todos los libros de la base de datos
   function cargarLibros(categoria = 'todos') {
       const transaction = db.transaction(['libros'], 'readonly');
       const librosStore = transaction.objectStore('libros');
       
       const request = librosStore.openCursor();
       const libros = [];
       
       request.onsuccess = function(event) {
           const cursor = event.target.result;
           
           if (cursor) {
               // Si hay filtro por categoría, solo incluir los de esa categoría
               if (categoria === 'todos' || cursor.value.categoria === categoria) {
                   libros.push(cursor.value);
               }
               cursor.continue();
           } else {
               // Ya no hay más libros, mostrarlos en el DOM
               mostrarLibros(libros);
           }
       };
       
       request.onerror = function(event) {
           console.error('Error al cargar libros:', event.target.error);
           mostrarMensaje('Error al cargar los libros', true);
       };
   }
   
   // Función para mostrar libros en el DOM
   function mostrarLibros(libros) {
       // Limpiar el contenedor
       librosContainer.innerHTML = '';
       
       if (libros.length === 0) {
           const noLibros = document.createElement('p');
           noLibros.textContent = 'No hay libros disponibles en esta categoría.';
           librosContainer.appendChild(noLibros);
           return;
       }
       
       // Crear tarjeta para cada libro
       libros.forEach(libro => {
           const libroCard = document.createElement('div');
           libroCard.classList.add('libro-card');
           libroCard.dataset.id = libro.id;
           
           const titulo = document.createElement('h3');
           titulo.classList.add('libro-titulo');
           titulo.textContent = libro.titulo;
           
           const autor = document.createElement('p');
           autor.classList.add('libro-autor');
           autor.textContent = `Por: ${libro.autor}`;
           
           const categoria = document.createElement('span');
           categoria.classList.add('libro-categoria');
           categoria.textContent = libro.categoria;
           
           const descripcion = document.createElement('p');
           descripcion.classList.add('libro-descripcion');
           descripcion.textContent = libro.descripcion;
           
           libroCard.appendChild(titulo);
           libroCard.appendChild(autor);
           libroCard.appendChild(categoria);
           libroCard.appendChild(descripcion);
           
           // Agregar botones de acción (editar y eliminar)
           const libroActions = document.createElement('div');
           libroActions.classList.add('libro-actions');
           
           const editBtn = document.createElement('button');
           editBtn.classList.add('btn-edit');
           editBtn.textContent = '✎ Editar';
           editBtn.addEventListener('click', function() {
               abrirModalEdicion(libro);
           });
           
           const deleteBtn = document.createElement('button');
           deleteBtn.classList.add('btn-delete');
           deleteBtn.textContent = '✖ Eliminar';
           deleteBtn.addEventListener('click', function() {
               eliminarLibro(libro.id);
           });
           
           libroActions.appendChild(editBtn);
           libroActions.appendChild(deleteBtn);
           libroCard.appendChild(libroActions);
           
           librosContainer.appendChild(libroCard);
       });
   }
   
   // Función para abrir el modal de edición y cargar los datos del libro
   function abrirModalEdicion(libro) {
       // Cargar los datos del libro en el formulario de edición
       document.getElementById('edit-id').value = libro.id;
       document.getElementById('edit-titulo').value = libro.titulo;
       document.getElementById('edit-autor').value = libro.autor;
       document.getElementById('edit-categoria').value = libro.categoria;
       document.getElementById('edit-descripcion').value = libro.descripcion;
       
       // Mostrar el modal
       editModal.style.display = 'flex';
   }
   
   // Función para cerrar el modal
   function cerrarModal() {
       editModal.style.display = 'none';
       editForm.reset();
   }
   
   // Función para mostrar mensajes de éxito o error
   function mostrarMensaje(mensaje, esError = false) {
       formMessages.innerHTML = '';
       
       const msgElement = document.createElement('p');
       msgElement.textContent = mensaje;
       msgElement.classList.add(esError ? 'error-msg' : 'success-msg');
       
       formMessages.appendChild(msgElement);
       
       // Limpiar mensaje después de 3 segundos
       setTimeout(() => {
           formMessages.innerHTML = '';
       }, 3000);
   }
   
   // Event Listeners
   
   // Envío del formulario para agregar libro
   formLibro.addEventListener('submit', function(e) {
       e.preventDefault();
       
       const nuevoLibro = {
           titulo: document.getElementById('titulo').value.trim(),
           autor: document.getElementById('autor').value.trim(),
           categoria: document.getElementById('categoria').value,
           descripcion: document.getElementById('descripcion').value.trim()
       };
       
       // Validaciones básicas
       if (!nuevoLibro.titulo || !nuevoLibro.autor || !nuevoLibro.categoria) {
           mostrarMensaje('Por favor complete todos los campos obligatorios', true);
           return;
       }
       
       agregarLibro(nuevoLibro);
   });
   
   // Filtrado por categoría
   categoryButtons.forEach(button => {
       button.addEventListener('click', function() {
           // Actualizar botones activos
           categoryButtons.forEach(btn => btn.classList.remove('active'));
           this.classList.add('active');
           
           // Filtrar libros
           const categoria = this.dataset.categoria;
           cargarLibros(categoria);
       });
   });
   
   // Envío del formulario de edición
   editForm.addEventListener('submit', function(e) {
       e.preventDefault();
       
       const id = document.getElementById('edit-id').value;
       const libroActualizado = {
           titulo: document.getElementById('edit-titulo').value.trim(),
           autor: document.getElementById('edit-autor').value.trim(),
           categoria: document.getElementById('edit-categoria').value,
           descripcion: document.getElementById('edit-descripcion').value.trim()
       };
       
       // Validaciones básicas
       if (!libroActualizado.titulo || !libroActualizado.autor || !libroActualizado.categoria) {
           mostrarMensaje('Por favor complete todos los campos obligatorios', true);
           return;
       }
       
       actualizarLibro(id, libroActualizado);
   });
   
   // Cerrar modal
   closeModalButtons.forEach(button => {
       button.addEventListener('click', cerrarModal);
   });
   
   // Cerrar modal al hacer clic fuera de él
   window.addEventListener('click', function(event) {
       if (event.target === editModal) {
           cerrarModal();
       }
   });