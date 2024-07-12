import { Component, OnInit } from '@angular/core';
import { ApiFacturacionService } from '../services/api-facturacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-factura-view',
  templateUrl: './factura-view.component.html',
  styleUrls: ['./factura-view.component.css']
})
export class FacturaViewComponent implements OnInit {
  //Facturas
  facturas: Array<any> = [];
  facturasFiltradas: Array<any> = [];
  buscarTexto: string = '';

  //Paginación Facturas
  facturasPorPagina: number = 2;
  paginaActual: number = 1;
  facturasMostradas: any[] = [];

  tipoPago: Array<any> = [];
  clientes: Array<any> = [];
  clientesFactura: Array<any> = [];
  facturasImprimir: Array<any> = [];
  detalleFactura: Array<any> = [];

  constructor(private api: ApiFacturacionService, private router: Router) {
    //Actualización de las facturas mostradas 
    this.actualizarFacturasMostradas();
  }

  ngOnInit(): void {
    this.getTipoPago();
  }

  crearFactura() {
    this.router.navigate(['/create-invoice']);
  }

  // Filtrar facturas según el texto de búsqueda
  filtrarFacturas() {
    this.facturasFiltradas = this.facturas.filter(factura =>
      factura.NombresCliente.toLowerCase().includes(this.buscarTexto.toLowerCase()) ||
      factura.factura_id.toLowerCase().includes(this.buscarTexto.toLowerCase())
    );
    this.actualizarFacturasMostradas();
  }

  // Paginación de las facturas
  actualizarFacturasMostradas() {
    const inicio = (this.paginaActual - 1) * this.facturasPorPagina;
    const fin = inicio + this.facturasPorPagina;
    this.facturasMostradas = this.facturasFiltradas.slice(inicio, fin);
  }

  cambiarPagina(nuevaPagina: number, event: any) {
    event.preventDefault(); // Evitar la navegación por defecto
    this.paginaActual = nuevaPagina;
    this.actualizarFacturasMostradas();
  }

  getNumeroPaginas(): number[] {
    return Array(Math.ceil(this.facturasFiltradas.length / this.facturasPorPagina)).fill(0).map((x, i) => i + 1);
  }

  getTipoPago() {
    this.api.getTipoPago().subscribe((res: any) => {
      this.tipoPago = res.tipoPago;
      this.getClientes();
    }, (error: any) => {
      console.log(error);
    });
  }

  getClientes() {
    this.api.getClients().subscribe((res: any) => {
      this.clientes = res.clientes;
      this.getFacturas();
    }, (error: any) => {
      console.log(error);
    });
  }

  setImprimirFactura(cedula: string, facturaId: string) {
    this.api.getClientByCedula(cedula).subscribe((data: any) => {
      this.clientesFactura = data.cliente;
    });
    this.api.getFacturaById(facturaId).subscribe((data: any) => {
      this.facturasImprimir = data.factura;
    });
  }

  getFacturas() {
    this.api.getFacturas().subscribe((data: any) => {
      this.facturas = data.facturas.map((factura: any) => {
        const tipoPago = this.tipoPago.find(tp => tp.tipo_code === factura.tipo_pago);
        const NombresCliente = this.clientes.find(c => c.cedula === factura.cedula_cliente);
        return {
          ...factura,
          tipoPagoNombre: tipoPago ? tipoPago.tipo : 'N/A',
          NombresCliente: NombresCliente ? `${NombresCliente.nombres} ${NombresCliente.apellidos}` : 'N/A'
        };
      });
      this.filtrarFacturas();
    }, (error: any) => {
      console.log(error);
    });
  }
}
