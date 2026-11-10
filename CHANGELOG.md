# Changelog

## v0.2.0 - Pantallas de Login y Registro, Fondo DigiWorld, Iconos Reutilizables y Enrutamiento

### Añadido
- Vista completa de **Login** (`/login`) con formulario de acceso (email/username + password), enlaces de navegación y accesos sociales
- Vista completa de **Registro** (`/register`) con campos para username, email, contraseña y repetición de contraseña
- Vista principal de **Home** (`/home`) con cabecera interactiva, barra lateral de navegación y área de mapa
- Componente standalone reutilizable **`<app-icon>`** (`src/app/shared/components/icon/`) para centralizar y unificar todos los iconos vectoriales de la aplicación
- Configuración de enrutador Angular en `src/app/app.routes.ts` con redirección por defecto a `/login` y navegación fluida entre vistas
- Imagen de fondo temática de DigiWorld (`public/bg-digiworld.jpg`) integrada en las vistas de autenticación
- Esquema de base de datos y contrato Prisma 8 (`prisma/contract.prisma`) con migración inicial planificada para PostgreSQL

### Vistas y navegación
- `GET /` - Redirección automática a `/login`
- `GET /login` - Pantalla de inicio de sesión con enlaces a registro y recuperación
- `GET /register` - Pantalla de alta de nuevos usuarios con enlace a login
- `GET /home` - Pantalla principal con layout de navegación lateral y superior

### Componentes y diseño
- **Componente Reutilizable `<app-icon>`**:
  - Sustitución de bloques SVG inline repetitivos por etiquetas semánticas y legibles (`<app-icon name="user" />`)
  - Soporte de 12 iconos vectoriales con tipado estricto `IconName`: `logo-dino`, `banner`, `home`, `user`, `settings`, `lock`, `mail`, `bell`, `map`, `facebook`, `twitter`, `apple`
  - Escalado automático y control de dimensiones dinámicas
- **Paleta de colores pixel-art y metálica (fiel a los diseños)**:
  - Cabecera y barra lateral en azul celeste degradado (`#80d0ff` a `#5ab8f5`)
  - Botones de navegación y botones de acción en plateado metálico degradado (`#eef3f7` a `#b0bec9`) con bordes marinos (`#1a3a52`)
  - Botones de barra lateral en degradado verde menta / aguamarina (`#c8f0e4` a `#68c4a4`) con bordes verde oscuro (`#1a4a5a`)
  - Tarjeta de autenticación oscura semitransparente (`rgba(10, 14, 22, 0.88)`) con sombras difuminadas

### Archivos creados
- `src/app/shared/components/icon/icon.ts` - Lógica y tipado del componente reutilizable de iconos
- `src/app/shared/components/icon/icon.html` - Catálogo de vectores SVG gestionados mediante `@switch` nativo
- `src/app/shared/components/icon/icon.css` - Estilos de alineación y display del icono
- `src/app/login/login.ts` - Componente del controlador de inicio de sesión
- `src/app/login/login.html` - Plantilla maquetada del login con tarjeta de acceso
- `src/app/login/login.css` - Estilos visuales de la vista de login
- `src/app/register/register.ts` - Componente del controlador de registro
- `src/app/register/register.html` - Plantilla del formulario de registro
- `src/app/register/register.css` - Estilos visuales de la vista de registro
- `src/app/home/home.ts` - Componente de la vista principal Home
- `src/app/home/home.html` - Plantilla con layout de cabecera, sidebar y mapa
- `src/app/home/home.css` - Estilos del layout general y botones
- `public/bg-digiworld.jpg` - Fondo del mundo digital para las vistas de autenticación
- `prisma/contract.prisma` - Contrato declarativo de entidades `User` y `Credential`
- `prisma.config.ts` - Configuración de Prisma ORM para PostgreSQL
- `migrations/app/` - Migración inicial planificada para PostgreSQL

---

## v0.1.0 - Proyecto base

### Añadido
- Inicialización del proyecto Angular 22 con **Standalone Components**
- Configuración de TypeScript (`tsconfig.json` y `tsconfig.app.json`)
- Configuración de Angular CLI (`angular.json`) con rutas de assets y estilos globales
- Estructura base de enrutamiento y contenedor raíz (`src/app/app.ts`)
- Configuración de exclusión de Git (`.gitignore`)
- Scripts de desarrollo (`npm start`), compilación (`npm run build`) y pruebas (`npm test`)

### Scripts configurados
```bash
npm start     # Servidor local de desarrollo (ng serve)
npm run build # Compilación de producción optimizada
npm test      # Ejecución de pruebas unitarias
```

### Archivos creados
- `package.json` - Definición del proyecto y dependencias de Angular
- `angular.json` - Configuración de compilación y empaquetado de Angular CLI
- `tsconfig.json` - Configuración base del compilador TypeScript
- `tsconfig.app.json` - Configuración de compilación para la aplicación Angular
- `src/index.html` - Documento HTML base con fuentes tipográficas Inter
- `src/main.ts` - Bootstrap de la aplicación Angular standalone
- `src/styles.css` - Estilos globales de reseteo
- `.gitignore` - Reglas de exclusión para dependencias y temporales

