import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { ClientesViewComponent } from './clientes-view/clientes-view.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FacturaViewComponent } from './factura-view/factura-view.component';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { LoginComponent } from './login/login.component';
import { TipoPagoViewComponent } from './tipo-pago-view/tipo-pago-view.component';
import { PaginaPrincipalComponent } from './pagina-principal/pagina-principal.component';
import { DetalleFacturaComponent } from './detalle-factura/detalle-factura.component';

// Guards
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'clientes-view', component: ClientesViewComponent, canActivate: [AuthGuard], data: { expectedFunctionality: 'FACT-CLIEN' }},
  { path: 'sidebar', component: SidebarComponent },
  { path: 'facturas-view', component: FacturaViewComponent, canActivate: [AuthGuard], data: { expectedFunctionality: 'FACT-FTURA' }},
  { path: 'create-invoice', component: CreateInvoiceComponent, canActivate: [AuthGuard], data: { expectedFunctionality: 'FACT-FTURA' }},
  { path: 'detalle-factura/:id', component: DetalleFacturaComponent },
  { path: 'login', component: LoginComponent },
  { path: 'tipoPago-view', component: TipoPagoViewComponent, canActivate: [AuthGuard], data: { expectedFunctionality: 'FACT-TPAGO' }},
  { path: 'homePage', component: PaginaPrincipalComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
