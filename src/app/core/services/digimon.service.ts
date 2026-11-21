import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { PlayerDigimon } from '../models/digimon.models';
import { MOCK_DIGIMONS } from '../mocks/mock-data';

@Injectable({
  providedIn: 'root',
})
export class DigimonService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/digimons`;

  readonly myDigimons = signal<PlayerDigimon[]>([]);
  readonly selectedDigimon = signal<PlayerDigimon | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isDemoMode = signal<boolean>(false);

  loadMyDigimons(force = false): Observable<PlayerDigimon[]> {
    if (!force && this.myDigimons().length > 0) {
      return of(this.myDigimons());
    }
    this.isLoading.set(true);
    return this.http.get<{ status: string; data: PlayerDigimon[] }>(`${this.apiUrl}/mine`).pipe(
      map((res) => res.data ?? []),
      tap((list) => {
        const useMock = list.length === 0;
        const finalData = useMock ? [...MOCK_DIGIMONS] : list;
        this.isDemoMode.set(useMock);
        this.myDigimons.set(finalData);

        if (finalData.length > 0) {
          const current = this.selectedDigimon();
          const found = current ? finalData.find((d) => d.id === current.id) : null;
          this.selectedDigimon.set(found || finalData[0]);
        } else {
          this.selectedDigimon.set(null);
        }
        this.isLoading.set(false);
      }),
      catchError((err) => {
        console.warn('Error al conectar con backend de Digimons, activando datos de prueba:', err);
        this.isDemoMode.set(true);
        this.myDigimons.set([...MOCK_DIGIMONS]);
        this.selectedDigimon.set(MOCK_DIGIMONS[0]);
        this.isLoading.set(false);
        return of([...MOCK_DIGIMONS]);
      })
    );
  }

  updateNickname(digimonId: string, newNickname: string): Observable<{ status: string; message: string }> {
    return this.http.patch<{ status: string; message: string }>(`${this.apiUrl}/${digimonId}`, { nickname: newNickname }).pipe(
      tap(() => {
        this.updateLocalNickname(digimonId, newNickname);
      }),
      catchError(() => {
        this.updateLocalNickname(digimonId, newNickname);
        return of({ status: 'success', message: 'Nombre actualizado localmente' });
      })
    );
  }

  private updateLocalNickname(digimonId: string, newNickname: string): void {
    this.myDigimons.update((list) =>
      list.map((d) => (d.id === digimonId ? { ...d, nickname: newNickname } : d))
    );
    const sel = this.selectedDigimon();
    if (sel && sel.id === digimonId) {
      this.selectedDigimon.set({ ...sel, nickname: newNickname });
    }
  }

  applyFeedUpdate(digimonId: string, hungerRestored: number, friendshipGain: number): void {
    this.myDigimons.update((list) =>
      list.map((d) => {
        if (d.id === digimonId) {
          return {
            ...d,
            hunger: Math.min(100, d.hunger + hungerRestored),
            friendship: Math.min(100, d.friendship + friendshipGain),
          };
        }
        return d;
      })
    );

    const sel = this.selectedDigimon();
    if (sel && sel.id === digimonId) {
      this.selectedDigimon.set({
        ...sel,
        hunger: Math.min(100, sel.hunger + hungerRestored),
        friendship: Math.min(100, sel.friendship + friendshipGain),
      });
    }
  }
}
