import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiFacturacionService } from '../services/api-facturacion.service';

@Component({
  selector: 'app-detalle-factura',
  templateUrl: './detalle-factura.component.html',
  styleUrls: ['./detalle-factura.component.css']
})
export class DetalleFacturaComponent implements OnInit {
  facturaId: string;
  facturaDetalles: any = { detalle: [] }; // Inicializa facturaDetalles con un objeto vacío
  clienteDetalles: any = { detalle: [] }; // Inicializa clienteDetalles con un objeto vacío

  constructor(private route: ActivatedRoute, private api: ApiFacturacionService, private router: Router) { }

  ngOnInit(): void {
    this.facturaId = this.route.snapshot.paramMap.get('id') ?? '';
    this.obtenerDetallesFactura();
    this.obtenerProductosFactura();
  }

  obtenerProductosFactura() {
    this.api.verProductosFactura(this.facturaId).subscribe((data: any) => {
      console.log('Productos de la factura:', data.detallesFactura); // Depuración
      this.facturaDetalles.detalle = data.detallesFactura; // Asigna los productos a detalle dentro de facturaDetalles
    }, (error: any) => {
      console.error('Error al obtener productos de la factura', error);
    });
  }

  obtenerDetallesFactura() {
    this.api.getFacturaById(this.facturaId).subscribe((data: any) => {
      this.facturaDetalles = data.factura;
      console.log('Detalles de la factura:', this.facturaDetalles); // Depuración
      this.obtenerClienteDetalles(this.facturaDetalles.cedulaCliente);
    }, (error: any) => {
      console.error('Error al obtener detalles de la factura', error);
    });
  }

  obtenerClienteDetalles(cedula: string) {
    this.api.getClientByCedula(this.facturaDetalles.cedula_cliente).subscribe((data: any) => {
      this.clienteDetalles = data.cliente;
      console.log('Detalles del cliente:', this.clienteDetalles); // Depuración
    
    }, (error: any) => {
      console.error('Error al obtener detalles del cliente', error);
    });
  }

  imprimirFactura() {
    window.print();
  }

  editarFactura() {
    this.router.navigate(['/edit-invoice', this.facturaId]);
  }

  cancelarimpresion() {
    this.router.navigate(['/facturas-view']);
  }
}
