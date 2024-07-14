import { Component, OnInit } from '@angular/core';
import { ApiFacturacionService } from '../services/api-facturacion.service';
import { MatDialog } from '@angular/material/dialog';
import { ClientDialogComponent } from '../client-dialog/client-dialog.component';

@Component({
  selector: 'app-clientes-view',
  templateUrl: './clientes-view.component.html',
  styleUrls: ['./clientes-view.component.css']
})
export class ClientesViewComponent implements OnInit {

  clientes: Array<any> = [];
  clientesFiltrados: Array<any> = [];
  buscarTexto: string = '';

  // Paginación Clientes
  clientesPorPagina: number = 2;
  paginaActual: number = 1;
  clientesMostrados: any[] = [];

  tipoPago: Array<any> = [];

  constructor(
    private api: ApiFacturacionService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getTipoPago();
  }

  // Filtrar clientes según el texto de búsqueda
  filtrarClientes() {
    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.nombres.toLowerCase().includes(this.buscarTexto.toLowerCase()) ||
      cliente.cedula.toLowerCase().includes(this.buscarTexto.toLowerCase()) ||
      cliente.apellidos.toLowerCase().includes(this.buscarTexto.toLowerCase())
    );
    this.actualizarClientesMostrados();
  }

  // Paginación de los clientes
  actualizarClientesMostrados() {
    const inicio = (this.paginaActual - 1) * this.clientesPorPagina;
    const fin = inicio + this.clientesPorPagina;
    this.clientesMostrados = this.clientesFiltrados.slice(inicio, fin);
  }

  cambiarPagina(nuevaPagina: number, event: any) {
    event.preventDefault(); // Evitar la navegación por defecto
    this.paginaActual = nuevaPagina;
    this.actualizarClientesMostrados();
  }

  getNumeroPaginas(): number[] {
    return Array(Math.ceil(this.clientesFiltrados.length / this.clientesPorPagina)).fill(0).map((x, i) => i + 1);
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
    this.api.getClients().subscribe((data: any) => {
      this.clientes = data.clientes.map((cliente: any) => {
        const tipoPago = this.tipoPago.find(tp => tp.tipo_code === cliente.tipo_cliente_id);
        return {
          ...cliente,
          tipoPagoNombre: tipoPago ? tipoPago.tipo : 'N/A'
        };
      });
      this.filtrarClientes();
    });
  }

  deleteCliente(cedula: string) {
    this.api.deleteClient(cedula).subscribe((data: any) => {
      this.getClientes();
    });
  }

  openDialog(cliente?: any, esEditar: boolean = false): void {
    const dialogRef = this.dialog.open(ClientDialogComponent, {
      data: { cliente: cliente, EditarVoF: esEditar, idTipoPago: cliente ? cliente.tipo_cliente_id : null }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      this.getClientes();
    });
  }
}
