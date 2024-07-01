import { Component, OnInit } from '@angular/core';
import { ApiFacturacionService } from '../services/api-facturacion.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-client-dialog',
  templateUrl: './client-dialog.component.html',
  styleUrls: ['./client-dialog.component.css']
})
export class ClientDialogComponent implements OnInit {

  cedula: string;
  nombres: string;
  apellidos: string;
  fecha_Nacimiento: Date;
  direccion: string;
  telefono: string;
  email: string;
  id_tipo_pago: number;
  estado: boolean = false; // Inicializar en false
  editarVoF: boolean;

  tipoPago: Array<any> = [];

  constructor(
    private api: ApiFacturacionService,
    public dialogRef: MatDialogRef<ClientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.cliente) {
      this.cedula = data.cliente.cedula;
      this.nombres = data.cliente.nombres;
      this.apellidos = data.cliente.apellidos;
      this.fecha_Nacimiento = data.cliente.fecha_nacimiento;
      this.direccion = data.cliente.direccion;
      this.telefono = data.cliente.telefono;
      this.email = data.cliente.email;
      this.id_tipo_pago = data.cliente.tipo_cliente_id;
      this.estado = data.cliente.estado;
    }
    this.editarVoF = data.EditarVoF;
  }

  ngOnInit(): void {
    this.getTipoPago();
  }

  saveClient(){
    const cliente = {
      cedula: this.cedula,
      nombres: this.nombres,
      apellidos: this.apellidos,
      fecha_nacimiento: this.fecha_Nacimiento,
      direccion: this.direccion,
      telefono: this.telefono,
      email: this.email,
      id_tipo_pago: this.id_tipo_pago,
      estado: this.estado
    };

    if(this.editarVoF){
      this.api.editClient(this.cedula, cliente).subscribe((res: any) => {
        console.log('Cliente editado exitosamente');
      }, (error: any) => {
        console.log(error);
      });
    } else {
      this.api.createClient(cliente).subscribe((res: any) => {
        console.log('Cliente creado exitosamente');
      }, (error: any) => {
        console.log(error);
      });
    }
    this.dialogRef.close();
  }

  closeDialog(){
    this.dialogRef.close();
  }

  getTipoPago(){
    this.api.getTipoPago().subscribe((res: any) => {
      this.tipoPago = res.tipoPago;
    }, (error: any) => {
      console.log(error);
    });
  }
}
