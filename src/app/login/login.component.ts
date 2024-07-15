import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ApiFacturacionService } from '../services/api-facturacion.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  moduleName: string = 'Facturación';
  errorMessage: string = '';

  constructor(private router: Router, private apiService: ApiFacturacionService) {}

  ngOnInit(): void {}

  navigateToView() {
    this.router.navigate(['/clientes-view']);
  }

  navigateToHome() {
    this.router.navigate(['/homePage']);
  }

  login(loginForm: NgForm) {
    if (loginForm.invalid) {
      this.errorMessage = 'Por favor, complete todos los campos requeridos.';
      return;
    }

    this.apiService.login(this.username, this.password, this.moduleName).subscribe({
      next: () => this.navigateToView(),
      error: (errorMessage) => this.errorMessage = errorMessage
    });
  }
}
