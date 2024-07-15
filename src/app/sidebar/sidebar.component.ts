import { Component } from '@angular/core';
import { ApiFacturacionService } from '../services/api-facturacion.service'; // Ajusta la ruta según sea necesario
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  dropdownDisplay = 'none';
  sidebarExpanded = false;

  constructor(private apiFacturacionService: ApiFacturacionService, private router: Router) { }

  toggleDropdown(event: MouseEvent): void {
    event.preventDefault();
    this.dropdownDisplay = this.dropdownDisplay === 'none' ? 'block' : 'none';
  }

  toggleSidebar(): void {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  logout(): void {
    this.apiFacturacionService.logout();
    this.router.navigate(['/login']);
  }
}