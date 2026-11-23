import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FarmService } from '../../../core/services/farm.service';
import { DigimonService } from '../../../core/services/digimon.service';
import { ToastService } from '../../../core/services/toast.service';
import { PlayerDigimon } from '../../../core/models/digimon.models';

@Component({
  selector: 'app-farm-digimon-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (farmService.selectedEntity(); as digimon) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div class="card-popover" role="dialog" aria-modal="true" aria-label="Ficha de interacción rápida">
          <!-- Header -->
          <div class="card-header">
            <div class="species-tag">{{ digimon.generation }} · {{ digimon.attribute }}</div>
            <button type="button" class="btn-close" (click)="closeModal()" aria-label="Cerrar">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="card-body">
            <div class="sprite-wrapper">
              <img
                [src]="digimon.spriteUrl || digimon.fullImageUrl"
                [alt]="digimon.nickname"
                class="digimon-sprite"
              />
            </div>

            <div class="info-block">
              <h3 class="digimon-nickname">{{ digimon.nickname }}</h3>
              <p class="species-name">{{ digimon.speciesName }}</p>
              <div class="level-badge">Nivel {{ digimon.level }}</div>
            </div>
          </div>

          <!-- Status -->
          <div class="status-bars">
            <div class="bar-group">
              <div class="bar-label">
                <span> Hambre</span>
                <span class="bar-val">{{ digimon.hunger }}%</span>
              </div>
              <div class="bar-track">
                <div
                  class="bar-fill hunger-fill"
                  [style.width.%]="digimon.hunger"
                  [class.warning]="digimon.hunger < 25"
                ></div>
              </div>
            </div>

            <div class="bar-group">
              <div class="bar-label">
                <span>Amistad</span>
                <span class="bar-val">{{ digimon.friendship }}%</span>
              </div>
              <div class="bar-track">
                <div
                  class="bar-fill friendship-fill"
                  [style.width.%]="digimon.friendship"
                ></div>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="action-buttons">
            <button
              type="button"
              class="btn-action btn-feed"
              (click)="feedDigimon(digimon.id, digimon.nickname)"
              [disabled]="digimon.hunger >= 100"
            >
              Dar Comida
            </button>

            <button
              type="button"
              class="btn-action btn-pet"
              (click)="petDigimon(digimon.id, digimon.nickname)"
              [disabled]="digimon.friendship >= 100"
            >
              Acariciar
            </button>

            <button
              type="button"
              class="btn-action btn-inspect"
              (click)="viewFullSheet(digimon)"
            >
              Ficha Completa
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './farm-digimon-modal.css',
})
export class FarmDigimonModalComponent {
  readonly farmService = inject(FarmService);
  readonly digimonService = inject(DigimonService);
  readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  closeModal(): void {
    this.farmService.selectDigimon(null);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  feedDigimon(id: string, name: string): void {
    this.digimonService.applyFeedUpdate(id, 25, 5);
    this.toastService.success(
      '¡Alimentado con éxito!',
      `${name} ha comido con ganas y recuperó saciedad.`
    );
  }

  petDigimon(id: string, name: string): void {
    this.digimonService.applyFeedUpdate(id, 0, 10);
    this.toastService.info(
      '¡Caricia reconfortante!',
      `El vínculo con ${name} se ha fortalecido.`
    );
  }

  viewFullSheet(digimon: PlayerDigimon): void {
    this.digimonService.selectedDigimon.set(digimon);
    this.closeModal();
    this.router.navigate(['/digimon']);
  }
}