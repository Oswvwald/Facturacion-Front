import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ApiFacturacionService } from './services/api-facturacion.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private authService: ApiFacturacionService, private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Redirige a una funcionalidad a la que sí tenga acceso
      const functionalities = this.authService.getFunctionalities();
      this.redirectToAccessibleFunctionality(functionalities);
      return false;
    }
    return true;
  }

  private redirectToAccessibleFunctionality(functionalities: string[]) {
    if (functionalities.includes('FACT-CLIEN')) {
      this.router.navigate(['/clientes-view']);
    } else if (functionalities.includes('FACT-FTURA')) {
      this.router.navigate(['/facturas-view']);
    } else if (functionalities.includes('FACT-TPAGO')) {
      this.router.navigate(['/tipoPago-view']);
    } else {
      this.router.navigate(['/homePage']);
    }
  }
}
