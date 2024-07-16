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

  navigateToViewClients() {
    this.router.navigate(['/clientes-view']);
  }

  navigateToViewInvoices() {
    this.router.navigate(['/facturas-view']);
  }

  navigateToViewPaymentType() {
    this.router.navigate(['/tipoPago-view']);
  }

  navigateToHome() {
    this.router.navigate(['/homePage']);
  }

  navigateToView(functionalities: string[]) {
    if (functionalities.includes('FACT-CLIEN')) {
      this.navigateToViewClients();
    } else if (functionalities.includes('FACT-FTURA')) {
      this.navigateToViewInvoices();
    } else if (functionalities.includes('FACT-TPAGO')) {
      this.navigateToViewPaymentType();
    } else {
      this.navigateToHome();
    }
  }

  login(loginForm: NgForm) {
    if (loginForm.invalid) {
      this.errorMessage = 'Por favor, complete todos los campos requeridos.';
      return;
    }

    this.apiService.login(this.username, this.password, this.moduleName).subscribe({
      next: () => {
        const functionalities = this.apiService.getFunctionalities();
        this.navigateToView(functionalities);
      },
      error: (errorMessage) => this.errorMessage = errorMessage
    });
  }
}
