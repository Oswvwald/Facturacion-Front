import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiFacturacionService {

  url: string = 'http://127.0.0.1:3000/';
  private baseUrl = '/api'; // Utiliza el proxy configurado

  constructor(private api: HttpClient, private http: HttpClient) { }
  
  //Clientes
  //
  //Obtener todos los clientes
  getClients(): Observable<any> {
    return this.api.get(this.url + 'clientes');
  }

  //Obtener un cliente por cedula
  getClientByCedula(cedula: string): Observable<any> {
    return this.api.get(this.url + 'clientes/' + cedula);
  }

  //Crear un cliente
  createClient(cliente: any): Observable<any> {
    return this.api.post(this.url + 'clientes', cliente);
  }

  //Editar un cliente
  editClient(cedula: string, cliente: any): Observable<any> {
    return this.api.put(this.url + 'clientes/' + cedula, cliente);
  }

  //Eliminar un cliente
  deleteClient(cedula: string): Observable<any> {
    return this.api.delete(this.url + 'clientes/' + cedula);
  }

  //Tipo de pago
  //
  //Obtener todos los tipos de pago
  getTipoPago(): Observable<any> {
    return this.api.get(this.url + 'tipoPago');
  }

  //Facturas
  //
  //Obtener todas las facturas
  getFacturas(): Observable<any> {
    return this.api.get(this.url + 'facturas');
  }

  //Obtener una factura por id
  getFacturaById(id: string): Observable<any> {
    return this.api.get(this.url + 'facturas/' + id);
  }

  //Crear una factura
  createFactura(factura: any): Observable<any> {
    return this.api.post(this.url + 'facturas', factura);
  }

  //Productos
  //
  //Obtener todos los productos
  getProducts(): Observable<any> {
    return this.http.get(this.baseUrl + '/Producto');
  }
}
