import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/components/icon/icon';
import { FarmCanvasComponent } from '../shared/components/farm/farm-canvas';
import { FarmToolbarComponent } from '../shared/components/farm/farm-toolbar';
import { FarmDigimonModalComponent } from '../shared/components/farm/farm-digimon-modal';
import { DigimonService } from '../core/services/digimon.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IconComponent, RouterLink, FarmCanvasComponent, FarmToolbarComponent, FarmDigimonModalComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly digimonService = inject(DigimonService);

  ngOnInit(): void {
    this.digimonService.loadMyDigimons().subscribe();
  }
}
