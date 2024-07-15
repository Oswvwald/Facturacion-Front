import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importamos ReactiveFormsModule
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete'; // Importamos MatAutocompleteModule
import { MatInputModule } from '@angular/material/input'; // Importamos MatInputModule

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClientesViewComponent } from './clientes-view/clientes-view.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ClientDialogComponent } from './client-dialog/client-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FacturaViewComponent } from './factura-view/factura-view.component';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login/login.component';
import { TipoPagoViewComponent } from './tipo-pago-view/tipo-pago-view.component';
import { TipoPagoDialogComponent } from './tipo-pago-dialog/tipo-pago-dialog.component';
import { PaginaPrincipalComponent } from './pagina-principal/pagina-principal.component';
import { AuthInterceptor } from './auth.interceptor'; // Importamos el interceptor
import { DetalleFacturaComponent } from './detalle-factura/detalle-factura.component';

@NgModule({
  declarations: [
    AppComponent,
    ClientesViewComponent,
    SidebarComponent,
    ClientDialogComponent,
    FacturaViewComponent,
    CreateInvoiceComponent,
    LoginComponent,
    TipoPagoViewComponent,
    TipoPagoDialogComponent,
    PaginaPrincipalComponent,
    DetalleFacturaComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule, // Añadimos ReactiveFormsModule
    HttpClientModule,
    MatDialogModule,
    MatFormFieldModule,
    MatAutocompleteModule, // Añadimos MatAutocompleteModule
    MatInputModule, // Añadimos MatInputModule
    BrowserAnimationsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // Registramos el interceptor
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
