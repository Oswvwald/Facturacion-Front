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
  tiposPagoFiltrados: Array<any> = [];
  buscarTexto: string = '';

  // Paginación Tipos de Pago
  tiposPagoPorPagina: number = 10; // Valor inicial por defecto
  paginaActual: number = 1;
  tiposPagoMostrados: any[] = [];

  constructor(private api: ApiFacturacionService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getTiposPago();
  }

  // Filtrar tipos de pago según el texto de búsqueda
  filtrarTiposPago() {
    this.tiposPagoFiltrados = this.tiposPago.filter(tipoPago =>
      tipoPago.tipo.toLowerCase().includes(this.buscarTexto.toLowerCase()) ||
      tipoPago.descripcion.toLowerCase().includes(this.buscarTexto.toLowerCase())
    );
    this.actualizarTiposPagoMostrados();
  }

  // Paginación de los tipos de pago
  actualizarTiposPagoMostrados() {
    const inicio = (this.paginaActual - 1) * this.tiposPagoPorPagina;
    const fin = inicio + this.tiposPagoPorPagina;
    this.tiposPagoMostrados = this.tiposPagoFiltrados.slice(inicio, fin);
  }

  cambiarPagina(nuevaPagina: number, event: any) {
    event.preventDefault(); // Evitar la navegación por defecto
    this.paginaActual = nuevaPagina;
    this.actualizarTiposPagoMostrados();
  }

  cambiarRegistrosPorPagina(cantidad: number) {
    this.tiposPagoPorPagina = cantidad;
    this.paginaActual = 1; // Resetear a la primera página
    this.actualizarTiposPagoMostrados();
  }

  getNumeroPaginas(): number[] {
    return Array(Math.ceil(this.tiposPagoFiltrados.length / this.tiposPagoPorPagina)).fill(0).map((x, i) => i + 1);
  }

  getTiposPago() {
    this.api.getTipoPago().subscribe((res: any) => {
      this.tiposPago = res.tipoPago;
      this.filtrarTiposPago();
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
