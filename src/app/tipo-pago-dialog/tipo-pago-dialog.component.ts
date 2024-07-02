import { Component, OnInit } from '@angular/core';
import { ApiFacturacionService } from '../services/api-facturacion.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-tipo-pago-dialog',
  templateUrl: './tipo-pago-dialog.component.html',
  styleUrls: ['./tipo-pago-dialog.component.css']
})
export class TipoPagoDialogComponent implements OnInit {

  tipo: string;
  tipo_code: string;
  descripcion: string;
  EditarVoF: boolean;

  constructor(
    private api: ApiFacturacionService,
    public dialogRef: MatDialogRef<TipoPagoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.tipoPago) {
      this.tipo = data.tipoPago.tipo;
      this.tipo_code = data.tipoPago.tipo_code;
      this.descripcion = data.tipoPago.descripcion;
    }
    this.EditarVoF = data.EditarVoF;
  }

  ngOnInit(): void {
  }

  saveTipoPago(){
    const tipoPago = {
      tipo: this.tipo,
      tipo_code: this.tipo_code,
      descripcion: this.descripcion
    };
    if (this.EditarVoF) {
      this.api.editTipoPago(this.tipo_code ,tipoPago).subscribe((data: any) => {
        this.dialogRef.close();
      });
    } else {
      this.api.createTipoPago(tipoPago).subscribe((data: any) => {
        this.dialogRef.close();
      });
    }
  }

  closeDialog(){
    this.dialogRef.close();
  }
      
}
