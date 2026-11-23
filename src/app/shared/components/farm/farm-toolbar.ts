import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FarmService } from '../../../core/services/farm.service';
import { DigimonService } from '../../../core/services/digimon.service';
import type { FarmThemeId } from '../../../core/models/farm.models';

@Component({
  selector: 'app-farm-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="farm-hud" aria-label="Controles de la Digigranja">
      <!-- Selector -->
      <nav class="theme-chips" aria-label="Selector de escenario">
        @for (theme of farmService.availableThemes(); track theme.id) {
          <button
            type="button"
            class="chip-btn"
            [class.active]="theme.id === farmService.activeThemeId()"
            (click)="selectTheme(theme.id)"
            [title]="theme.description"
          >
            {{ theme.badge }}
          </button>
        }
      </nav>

      <!-- HUD & Buttons -->
      <div class="hud-actions">
        <div class="counter-badge" title="Criaturas activas en la granja">
          <svg class="counter-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z"></path>
            <path d="M19 11v2a7 7 0 0 1-14 0v-2"></path>
          </svg>
          <span class="counter-num">{{ activeCreaturesCount() }} Digimons</span>
        </div>

        <button
          type="button"
          class="ctrl-btn btn-center"
          (click)="farmService.centerCamera()"
          title="Centrar la cámara en el medio del mapa"
        >
          Centrar
        </button>

        <button
          type="button"
          class="ctrl-btn btn-gather"
          (click)="farmService.callAllToCenter()"
          title="Llamar a todos los Digimons al centro"
        >
          Reunir
        </button>
      </div>
    </header>
  `,
  styleUrl: './farm-toolbar.css',
})
export class FarmToolbarComponent {
  readonly farmService = inject(FarmService);
  readonly digimonService = inject(DigimonService);

  readonly activeCreaturesCount = computed(() => {
    return this.digimonService.myDigimons().filter((d) => d.isWalking).length;
  });

  selectTheme(themeId: FarmThemeId): void {
    this.farmService.setTheme(themeId);
  }
}