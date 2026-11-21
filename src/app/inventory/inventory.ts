import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../core/services/inventory.service';
import { DigimonService } from '../core/services/digimon.service';
import { ToastService } from '../core/services/toast.service';
import { IconComponent } from '../shared/components/icon/icon';
import type { ItemCategory, InventoryItem } from '../core/models/inventory.models';
import type { PlayerDigimon } from '../core/models/digimon.models';

interface SlotData {
  index: number;
  item: InventoryItem | null;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit {
  readonly inventoryService = inject(InventoryService);
  readonly digimonService = inject(DigimonService);
  readonly toast = inject(ToastService);

  readonly categories: { id: ItemCategory; label: string }[] = [
    { id: 'CONSUMIBLES', label: 'Consumibles' },
    { id: 'COMIDA', label: 'Comida' },
    { id: 'COSMETICOS', label: 'Cosmeticos' },
    { id: 'MUEBLES', label: 'Muebles' },
    { id: 'MISC', label: 'Misc' },
  ];

  readonly isSelectDigimonModalOpen = signal(false);

  readonly slots = computed<SlotData[]>(() => {
    const items = this.inventoryService.filteredItems();
    const totalCount = Math.max(30, Math.ceil(items.length / 6) * 6);
    const result: SlotData[] = [];
    for (let i = 0; i < totalCount; i++) {
      result.push({
        index: i,
        item: items[i] || null,
      });
    }
    return result;
  });

  ngOnInit(): void {
    this.inventoryService.setCategory('CONSUMIBLES');
    this.inventoryService.loadInventory().subscribe({
      next: (items) => {
        const found = items.find((i) => i.category === 'CONSUMIBLES') || items[0] || null;
        this.inventoryService.selectItem(found);
      },
    });
    this.digimonService.loadMyDigimons().subscribe();
  }

  onCategorySelect(cat: ItemCategory): void {
    this.inventoryService.setCategory(cat);
    const currentItems = this.inventoryService.filteredItems();
    this.inventoryService.selectItem(currentItems[0] || null);
  }

  onSelectItem(item: InventoryItem): void {
    this.inventoryService.selectItem(item);
  }

  openUseModal(): void {
    const item = this.inventoryService.selectedItem();
    if (!item || item.quantity <= 0) {
      this.toast.error('Inventario', 'No tienes unidades disponibles de este objeto.');
      return;
    }
    this.isSelectDigimonModalOpen.set(true);
  }

  closeUseModal(): void {
    this.isSelectDigimonModalOpen.set(false);
  }

  useItemOn(digimon: PlayerDigimon): void {
    const item = this.inventoryService.selectedItem();
    if (!item) return;

    this.inventoryService.useItemOnDigimon(digimon.id, item.itemId).subscribe({
      next: (res) => {
        this.digimonService.applyFeedUpdate(digimon.id, item.hungerRestore, item.friendshipGain);
        this.toast.success(
          'Objeto Usado',
          `Has usado ${item.name} en ${digimon.nickname}. ${item.hungerRestore ? `+${item.hungerRestore} Hambre ` : ''}${item.friendshipGain ? `+${item.friendshipGain} Bond` : ''}`
        );
        this.closeUseModal();
      },
      error: () => {
        this.toast.error('Error', 'No se ha podido utilizar el objeto.');
      },
    });
  }
}
