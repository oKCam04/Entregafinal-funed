# Academia de Belleza Funed

Una aplicación web moderna para gestión de cursos de belleza y estética, construida con React, Vite y Tailwind CSS.

## 🚀 Características

- **Diseño Responsivo**: Interfaz moderna y adaptable a todos los dispositivos
- **Navegación Intuitiva**: Sistema de rutas con React Router
- **Componentes Reutilizables**: Arquitectura modular y escalable
- **Formularios Interactivos**: Validación y manejo de estado
- **Filtros y Búsqueda**: Funcionalidad avanzada para explorar cursos
- **UI/UX Moderna**: Diseño atractivo con Tailwind CSS
- **Tema de Belleza**: Colores y estilos apropiados para una academia de belleza

## 📋 Páginas Incluidas

1. **Inicio**: Landing page con información de la academia
2. **Cursos**: Catálogo de cursos de belleza con filtros y búsqueda
3. **Sobre Nosotros**: Información de la academia y equipo
4. **Contacto**: Formulario de contacto e información de contacto

## 🛠️ Tecnologías Utilizadas

- **React 19**: Biblioteca de JavaScript para interfaces de usuario
- **Vite**: Herramienta de construcción rápida
- **React Router**: Navegación entre páginas
- **Tailwind CSS**: Framework de CSS utilitario
- **ESLint**: Linting de código JavaScript

## 📦 Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd funed-fronted
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**:
   ```
   http://localhost:5173
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Navbar.jsx      # Barra de navegación
│   ├── Footer.jsx      # Pie de página
│   ├── Card.jsx        # Componente de tarjeta
│   └── Button.jsx      # Componente de botón
├── pages/              # Páginas de la aplicación
│   ├── home.jsx        # Página de inicio
│   ├── CursosPage.jsx  # Página de cursos
│   ├── SobreNosotrosPage.jsx # Página sobre nosotros
│   └── ContactoPage.jsx # Página de contacto
├── App.jsx             # Componente principal
├── main.jsx            # Punto de entrada
└── index.css           # Estilos globales
```

## 🎨 Componentes Principales

### Navbar
Barra de navegación con enlaces a todas las páginas de la aplicación, con tema rosa apropiado para belleza.

### Card
Componente reutilizable para mostrar información en tarjetas con título, descripción y contenido personalizable.

### Button
Componente de botón con múltiples variantes (primary, secondary, success, danger, outline) y tamaños.

### Footer
Pie de página con información de contacto, enlaces rápidos y redes sociales.

## 📱 Funcionalidades

### Página de Inicio
- Hero section con llamada a la acción
- Sección de características principales de la academia
- Estadísticas de estudiantes graduados y cursos
- Cursos destacados con precios

### Página de Cursos
- Catálogo de cursos de belleza con imágenes
- Filtros por categoría (Maquillaje, Estética, Peluquería, Manicura)
- Búsqueda por título y descripción
- Información detallada de cada curso
- Precios y duración de los cursos

### Página de Contacto
- Formulario de contacto funcional
- Información de contacto de la academia
- Enlaces a redes sociales
- Validación de formularios

### Página Sobre Nosotros
- Información de la academia
- Misión y visión
- Valores corporativos
- Equipo de trabajo
- Estadísticas y logros

## 💄 Cursos Disponibles

### Maquillaje
- Maquillaje Profesional
- Maquillaje de Novias
- Extensiones de Pestañas

### Estética
- Estética Facial Avanzada
- Depilación Profesional
- Tratamientos Corporales

### Peluquería
- Colorimetría y Tintes
- Corte y Peinado

### Manicura
- Uñas Acrílicas y Gel

## 🚀 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Previsualiza la build de producción
- `npm run lint`: Ejecuta el linter para verificar el código

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto

Para más información, contacta con nosotros a través de la página de contacto de la aplicación.
