import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiFacturacionService } from '../services/api-facturacion.service';
 
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;
  moduleName: string = 'Facturación'; // Cambia esto por el nombre de tu módulo
  errorMessage: string = '';

  ngOnInit(): void {
  }
  constructor(private router: Router, private apiService: ApiFacturacionService) { }

  navigateToView() {
    this.router.navigate(['/clientes-view']); 
  }

  navigateToHome() {
    this.router.navigate(['/homePage']);
  }

  login() {
    this.apiService.login(this.username, this.password, this.moduleName).subscribe({
      next: (response) => {
        // Si el login es exitoso, navegar a la vista correspondiente
        this.navigateToView();
      },
      error: (errorMessage) => {
        // Mostrar el mensaje de error en la interfaz de usuario
        this.errorMessage = errorMessage;
      }
    });
  }
}
