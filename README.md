# DGHome
### Plataforma Web Interactiva: Cría de Digimons, Digigranja 2D, Social y Tienda

![Framework](https://img.shields.io/badge/Angular-v17%2B_Standalone-DD0031.svg?logo=angular&logoColor=white)
![Lenguaje](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript&logoColor=white)
![Gráficos](https://img.shields.io/badge/Canvas-HTML5_2D_Pixel_Art-E34F26.svg)
![Estilos](https://img.shields.io/badge/Estilos-Tailwind_CSS_%2B_SCSS-38B2AC.svg?logo=tailwind-css&logoColor=white)
![WebSockets](https://img.shields.io/badge/Socket.io-Client_v4-black.svg)

> Repositorio oficial de la aplicación web **DGHome**.  
> Una plataforma SPA moderna de cría y gestión inspirada en las clásicas *Digifarms* de Digimon, con gráficos 2D pixel art, enciclopedia de especies, tienda, inventario compartido, chat en vivo e intercambio web.

---

## 1. Visión y Funcionalidades del Frontend Web

DGHome es el centro de mando en escritorio para gestionar y criar a tus Digimons:

1. **Lienzo de Granja Interactiva 2D (Canvas Pixel Art):**
   - Entorno isométrico/top-down de isla digital con praderas, vallas de madera, ríos y rampas de arena.
   - Las criaturas pasean de forma autónoma con animaciones en pixel art (`image-rendering: pixelated`).
   - Interacción directa mediante clics sobre los Digimons para alimentarlos, acariciarlos o abrir su ficha técnica.
2. **Ficha Técnica y Colección de Criaturas:**
   - Buscador en tiempo real con sistema de filtros múltiples (Generación, Tipo, Atributo, Etapa) y ordenación (por Nivel, Etapa, Generación y Hambre).
   - Barras de estado con indicadores numéricos de **PV (Vida)**, **PH (Habilidad)**, **EXP**, **Talento** y **Amistad (Bond %)**.
   - Registro de Cansancio y Hambre actual.
3. **Enciclopedia Digital (Digipedia):**
   - Registro de todas las especies conocidas. Las criaturas aún no descubiertas aparecen como siluetas oscurecidas, mientras que las descubiertas despliegan su ficha completa y biografía lore.
4. **Inventario Compartido Categorizado:**
   - Cuadrícula de casillas para objetos clasificados en 5 pestañas: `Consumibles`, `Comida`, `Cosméticos`, `Muebles` y `Misc`.
   - Panel de inspección detallado con icono a gran escala, fecha de obtención y descripción funcional.
5. **Tienda y Banners Gacha:**
   - Marcador superior con doble divisa: Moneda Gratuita / Bits e icono de cristales, y Moneda Premium / Gemas de pago.
   - Catálogo de paquetes de inicio (*Paquete del granjero principiante*, *Paquete del coleccionista*, etc.) y recursos.
6. **Ecosistema Social y Chat en Tiempo Real:**
   - Perfil de usuario con avatar, nivel, UID, frase personalizada y escaparate con 6 Digimons destacados.
   - Lista de amigos con indicador de conexión online (punto verde) y buscador de nuevos entrenadores por UID.
   - Ventana de chat bidireccional en tiempo real impulsada por **WebSockets (Socket.io)** con timestamps y soporte de menciones.
7. **Sistema de Intercambio Web:**
   - Panel seguro de intercambio con advertencia de confirmación, selector de tu inventario, casillas de tu oferta y oferta del compañero (límite: 3 intercambios al mes).
8. **Panel de Ajustes Gráficos Avanzados:**
   - Control de tasa de refresco (FPS), sincronización vertical (V-Sync), render scale, calidad de sombras y post-procesado visual.

---

## 2. Mapa de Pantallas Implementadas (Figma)

La aplicación web cubre con exactitud las **15 vistas** diseñadas en Figma (`DGHome.pdf` / [CONTEXTO_DISENO_FIGMA.md](./CONTEXTO_DISENO_FIGMA.md)):

```
┌────────────────────────────────────────────────────────────────────────┐
│  DGHome Web UI Map                                                     │
├────────────────────────────────────────────────────────────────────────┤
│  [12. Login]  ──►  [13. Registro]  ──►  [14. Recuperar Contraseña]     │
│       │                                                                │
│       ▼                                                                │
│  [01. Granja 2D Principal / Home] ◄── Menú Superior & Lateral ───────┐ │
│       ├──► [02. Colección de Digimons / Ficha]                         │ │
│       ├──► [03. Digipedia / Enciclopedia Digital]                      │ │
│       ├──► [04. Tienda de Paquetes y Gemas]                           │ │
│       ├──► [05. Inventario de Objetos (5 Pestañas)]                    │ │
│       ├──► [06. Perfil de Usuario] ──► [07. Amigos] ──► [08. Añadir]   │ │
│       ├──► [09. Intercambio Web (3/mes)]                              │ │
│       ├──► [11. Chat en Vivo con Socket.io]                            │ │
│       └──► [15. Ajustes de Gráficos y Configuración]                  │ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Stack Tecnológico Frontend

- **Framework:** Angular 17+ (utilizando la arquitectura moderna de **Standalone Components** y reactividad con **Angular Signals**).
- **Lenguaje:** TypeScript 5+.
- **Renderizado 2D de la Granja:** HTML5 Canvas API nativo con bucle `requestAnimationFrame` optimizado (o librería ligera de sprites 2D como PixiJS).
- **Estilos & Diseño:**
  - Tailwind CSS para diseño utilitario y responsivo.
  - SCSS para transiciones de desenfoque *backdrop-filter*, efectos de brillo ciberpunk neón y scrollbars personalizadas.
- **Comunicación en Tiempo Real:** `socket.io-client` v4.
- **Manejo de Estado & Reactividad:** Angular Signals (`signal`, `computed`, `effect`) combinado con `RxJS` para flujos asíncronos y llamadas HTTP.
- **Enrutamiento:** Angular Router con `canActivate` Guards de autenticación.

---

## 4. Estructura del Proyecto

```
src/app/
├── core/
│   ├── guards/              # AuthGuard para rutas protegidas
│   ├── interceptors/        # JwtInterceptor (Bearer token) y ErrorInterceptor
│   └── services/            # Servicios singleton (AuthService, SocketService)
├── features/
│   ├── auth/                # Componentes de Login, Register y ForgotPassword
│   ├── farm/                # Lienzo 2D de la Digigranja, bucle de render y sprites
│   ├── digimons/            # Vistas de lista, filtros, ordenación y ficha detallada
│   ├── digipedia/           # Enciclopedia con siluetas y lore
│   ├── inventory/           # Cuadrícula de objetos con selector de 5 pestañas
│   ├── shop/                # Tienda de paquetes de inicio y divisas
│   ├── social/              # Perfil de usuario, lista de amigos y búsqueda
│   ├── chat/                # Chat en vivo flotante / lateral con WebSockets
│   ├── trade/               # Flujo de negociación e intercambio de 3 slots
│   └── settings/            # Ajustes de calidad gráfica y sonido
├── shared/
│   ├── components/          # Botones neón, modales glassmorphism, barras de progreso
│   ├── models/              # Interfaces TypeScript (Digimon, Item, User, Trade)
│   └── pipes/               # Formateadores de números, divisas y atributos
└── environments/
    ├── environment.ts       # Configuración para desarrollo local
    └── environment.prod.ts  # Configuración para producción
```

---

## 5. Configuración de Entornos (`environment.ts`)

En `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api/v1',
  socketUrl: 'http://localhost:3000'
};
```

---

## 6. Instalación y Ejecución

### Prerrequisitos:
- Node.js 20+ LTS instalado.
- Servidor backend DGServer levantado en `http://localhost:3000`.

### Comandos de Ejecución:
```bash
# 1. Instalar dependencias de npm
npm install

# 2. Iniciar el servidor de desarrollo de Angular
npm start
# O alternativamente:
ng serve --open

# 3. La aplicación se abrirá automáticamente en:
# http://localhost:4200/
```

### Compilación para Producción:
```bash
ng build --configuration production
# Los archivos generados y optimizados se ubicarán en dist/dghome-web/
```

---
