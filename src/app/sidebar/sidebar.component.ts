import { Component, OnInit } from '@angular/core';
import { ApiFacturacionService } from '../services/api-facturacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  dropdownDisplay = 'none';
  sidebarExpanded = false;
  functionalities: string[] = [];

  constructor(private apiFacturacionService: ApiFacturacionService, private router: Router) {}

  ngOnInit(): void {
    this.functionalities = this.apiFacturacionService.getFunctionalities();
  }

  toggleDropdown(event: MouseEvent): void {
    event.preventDefault();
    this.dropdownDisplay = this.dropdownDisplay === 'none' ? 'block' : 'none';
  }

  toggleSidebar(): void {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  hasFunctionality(expectedFunctionality: string): boolean {
    return this.functionalities.includes(expectedFunctionality);
  }

  logout(): void {
    this.apiFacturacionService.logout();
    this.router.navigate(['/login']);
  }
}
