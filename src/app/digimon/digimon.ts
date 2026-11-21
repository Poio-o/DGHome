import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DigimonService } from '../core/services/digimon.service';
import { IconComponent } from '../shared/components/icon/icon';
import type { PlayerDigimon } from '../core/models/digimon.models';

@Component({
  selector: 'app-digimon',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './digimon.html',
  styleUrl: './digimon.css',
})
export class Digimon implements OnInit {
  readonly digimonService = inject(DigimonService);

  readonly searchQuery = signal('');
  readonly isFiltersOpen = signal(false);

  readonly filterGeneration = signal('ALL');
  readonly filterType = signal('ALL');
  readonly filterAttribute = signal('ALL');
  readonly sortOption = signal<'default' | 'level-desc' | 'level-asc' | 'hunger-desc' | 'hunger-asc'>('default');

  readonly generationOptions = ['ALL', 'Baby I', 'Baby II', 'Rookie', 'Champion', 'Ultimate', 'Mega'];
  readonly typeOptions = ['ALL', 'Dragon', 'Beast', 'Machine', 'Mago', 'Reptile', 'Insect', 'Angel', 'Cyborg', 'Ghost'];
  readonly attributeOptions = ['ALL', 'Vaccine', 'Virus', 'Data', 'Free'];

  readonly filteredDigimons = computed(() => {
    let list = [...this.digimonService.myDigimons()];

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(
        (d) =>
          d.nickname.toLowerCase().includes(q) ||
          d.speciesName.toLowerCase().includes(q)
      );
    }

    const gen = this.filterGeneration();
    if (gen !== 'ALL') {
      list = list.filter((d) => d.generation.toLowerCase() === gen.toLowerCase());
    }

    const t = this.filterType();
    if (t !== 'ALL') {
      list = list.filter((d) => d.type.toLowerCase() === t.toLowerCase());
    }

    const attr = this.filterAttribute();
    if (attr !== 'ALL') {
      list = list.filter((d) => d.attribute.toLowerCase() === attr.toLowerCase());
    }

    const sort = this.sortOption();
    if (sort === 'level-desc') {
      list.sort((a, b) => b.level - a.level);
    } else if (sort === 'level-asc') {
      list.sort((a, b) => a.level - b.level);
    } else if (sort === 'hunger-desc') {
      list.sort((a, b) => b.hunger - a.hunger);
    } else if (sort === 'hunger-asc') {
      list.sort((a, b) => a.hunger - b.hunger);
    }

    return list;
  });

  readonly selectedDigimon = computed(() => {
    const sel = this.digimonService.selectedDigimon();
    if (sel) return sel;
    const all = this.digimonService.myDigimons();
    return all.length > 0 ? all[0] : null;
  });

  ngOnInit(): void {
    this.digimonService.loadMyDigimons().subscribe();
  }

  selectDigimon(d: PlayerDigimon): void {
    this.digimonService.selectedDigimon.set(d);
  }

  toggleFilters(): void {
    this.isFiltersOpen.update((v) => !v);
  }

  resetFilters(): void {
    this.filterGeneration.set('ALL');
    this.filterType.set('ALL');
    this.filterAttribute.set('ALL');
    this.sortOption.set('default');
    this.searchQuery.set('');
  }
}
