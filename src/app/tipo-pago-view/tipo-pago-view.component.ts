import { Component, OnInit } from '@angular/core';
import { ApiFacturacionService } from '../services/api-facturacion.service';
import { MatDialog } from '@angular/material/dialog';
import { TipoPagoDialogComponent } from '../tipo-pago-dialog/tipo-pago-dialog.component';

@Component({
  selector: 'app-tipo-pago-view',
  templateUrl: './tipo-pago-view.component.html',
  styleUrls: ['./tipo-pago-view.component.css']
})
export class TipoPagoViewComponent implements OnInit {

  tiposPago: Array<any> = [];

  constructor(private api: ApiFacturacionService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getTiposPago();
  }

  getTiposPago() {
    this.api.getTipoPago().subscribe((res: any) => {
      this.tiposPago = res.tipoPago;
    }, (error: any) => {
      console.log(error);
    });
  }

  deleteTipoPago(tipoCode: string) {
    this.api.deleteTipoPago(tipoCode).subscribe((data: any) => {
      this.getTiposPago();
    });
  }

  openDialog(tipoPago?: any, esEditar: boolean = false): void {
    const dialogRef = this.dialog.open(TipoPagoDialogComponent, {
      data: { tipoPago: tipoPago, EditarVoF: esEditar }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      this.getTiposPago();
    });
  }

}
