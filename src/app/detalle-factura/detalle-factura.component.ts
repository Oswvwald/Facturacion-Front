import { Component, OnInit } from '@angular/core';
import { ApiFacturacionService } from '../services/api-facturacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detalle-factura',
  templateUrl: './detalle-factura.component.html',
  styleUrls: ['./detalle-factura.component.css']
})
export class DetalleFacturaComponent {
  
  facturas: Array<any> = [];
  tipoPago: Array<any> = [];
  clientes: Array<any> = [];

  constructor(private api: ApiFacturacionService, private router: Router) { }

  ngOnInit(): void {
    this.getTipoPago();
  }

  

  crearFactura(){
    this.router.navigate(['/create-invoice']);
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
    }, (error: any) => {
      console.log(error);
    });
  }
}



