import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { InventoryItem, ItemCategory, UseItemResponse } from '../models/inventory.models';
import { MOCK_INVENTORY_ITEMS } from '../mocks/mock-data';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inventory`;

  readonly items = signal<InventoryItem[]>([]);
  readonly selectedCategory = signal<ItemCategory>('ALL');
  readonly selectedItem = signal<InventoryItem | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isDemoMode = signal<boolean>(false);

  readonly filteredItems = computed(() => {
    const cat = this.selectedCategory();
    const list = this.items();
    if (cat === 'ALL') return list;
    return list.filter((i) => i.category === cat);
  });

  loadInventory(force = false): Observable<InventoryItem[]> {
    if (!force && this.items().length > 0) {
      return of(this.items());
    }
    this.isLoading.set(true);
    return this.http.get<{ status: string; data: InventoryItem[] }>(`${this.apiUrl}/mine`).pipe(
      map((res) => res.data ?? []),
      tap((loaded) => {
        const useMock = loaded.length === 0;
        const finalData = useMock ? [...MOCK_INVENTORY_ITEMS] : loaded;
        this.isDemoMode.set(useMock);
        this.items.set(finalData);

        if (finalData.length > 0) {
          const current = this.selectedItem();
          const found = current ? finalData.find((i) => i.id === current.id) : null;
          this.selectedItem.set(found || finalData[0]);
        } else {
          this.selectedItem.set(null);
        }
        this.isLoading.set(false);
      }),
      catchError((err) => {
        console.warn('Error al conectar con backend de inventario, activando datos de prueba:', err);
        this.isDemoMode.set(true);
        this.items.set([...MOCK_INVENTORY_ITEMS]);
        this.selectedItem.set(MOCK_INVENTORY_ITEMS[0]);
        this.isLoading.set(false);
        return of([...MOCK_INVENTORY_ITEMS]);
      })
    );
  }

  useItemOnDigimon(digimonId: string, itemId: string): Observable<UseItemResponse> {
    const feedUrl = `${environment.apiUrl}/digimons/${digimonId}/feed`;
    return this.http.post<UseItemResponse>(feedUrl, { itemId }).pipe(
      tap(() => {
        this.consumeLocalItem(itemId);
      }),
      catchError(() => {
        // En modo prueba o si el endpoint aún no está disponible en la API
        this.consumeLocalItem(itemId);
        return of({
          status: 'success',
          message: 'Objeto utilizado localmente (modo prueba)',
          data: {
            digimonId,
            consumedItemId: itemId,
            remainingQuantity: 1,
            updatedHunger: 80,
            updatedFriendship: 80,
          },
        });
      })
    );
  }

  private consumeLocalItem(itemId: string): void {
    this.items.update((current) =>
      current
        .map((item) => (item.itemId === itemId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );

    const sel = this.selectedItem();
    if (sel && sel.itemId === itemId) {
      const updated = this.items().find((i) => i.itemId === itemId) ?? null;
      this.selectedItem.set(updated ?? (this.items()[0] || null));
    }
  }

  setCategory(cat: ItemCategory): void {
    this.selectedCategory.set(cat);
  }

  selectItem(item: InventoryItem | null): void {
    this.selectedItem.set(item);
  }
}
