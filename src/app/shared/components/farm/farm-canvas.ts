import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FarmService } from '../../../core/services/farm.service';
import { DigimonService } from '../../../core/services/digimon.service';
import type { DigimonEntity, FloatingParticle, } from '../../../core/models/farm.models';
import type { PlayerDigimon } from '../../../core/models/digimon.models';

@Component({
    selector: 'app-farm-canvas',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="canvas-viewport" #viewport>
      <canvas
        #canvas
        class="farm-canvas"
        (contextmenu)="onContextMenu($event)"
        (mousedown)="onMouseDown($event)"
        (mousemove)="onMouseMove($event)"
        (mouseup)="onMouseUp($event)"
        (mouseleave)="onMouseLeave()"
        (wheel)="onWheel($event)"
        aria-label="Lienzo 2D con mapa de la Granja"
      ></canvas>

      <div class="controls-hint">
        <span><strong>Click Derecho + Arrastrar:</strong> Mover mapa</span>
        <span><strong>Rueda:</strong> Zoom</span>
        <span><strong>Click Izquierdo:</strong> Interactuar con Digimon</span>
      </div>

      @if (digimonService.isDemoMode()) {
        <div class="demo-badge" title="Mostrando criaturas del simulador">
          <span class="demo-dot"></span> SIMULADOR LOCAL
        </div>
      }
    </div>
  `,
    styleUrl: './farm-canvas.css',
})

export class FarmCanvasComponent implements OnInit, OnDestroy {
    @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('viewport', { static: true }) viewportRef!: ElementRef<HTMLDivElement>;

    readonly farmService = inject(FarmService);
    readonly digimonService = inject(DigimonService);
    private readonly ngZone = inject(NgZone);

    private ctx: CanvasRenderingContext2D | null = null;
    private animationFrameId: number | null = null;
    private resizeObserver: ResizeObserver | null = null;

    private viewportWidth = 800;
    private viewportHeight = 600;
    private dpr = 1;
    private zoom = 1;

    private cameraX = 0;
    private cameraY = 0;

    private isDragging = false;
    private dragStartX = 0;
    private dragStartY = 0;
    private dragCameraStartX = 0;
    private dragCameraStartY = 0;
    private dragButton = 0; // 0 izquierdo, 2 derecho

    private bgImage: HTMLImageElement | null = null;
    private bgImageLoaded = false;
    private currentBgUrl = '';

    private entities: DigimonEntity[] = [];
    private particles: FloatingParticle[] = [];

    private readonly spriteCache = new Map<string, HTMLImageElement>();

    // delta time
    private lastTime = 0;

    constructor() {
        effect(() => {
            const theme = this.farmService.activeTheme();
            this.loadBackgroundImage(theme.cloudinaryUrl);
            this.centerCameraOnWorld();
        });

        effect(() => {
            const trigger = this.farmService.centerCameraTrigger();
            if (trigger > 0) {
                this.centerCameraOnWorld();
            }
        });

        effect(() => {
            const trigger = this.farmService.callToCenterTrigger();
            if (trigger > 0) {
                this.gatherAllInCenter();
            }
        });

        // sincronizar digimon
        effect(() => {
            const digimons = this.digimonService.myDigimons();
            this.syncEntitiesWithDigimons(digimons);
        });

        // seleccion digimon
        effect(() => {
            const selected = this.farmService.selectedEntity();
            this.entities.forEach((entity) => {
                entity.isSelected = selected ? entity.data.id === selected.id : false;
                if (entity.isSelected) {
                    entity.state = 'INTERACTING';
                    entity.stateTimer = 9999;
                } else if (entity.state === 'INTERACTING') {
                    entity.state = 'IDLE';
                    entity.stateTimer = 1.5;
                }
            });
        });
    }

    ngOnInit(): void {
        const canvas = this.canvasRef.nativeElement;
        this.ctx = canvas.getContext('2d', { alpha: false });

        const viewport = this.viewportRef.nativeElement;
        if (viewport.clientWidth > 0 && viewport.clientHeight > 0) {
            this.resizeCanvas(viewport.clientWidth, viewport.clientHeight);
        }

        this.setupResizeObserver();

        this.ngZone.runOutsideAngular(() => {
            this.lastTime = performance.now();
            this.startRenderLoop();
        });
    }

    ngOnDestroy(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    }

    // GESTIÓN DEL ENTORNO, REDIMENSIONADO Y CÁMARA

    private setupResizeObserver(): void {
        const viewport = this.viewportRef.nativeElement;
        this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    this.resizeCanvas(width, height);
                }
            }
        });
        this.resizeObserver.observe(viewport);
    }

    private resizeCanvas(width: number, height: number): void {
        const canvas = this.canvasRef.nativeElement;
        this.dpr = window.devicePixelRatio || 1;

        this.viewportWidth = Math.floor(width);
        this.viewportHeight = Math.floor(height);

        canvas.width = this.viewportWidth * this.dpr;
        canvas.height = this.viewportHeight * this.dpr;
        canvas.style.width = `${this.viewportWidth}px`;
        canvas.style.height = `${this.viewportHeight}px`;

        if (this.ctx) {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
        }

        this.updateZoomToFillWithScroll();
    }

    private updateZoomToFillWithScroll(): void {
        const theme = this.farmService.activeTheme();
        const worldW = theme.world.width;
        const worldH = theme.world.height;

        const minScrollX = 220;
        const minScrollY = 180;

        const zoomX = (this.viewportWidth + minScrollX) / worldW;
        const zoomY = (this.viewportHeight + minScrollY) / worldH;
        this.zoom = Math.max(zoomX, zoomY);

        this.updateEntitySizes();
        this.clampCamera();
    }

    private updateEntitySizes(): void {
        const baseWorldSize = 100;
        this.entities.forEach((entity) => {
            const size = baseWorldSize * entity.scale;
            entity.width = size;
            entity.height = size;
        });
    }

    private loadBackgroundImage(cloudinaryUrl: string): void {
        if (this.currentBgUrl === cloudinaryUrl && this.bgImageLoaded) {
            return;
        }
        this.currentBgUrl = cloudinaryUrl;
        this.bgImageLoaded = false;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = cloudinaryUrl;

        img.onload = () => {
            this.bgImage = img;
            this.bgImageLoaded = true;
            this.centerCameraOnWorld();
        };

        img.onerror = () => {
            console.warn(`No se pudo cargar el mapa desde Cloudinary ('${cloudinaryUrl}').`);
            this.bgImage = null;
            this.bgImageLoaded = false;
            this.centerCameraOnWorld();
        };
    }

    public centerCameraOnWorld(): void {
        const theme = this.farmService.activeTheme();
        const worldW = theme.world.width;
        const worldH = theme.world.height;

        this.updateZoomToFillWithScroll();

        const visibleWorldW = this.viewportWidth / this.zoom;
        const visibleWorldH = this.viewportHeight / this.zoom;

        this.cameraX = (worldW - visibleWorldW) / 2;
        this.cameraY = (worldH - visibleWorldH) / 2;
        this.clampCamera();
    }

    private clampCamera(): void {
        const theme = this.farmService.activeTheme();
        const worldW = theme.world.width;
        const worldH = theme.world.height;

        const visibleWorldW = this.viewportWidth / this.zoom;
        const visibleWorldH = this.viewportHeight / this.zoom;

        const maxCamX = Math.max(0, worldW - visibleWorldW);
        const maxCamY = Math.max(0, worldH - visibleWorldH);

        this.cameraX = Math.max(0, Math.min(maxCamX, this.cameraX));
        this.cameraY = Math.max(0, Math.min(maxCamY, this.cameraY));
    }

    // GESTIÓN DE ENTIDADES

    private syncEntitiesWithDigimons(digimons: PlayerDigimon[]): void {
        const farmDigimons = digimons.filter((d) => d.isWalking);
        const existingIds = new Set(this.entities.map((e) => e.data.id));
        const targetIds = new Set(farmDigimons.map((d) => d.id));

        this.entities = this.entities.filter((e) => targetIds.has(e.data.id));

        farmDigimons.forEach((digimon) => {
            if (!existingIds.has(digimon.id)) {
                this.entities.push(this.createEntityFromDigimon(digimon));
            }
        });

        this.updateEntitySizes();
    }

    private createEntityFromDigimon(digimon: PlayerDigimon): DigimonEntity {
        const bounds = this.getAbsoluteWorldBounds();
        const spawnX = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
        const spawnY = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);

        let scale = 1.0;
        if (digimon.generation === 'Baby I' || digimon.generation === 'Baby II') scale = 0.75;
        else if (digimon.generation === 'Ultimate' || digimon.generation === 'Mega') scale = 1.2;

        const baseWorldSize = 84;
        const entity: DigimonEntity = {
            data: digimon,
            x: spawnX,
            y: spawnY,
            targetX: spawnX,
            targetY: spawnY,
            speed: 35 + Math.random() * 25,
            state: 'IDLE',
            stateTimer: 1 + Math.random() * 3,
            direction: Math.random() > 0.5 ? 'right' : 'left',
            scale,
            image: null,
            imageLoaded: false,
            imageError: false,
            bobbingTimer: Math.random() * Math.PI * 2,
            bobbingOffset: 0,
            width: baseWorldSize * scale,
            height: baseWorldSize * scale,
            isHovered: false,
            isSelected: false,
        };

        this.loadSpriteForEntity(entity);
        return entity;
    }

    private loadSpriteForEntity(entity: DigimonEntity): void {
        const spriteUrl = entity.data.spriteUrl;
        if (!spriteUrl) {
            entity.imageError = true;
            return;
        }

        if (this.spriteCache.has(spriteUrl)) {
            entity.image = this.spriteCache.get(spriteUrl)!;
            entity.imageLoaded = true;
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = spriteUrl;
        img.onload = () => {
            this.spriteCache.set(spriteUrl, img);
            entity.image = img;
            entity.imageLoaded = true;
        };
        img.onerror = () => {
            if (entity.data.fullImageUrl && entity.data.fullImageUrl !== spriteUrl) {
                const fallbackImg = new Image();
                fallbackImg.crossOrigin = 'anonymous';
                fallbackImg.src = entity.data.fullImageUrl;
                fallbackImg.onload = () => {
                    this.spriteCache.set(spriteUrl, fallbackImg);
                    entity.image = fallbackImg;
                    entity.imageLoaded = true;
                };
                fallbackImg.onerror = () => (entity.imageError = true);
            } else {
                entity.imageError = true;
            }
        };
    }

    // FÍSICA Y NAVEGACIÓN RANDOM WAYPOINT EN EL MUNDO

    private updatePhysics(dt: number): void {
        const bounds = this.getAbsoluteWorldBounds();

        this.entities.forEach((entity) => {
            entity.stateTimer -= dt;

            if (entity.state === 'IDLE') {
                entity.bobbingOffset = Math.sin(entity.bobbingTimer) * 1.5;
                entity.bobbingTimer += dt * 2.5;

                if (entity.stateTimer <= 0) {
                    entity.state = 'WALKING';
                    entity.targetX = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
                    entity.targetY = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
                    entity.stateTimer = 6 + Math.random() * 8;
                }
            } else if (entity.state === 'WALKING') {
                const dx = entity.targetX - entity.x;
                const dy = entity.targetY - entity.y;
                const distance = Math.hypot(dx, dy);

                if (distance < 6 || entity.stateTimer <= 0) {
                    entity.state = 'IDLE';
                    entity.stateTimer = 2 + Math.random() * 4;
                    entity.bobbingOffset = 0;
                } else {
                    const dirX = dx / distance;
                    const dirY = dy / distance;

                    if (Math.abs(dirX) > 0.15) {
                        entity.direction = dirX > 0 ? 'right' : 'left';
                    }

                    const moveDist = Math.min(distance, entity.speed * dt);
                    entity.x += dirX * moveDist;
                    entity.y += dirY * moveDist;

                    entity.bobbingTimer += dt * 10;
                    entity.bobbingOffset = Math.abs(Math.sin(entity.bobbingTimer)) * -5;
                }
            } else if (entity.state === 'INTERACTING') {
                entity.bobbingOffset = Math.sin(entity.bobbingTimer) * 2;
                entity.bobbingTimer += dt * 3;
            }

            entity.x = Math.max(bounds.minX, Math.min(bounds.maxX, entity.x));
            entity.y = Math.max(bounds.minY, Math.min(bounds.maxY, entity.y));
        });

        this.updateParticles(dt);
    }

    private gatherAllInCenter(): void {
        const bounds = this.getAbsoluteWorldBounds();
        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;

        this.entities.forEach((entity, index) => {
            const angle = (index / this.entities.length) * Math.PI * 2;
            const radius = 50 + Math.random() * 40;
            entity.targetX = centerX + Math.cos(angle) * radius;
            entity.targetY = centerY + Math.sin(angle) * radius;
            entity.state = 'WALKING';
            entity.stateTimer = 12;

            entity.bubble = {
                icon: '!',
                text: '¡Voy!',
                timer: 3.0,
            };
        });
    }

    private getAbsoluteWorldBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
        const theme = this.farmService.activeTheme();
        const b = theme.bounds;
        const w = theme.world.width;
        const h = theme.world.height;
        return {
            minX: w * b.minXPercent,
            maxX: w * b.maxXPercent,
            minY: h * b.minYPercent,
            maxY: h * b.maxYPercent,
        };
    }

    private updateParticles(dt: number): void {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            p.worldY -= p.velocityY * dt;
            p.opacity = Math.max(0, p.life / p.maxLife);
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    public spawnFloatingEffect(worldX: number, worldY: number, text: string, color = '#38bdf8'): void {
        this.particles.push({
            id: Math.random().toString(36).substring(2, 9),
            worldX: worldX + (Math.random() - 0.5) * 20,
            worldY: worldY - 45,
            text,
            color,
            opacity: 1,
            life: 1.4,
            maxLife: 1.4,
            velocityY: 35,
        });
    }

    // BUCLE DE RENDERIZADO 60 FPS

    private startRenderLoop(): void {
        const loop = (timestamp: number) => {
            const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
            this.lastTime = timestamp;

            this.updatePhysics(dt);
            this.render();

            this.animationFrameId = requestAnimationFrame(loop);
        };

        this.animationFrameId = requestAnimationFrame(loop);
    }

    private render(): void {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const canvas = this.canvasRef.nativeElement;

        // Limpiar el lienzo
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        // Escalado por DPR y Zoom
        ctx.scale(this.dpr * this.zoom, this.dpr * this.zoom);

        // Cámara
        ctx.translate(-this.cameraX, -this.cameraY);

        // Dibuja el fondo
        this.renderWorldBackground(ctx);

        // Y-Sorting
        const sortedEntities = [...this.entities].sort((a, b) => a.y - b.y);

        // Sombras
        sortedEntities.forEach((e) => this.renderShadow(ctx, e));

        // Circulos de seleccion
        sortedEntities.forEach((e) => {
            if (e.isSelected || e.isHovered) {
                this.renderSelectionRing(ctx, e);
            }
        });

        // Dibuja Sprites
        sortedEntities.forEach((e) => this.renderDigimonSprite(ctx, e));

        // Dibuja HUD
        sortedEntities.forEach((e) => this.renderEntityHUD(ctx, e));

        // Partículas
        this.renderParticles(ctx);

        ctx.restore();
    }

    private renderWorldBackground(ctx: CanvasRenderingContext2D): void {
        const theme = this.farmService.activeTheme();
        const worldW = theme.world.width;
        const worldH = theme.world.height;

        if (this.bgImageLoaded && this.bgImage) {
            ctx.drawImage(this.bgImage, 0, 0, worldW, worldH);
        } else {
            // Fondo de mientras carga
            const grad = ctx.createLinearGradient(0, 0, 0, worldH);
            grad.addColorStop(0, '#0a192f');
            grad.addColorStop(1, '#172a45');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, worldW, worldH);

            ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
            ctx.lineWidth = 1;
            const step = 48;
            for (let x = 0; x < worldW; x += step) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, worldH);
                ctx.stroke();
            }
            for (let y = 0; y < worldH; y += step) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(worldW, y);
                ctx.stroke();
            }
        }
    }

    private renderShadow(ctx: CanvasRenderingContext2D, entity: DigimonEntity): void {
        ctx.save();
        ctx.fillStyle = 'rgba(8, 20, 32, 0.45)';
        ctx.beginPath();
        ctx.ellipse(entity.x, entity.y, entity.width * 0.45, entity.width * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    private renderSelectionRing(ctx: CanvasRenderingContext2D, entity: DigimonEntity): void {
        ctx.save();
        ctx.strokeStyle = entity.isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = entity.isSelected ? 3 : 2;
        ctx.setLineDash(entity.isSelected ? [4, 2] : []);
        ctx.beginPath();
        ctx.ellipse(entity.x, entity.y, entity.width * 0.55, entity.width * 0.22, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    private renderDigimonSprite(ctx: CanvasRenderingContext2D, entity: DigimonEntity): void {
        ctx.save();
        const drawX = entity.x;
        const drawY = entity.y + entity.bobbingOffset;

        ctx.translate(drawX, drawY);

        if (entity.direction === 'left') {
            ctx.scale(-1, 1);
        }

        const renderW = entity.width;
        const renderH = entity.height;

        if (entity.imageLoaded && entity.image) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(entity.image, -renderW / 2, -renderH, renderW, renderH);
        } else {
            ctx.fillStyle = entity.imageError ? '#ef4444' : '#38bdf8';
            ctx.beginPath();
            ctx.roundRect(-renderW / 2, -renderH, renderW, renderH, 8);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(entity.data.nickname.substring(0, 3).toUpperCase(), 0, -renderH / 2);
        }

        ctx.restore();
    }

    private renderEntityHUD(ctx: CanvasRenderingContext2D, entity: DigimonEntity): void {
        ctx.save();
        const headY = entity.y + entity.bobbingOffset - entity.height - 4 / this.zoom;

        const fontSize = Math.max(7, Math.round(10 / this.zoom));
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        const label = `${entity.data.nickname} (Nv.${entity.data.level})`;
        const textMetrics = ctx.measureText(label);
        const boxW = textMetrics.width + 10 / this.zoom;
        const boxH = 16 / this.zoom;

        ctx.fillStyle = 'rgba(7, 26, 43, 0.85)';
        ctx.strokeStyle = entity.isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1 / this.zoom;
        ctx.beginPath();
        ctx.roundRect(entity.x - boxW / 2, headY - boxH, boxW, boxH, 3 / this.zoom);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, entity.x, headY - boxH / 2);

        if (entity.bubble && entity.bubble.timer > 0) {
            ctx.font = `${Math.round(14 / this.zoom)}px sans-serif`;
            ctx.fillText(entity.bubble.icon, entity.x, headY - boxH - 8 / this.zoom);
        }

        ctx.restore();
    }

    private renderParticles(ctx: CanvasRenderingContext2D): void {
        if (this.particles.length === 0) return;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        this.particles.forEach((p) => {
            ctx.font = 'bold 16px Inter, sans-serif';
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(p.text, p.worldX, p.worldY);
        });

        ctx.restore();
    }

    // INTERACCIÓN: CLICK DERECHO (PANNING) Y CLICK IZQUIERDO (RAYCASTING 2D)

    onContextMenu(event: MouseEvent): void {
        event.preventDefault();
    }

    onWheel(event: WheelEvent): void {
        event.preventDefault();
        const theme = this.farmService.activeTheme();
        const worldW = theme.world.width;
        const worldH = theme.world.height;

        const minCoverZoom = Math.max(this.viewportWidth / worldW, this.viewportHeight / worldH);
        const maxZoom = minCoverZoom * 2.5;

        const zoomDelta = event.deltaY < 0 ? 0.08 : -0.08;
        const newZoom = Math.max(minCoverZoom, Math.min(maxZoom, this.zoom + zoomDelta));
        if (Math.abs(newZoom - this.zoom) > 0.001) {
            this.zoom = newZoom;
            this.clampCamera();
        }
    }

    onMouseDown(event: MouseEvent): void {
        this.dragButton = event.button;

        // arrastra click derecho
        if (event.button === 2) {
            this.isDragging = true;
            this.dragStartX = event.clientX;
            this.dragStartY = event.clientY;
            this.dragCameraStartX = this.cameraX;
            this.dragCameraStartY = this.cameraY;
            this.canvasRef.nativeElement.style.cursor = 'grabbing';
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.isDragging && this.dragButton === 2) {
            const deltaX = (event.clientX - this.dragStartX) / this.zoom;
            const deltaY = (event.clientY - this.dragStartY) / this.zoom;

            this.cameraX = this.dragCameraStartX - deltaX;
            this.cameraY = this.dragCameraStartY - deltaY;
            this.clampCamera();
            return;
        }

        const worldCoords = this.getWorldCoordinates(event);
        if (!worldCoords) return;

        let hoveredEntity: DigimonEntity | null = null;
        const reversed = [...this.entities].sort((a, b) => b.y - a.y);
        reversed.forEach((e) => {
            const inside = this.isPointInsideEntity(worldCoords.x, worldCoords.y, e);
            e.isHovered = inside;
            if (inside && !hoveredEntity) hoveredEntity = e;
        });

        this.canvasRef.nativeElement.style.cursor = hoveredEntity ? 'pointer' : 'default';
    }

    onMouseUp(event: MouseEvent): void {
        if (this.dragButton === 2) {
            this.isDragging = false;
            this.canvasRef.nativeElement.style.cursor = 'default';
        } else if (event.button === 0) {
            // Click izquierdo interaccion
            const worldCoords = this.getWorldCoordinates(event);
            if (!worldCoords) return;

            const reversed = [...this.entities].sort((a, b) => b.y - a.y);
            const clicked = reversed.find((e) => this.isPointInsideEntity(worldCoords.x, worldCoords.y, e));

            this.ngZone.run(() => {
                this.farmService.selectDigimon(clicked ? clicked.data : null);
            });
        }
    }

    onMouseLeave(): void {
        this.isDragging = false;
        this.entities.forEach((e) => (e.isHovered = false));
        this.canvasRef.nativeElement.style.cursor = 'default';
    }

    // Coordenadas de ratón a Granja
    private getWorldCoordinates(event: MouseEvent): { x: number; y: number } | null {
        const canvas = this.canvasRef.nativeElement;
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return null;

        const screenX = (event.clientX - rect.left) * (this.viewportWidth / rect.width);
        const screenY = (event.clientY - rect.top) * (this.viewportHeight / rect.height);

        return {
            x: screenX / this.zoom + this.cameraX,
            y: screenY / this.zoom + this.cameraY,
        };
    }

    private isPointInsideEntity(worldX: number, worldY: number, entity: DigimonEntity): boolean {
        const halfW = entity.width / 2;
        const minX = entity.x - halfW;
        const maxX = entity.x + halfW;
        const minY = entity.y - entity.height + entity.bobbingOffset;
        const maxY = entity.y + 6;

        return worldX >= minX && worldX <= maxX && worldY >= minY && worldY <= maxY;
    }
}