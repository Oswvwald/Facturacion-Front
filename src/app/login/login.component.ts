import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private router: Router) {}

  // Paso 3: Crear la función para manejar el clic
  navigateToView() {
    this.router.navigate(['/clientes-view']); // Reemplaza '/ruta-deseada' con la ruta a la que quieres redirigir
  }
}
