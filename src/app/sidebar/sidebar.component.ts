import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  dropdownDisplay = 'none';
  sidebarExpanded = false;

  toggleDropdown(event: MouseEvent): void {
    event.preventDefault();
    this.dropdownDisplay = this.dropdownDisplay === 'none' ? 'block' : 'none';
  }

  toggleSidebar(): void {
    this.sidebarExpanded = !this.sidebarExpanded;
  }
}