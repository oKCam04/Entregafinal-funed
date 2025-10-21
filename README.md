# Proyecto FUNED

Este repositorio reúne el código y la documentación del proyecto FUNED. El sistema está compuesto por un backend (API REST), un frontend web y un conjunto de documentos técnicos y funcionales que explican la solución y su operación.

## Descripción general
- Backend: servicio API para gestionar la lógica de negocio y el acceso a datos.
- Frontend: aplicación web para la interacción de los usuarios con el sistema.
- Documentación: manuales, requerimientos, pruebas y material de apoyo (incluye guía de instalación con Docker).

## Arquitectura y tecnologías
- Backend: Node.js con Express, organización por capas (controllers, services, middlewares), ORM con Sequelize (migrations/seeders), y documentación de API con Swagger.
- Frontend: aplicación basada en React (estructura en `FRONTED/proyecto-funed-frontend-r/funed-fronted`).
- Soporte: documentación técnica y de usuario en formato PDF.

## Estructura del repositorio
```
Entregafinal-funed/
├── BACKEND/
│   └── proyecto-funed-backend/
│       ├── config/          # Configuración de BD y entorno
│       ├── controller/      # Controladores de la API
│       ├── middlewares/     # Middlewares de seguridad/validación
│       ├── migrations/      # Migraciones de base de datos
│       ├── models/          # Modelos de datos (Sequelize)
│       ├── router/          # Definición de rutas de la API
│       ├── seeders/         # Datos iniciales (seeds)
│       ├── services/        # Lógica de negocio
│       ├── swagger/         # Especificación de la API
│       ├── server.js        # Punto de entrada del servidor
│       └── package.json     # Dependencias y scripts
│
├── FRONTED/
│   └── proyecto-funed-frontend-r/
│       └── funed-fronted/   # Código fuente del frontend (React)
│
└── DOCUMENTACIÓN/
    ├── Manual de Usuario funed.pdf
    ├── Manual Tecnico2.pdf
    ├── Requerimientos finales.pdf
    ├── Pruebas.pdf
    ├── Modelo y diccionario de datos proyecto.pdf
    ├── Instalador Docker.pdf
    ├── Articulo_proyecto_FUNED.pdf
    └── FormatoPlantillaPresentacionPowerPoint.pdf
```

## Cómo empezar (resumen)
- Backend:
  - Ir a `BACKEND/proyecto-funed-backend`.
  - Instalar dependencias: `npm install`.
  - Iniciar el servidor: `npm start` (o el script definido en `package.json`).
  - Revisar `swagger/` para la documentación de la API.
- Frontend:
  - Ir a `FRONTED/proyecto-funed-frontend-r/funed-fronted`.
  - Instalar dependencias: `npm install`.
  - Ejecutar la aplicación: `npm run dev` (o el script definido).
- Docker:
  - Consultar `DOCUMENTACIÓN/Instalador Docker.pdf` para la guía de instalación y ejecución. 

## Documentación
- Manual de Usuario: guía de uso del sistema.
- Manual Técnico: detalles de arquitectura, instalación y mantenimiento.
- Requerimientos y Pruebas: especificaciones y evidencias de validación.
- Modelo y Diccionario de Datos: diseño de la base de datos y definiciones.

## Notas
- Este README ofrece una vista general. Para pasos detallados y casos de uso, consulte los PDFs en `DOCUMENTACIÓN/`.
- Ajuste los comandos de ejecución según los scripts definidos en cada `package.json`.