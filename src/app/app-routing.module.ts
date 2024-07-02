import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//components
import { ClientesViewComponent } from './clientes-view/clientes-view.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FacturaViewComponent } from './factura-view/factura-view.component';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { LoginComponent } from './login/login.component';
import { TipoPagoViewComponent } from './tipo-pago-view/tipo-pago-view.component';


const routes: Routes = [
  {path: 'clientes-view', component: ClientesViewComponent},
  {path: 'sidebar', component: SidebarComponent},
  {path: 'facturas-view', component: FacturaViewComponent},
  {path: 'create-invoice', component: CreateInvoiceComponent},
  {path: 'login', component: LoginComponent},
  {path: 'tipoPago-view', component: TipoPagoViewComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
