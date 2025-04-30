Explicación:
Desarrollo del Sistema de Gestión de Biblioteca

Introducción

Objetivos del Proyecto

Mi objetivo principal fue crear una aplicación que permita:
- Agregar nuevos libros a un catálogo
- Editar la información de libros existentes
- Eliminar libros del catálogo
- Filtrar libros por categorías
- Persistir los datos usando IndexedDB

Estructura del Proyecto

La aplicación está construida en un único archivo HTML que contiene:
- Estructura HTML de la página
- Estilos CSS para el diseño
- JavaScript para la lógica y funcionalidad

Paleta de Colores Utilizada

Implemente una paleta de colores específica para dar coherencia visual al diseño:
- #352824: Color principal para textos (marrón oscuro)
- #C0A07F: Color secundario (beige/marrón claro) para elementos de acento
- #D5CEC6: Color de fondo (beige claro)
- #A0C5DF: Color de acento (azul claro)
- #7E97AA: Color para botones y elementos interactivos (azul grisáceo)

Componentes Principales

1. Interfaz de Usuario

La interfaz se divide en tres secciones principales:

Formulario de Entrada:
- Permite al usuario ingresar información de un nuevo libro
- Incluye campos validados para título, autor, categoría y descripción
- Muestra mensajes de éxito o error

Panel de Filtros:
- Botones para filtrar libros por categoría
- Diseño responsivo que se adapta a diferentes tamaños de pantalla

Galería de Libros:
- Muestra los libros como "tarjetas" en un diseño de rejilla
- Cada tarjeta incluye título, autor, categoría, descripción
- Botones para editar o eliminar cada libro

Modal de Edición:
- Se abre al hacer clic en el botón de editar
- Permite modificar los datos de un libro existente
- Se cierra al guardar cambios, cancelar o hacer clic fuera del modal

2. Base de Datos IndexedDB

IndexedDB almacenapersistentemente los datos de la biblioteca:

Inicialización:
- Nombre de la base de datos: 'BibliotecaDB'
- Versión: 1
- Almacén de objetos: 'libros'
- Índices creados para facilitar búsquedas: por título, autor y categoría

Datos iniciales:
- Se cargan libros de ejemplo al iniciar la aplicación por primera vez
- Se utilizan transacciones para asegurar la consistencia de los datos

Funciones Principales del JavaScript

Gestión de Base de Datos
- cargarDatosIniciales(): Verifica si la base de datos está vacía y carga datos iniciales
- agregarLibro(): Añade un nuevo libro a IndexedDB
- actualizarLibro(): Modifica un libro existente
- eliminarLibro(): Elimina un libro de la base de datos
- cargarLibros(): Obtiene todos los libros o filtrados por categoría

Manipulación del DOM
- mostrarLibros(): Crea dinámicamente las tarjetas para cada libro
- abrirModalEdicion(): Muestra el modal y carga los datos del libro a editar
- cerrarModal(): Oculta el modal de edición y limpia el formulario
- mostrarMensaje(): Muestra mensajes temporales de éxito o error
