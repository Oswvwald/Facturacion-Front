import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retryWhen, scan, delay } from 'rxjs/operators';
import { tap, catchError, retry  } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiFacturacionService {

  url: string = 'http://127.0.0.1:3000/';
  private baseUrl = '/api'; // Utiliza el proxy configurado
  // private apiUrl = 'https://api-modulo-seguridad.onrender.com/api';
  private functionalities: string[] = [];

  constructor(private api: HttpClient, private http: HttpClient, private Http: HttpClient) { }

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
  //Obtener un tipo de pago por id
  getTipoPagoById(id: string): Observable<any> {
    return this.api.get(this.url + 'tipoPago/' + id);
  }
  //Crear un tipo de pago
  createTipoPago(tipoPago: any): Observable<any> {
    return this.api.post(this.url + 'tipoPago', tipoPago);
  }
  //Editar un tipo de pago
  editTipoPago(id: string, tipoPago: any): Observable<any> {
    return this.api.put(this.url + 'tipoPago/' + id, tipoPago);
  }
  //Eliminar un tipo de pago
  deleteTipoPago(id: string): Observable<any> {
    return this.api.delete(this.url + 'tipoPago/' + id);
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
    return this.http.get(this.baseUrl + '/Producto').pipe(
      retryWhen(errors =>
        errors.pipe(
          // Utiliza scan para contar los reintentos
          scan((acc, error) => {
            if (acc >= 3) { // Si se han hecho 3 intentos, lanza un error
              throw error;
            }
            return acc + 1;
          }, 0),
          delay(1000) // Espera 1 segundo antes de cada reintento
        )
      )
    );
  }

  //Login
  //
  //Iniciar sesión
  login(username: string, password: string, moduleName: string): Observable<any> {
    return this.Http.post<any>('https://api-modulo-seguridad.onrender.com/api/login_module', {
      usr_user: username,
      usr_password: password,
      mod_name: moduleName
    }).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((acc, error) => {
            if (acc < 1) {
              return acc + 1;
            } else {
              throw error;
            }
          }, 0),
          delay(500) // Incrementa este valor exponencialmente si es necesario
        )
      ),
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('functionalities', JSON.stringify(response.functionalities));
        this.functionalities = response.functionalities;
      }),
      catchError(error => {
        // Manejo de errores
        if (error.status === 401) {
          return throwError("Error de autenticación. Por favor, intente de nuevo.");
        } else {
          return throwError("Ocurrió un error al intentar iniciar sesión. Por favor, intente de nuevo más tarde.");
        }
      })
    );
  }

  getFunctionalities(): string[] {
    if (this.functionalities.length === 0) {
      const storedFunctionalities = localStorage.getItem('functionalities');
      if (storedFunctionalities) {
        this.functionalities = JSON.parse(storedFunctionalities);
      }
    }
    return this.functionalities;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('functionalities');
    this.functionalities = [];
  }

}

