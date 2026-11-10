# Changelog

## v0.2.3 - Interceptor HTTP de Autorización Bearer y Protección de Rutas [SUB-02-3]

### Añadido
- Interceptor HTTP funcional `authInterceptor` (`src/app/core/interceptors/auth.interceptor.ts`) para inyección automática de la cabecera `Authorization: Bearer <token>` en todas las peticiones salientes
- Registro de `withInterceptors([authInterceptor])` en la configuración global de `provideHttpClient` en `src/app/app.config.ts`
- Guardia de enrutamiento funcional `authGuard` (`src/app/core/guards/auth.guard.ts`) para control de acceso a vistas protegidas
- Protección de la ruta `/home` con `canActivate: [authGuard]` para impedir accesos anónimos y redirigir al login
- Método `getProfile` en `AuthService` para la consulta del perfil del usuario autenticado contra `/auth/me`

### Archivos creados
- `src/app/core/interceptors/auth.interceptor.ts` - Interceptor de cabecera Bearer
- `src/app/core/guards/auth.guard.ts` - Guardia de navegación para rutas protegidas

### Archivos modificados
- `src/app/app.config.ts` - Inclusión de `withInterceptors([authInterceptor])`
- `src/app/app.routes.ts` - Aplicación de `authGuard` a la ruta `/home`
- `src/app/core/services/auth.service.ts` - Incorporación del método `getProfile`

---

## v0.2.2 - Servicio de Autenticación y Formularios Reactivos de Login y Registro [SUB-02-2]

### Añadido
- Servicio `AuthService` (`src/app/core/services/auth.service.ts`) para la comunicación HTTP con los endpoints de login y registro
- Gestión reactiva del estado de usuario autenticado mediante Signals de Angular (`currentUser`, `isAuthenticated`)
- Persistencia del token JWT y de la sesión del usuario en `localStorage`
- Configuración de variables de entorno de desarrollo (`src/environments/environment.ts`) con la URL base de la API REST
- Configuración de `provideHttpClient()` en `src/app/app.config.ts`
- Modelos TypeScript tipados para autenticación (`src/app/core/models/auth.models.ts`)
- Validador personalizado `passwordsMatchValidator` para comprobar coincidencia entre contraseñas en el registro
- Estilos visuales para mensajes de error de campo (`.field-error`) y alertas del servidor (`.auth-alert-error`)
- Estado de carga e inhabilitación temporal de botones durante peticiones en vuelo para prevenir envíos duplicados

### Modificado
- Vista de **Login** (`src/app/login/`): migración de `FormsModule` a `ReactiveFormsModule`, validaciones de campos requeridos y longitud, captura de errores HTTP y redirección automática tras autenticación exitosa
- Vista de **Registro** (`src/app/register/`): migración a formulario reactivo con validación de formato de email, longitud mínima, confirmación de contraseña y gestión de respuestas de conflicto

### Archivos creados
- `src/environments/environment.ts` - Configuración de entorno local y endpoints de la API
- `src/app/core/models/auth.models.ts` - Interfaces tipadas de datos de autenticación
- `src/app/core/services/auth.service.ts` - Servicio de consumo HTTP y gestión de sesión

### Archivos modificados
- `src/app/app.config.ts` - Inclusión de `provideHttpClient` en los proveedores de la aplicación
- `src/app/login/login.ts` - Controlador reactivo del formulario de inicio de sesión
- `src/app/login/login.html` - Plantilla con vinculación reactiva, alertas y mensajes de error
- `src/app/login/login.css` - Estilos para alertas de error y estado deshabilitado del botón
- `src/app/register/register.ts` - Controlador reactivo del formulario de registro y validador de contraseña
- `src/app/register/register.html` - Plantilla con vinculación reactiva y mensajes de validación
- `src/app/register/register.css` - Estilos para alertas de error y validaciones

---

## v0.2.1 - Corrección Arquitectónica: Desacoplamiento de Prisma y Limpieza de Persistencia [SUB-02-1]

### Modificado
- Desacoplamiento completo de la capa de persistencia en el cliente web según los requisitos de arquitectura por capas del proyecto (Sección 1 y 2 de las rúbricas)
- Saneamiento de `package.json` mediante la eliminación de dependencias de servidor y ORM no aplicables a un cliente Angular en navegador
- Reducción del árbol de dependencias (`node_modules`) mediante `npm prune`, eliminando 174 paquetes huérfanos para aligerar el proyecto
- Delegación formal del acceso a datos hacia la API REST del backend, dejando el cliente preparado para el consumo mediante `AuthService` y `HttpClient`

### Eliminado
- `prisma.config.ts` - Archivo de configuración de Prisma eliminado del frontend
- `prisma/` - Directorio de esquema y contratos de Prisma 8 (`contract.prisma`, `contract.json`, `contract.d.ts`) eliminado
- `migrations/` - Snapshots y migraciones de base de datos eliminadas del cliente web

### Archivos modificados
- `package.json` - Retirada de dependencias `@prisma/client`, `@prisma/orm-postgres` y `prisma`

### Archivos eliminados
- `prisma.config.ts`
- `prisma/contract.prisma`
- `prisma/contract.json`
- `prisma/contract.d.ts`
- `migrations/app/20261109T1709_init_users_credentials/migration.json`
- `migrations/app/20261109T1709_init_users_credentials/migration.ts`
- `migrations/app/20261109T1709_init_users_credentials/ops.json`
- `migrations/snapshots/ee291a282e27fa83b06404ab7f87c15c276844be823174f3494305a68562b723/contract.d.ts`
- `migrations/snapshots/ee291a282e27fa83b06404ab7f87c15c276844be823174f3494305a68562b723/contract.json`

---

## v0.2.0 - Pantallas de Login y Registro, Fondo DigiWorld, Iconos Reutilizables y Enrutamiento

### Añadido
- Vista completa de **Login** (`/login`) con formulario de acceso (email/username + password), enlaces de navegación y accesos sociales
- Vista completa de **Registro** (`/register`) con campos para username, email, contraseña y repetición de contraseña
- Vista principal de **Home** (`/home`) con cabecera interactiva, barra lateral de navegación y área de mapa
- Componente standalone reutilizable **`<app-icon>`** (`src/app/shared/components/icon/`) para centralizar y unificar todos los iconos vectoriales de la aplicación
- Configuración de enrutador Angular en `src/app/app.routes.ts` con redirección por defecto a `/login` y navegación fluida entre vistas
- Imagen de fondo temática de DigiWorld (`public/bg-digiworld.jpg`) integrada en las vistas de autenticación

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
