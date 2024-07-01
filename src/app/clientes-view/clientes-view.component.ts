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
  tipoPago: Array<any> = [];

  constructor(
    private api: ApiFacturacionService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getTipoPago(); // Asegúrate de obtener los tipos de pago primero
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
    });
  }

  getTipoPago() {
    this.api.getTipoPago().subscribe((res: any) => {
      this.tipoPago = res.tipoPago;
      this.getClientes(); // Obtener clientes después de cargar los tipos de pago
    }, (error: any) => {
      console.log(error);
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
