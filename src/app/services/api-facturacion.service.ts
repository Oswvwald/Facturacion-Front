import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retryWhen, scan, delay } from 'rxjs/operators';
import { tap, catchError, retry  } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiFacturacionService {

  url: string = 'http://45.70.13.48:3000/';
  private baseUrl = '/api'; // Utiliza el proxy configurado
  private loginApi = 'https://api-modulo-seguridad.onrender.com/api/';
  private auditApi = 'https://api-modulo-seguridad.onrender.com/api/auditoria'; 
  private functionalities: string[] = [];
  private userloged : string;

  constructor(private api: HttpClient, private http: HttpClient) { }

  //Auditoria
  private sendAudit(aud_usuario: string, aud_accion: string, aud_modulo: string, aud_funcionalidad: string, aud_observacion: string): Observable<any> {
    const auditData = { aud_usuario, aud_accion, aud_modulo, aud_funcionalidad, aud_observacion };
    return this.http.post(this.auditApi, auditData).pipe(
      catchError(error => {
        console.error('Error enviando auditoría:', error);
        return throwError('Error enviando auditoría.');
      })
    );
  }
  

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
    return this.api.post(this.url + 'clientes', cliente).pipe(
      tap(() => {
        this.sendAudit(this.userloged, 'create', 'Facturación', 'clientes', 'Creación de cliente').subscribe();
      }),
      catchError(error => {
        this.sendAudit(this.userloged, 'create', 'Facturación', 'clientes', `Error: ${error.message}`).subscribe();
        return throwError(error);
      })
    );
  }

  //Editar un cliente
  editClient(cedula: string, cliente: any): Observable<any> {
    return this.api.put(this.url + 'clientes/' + cedula, cliente).pipe(
      tap(() => {
        this.sendAudit(this.userloged, 'edit', 'Facturación', 'clientes', `Edición de cliente con cédula: ${cedula}`).subscribe();
      }),
      catchError(error => {
        this.sendAudit(this.userloged, 'edit', 'Facturación', 'clientes', `Error: ${error.message}`).subscribe();
        return throwError(error);
      })
    );
  }

  //Eliminar un cliente
  deleteClient(cedula: string): Observable<any> {
    return this.api.delete(this.url + 'clientes/' + cedula).pipe(
      tap(() => {
        this.sendAudit(this.userloged, 'delete', 'Facturación', 'clientes', `Eliminación de cliente con cédula: ${cedula}`).subscribe();
      }),
      catchError(error => {
        this.sendAudit(this.userloged, 'delete', 'Facturación', 'clientes', `Error: ${error.message}`).subscribe();
        return throwError(error);
      })
    );
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
    return this.http.post<any>(this.loginApi + 'login_module', {
      usr_user: username,
      usr_password: password,
      mod_name: moduleName
    }).pipe(
      tap(response => {
        // Verifica si el rol es uno de los permitidos
        const allowedRoles = ['FAC-ADMIN', 'FAC-FACTURADOR'];
        const userRole = response.Role;
        const hasAllowedRole = userRole.some((role: string) => allowedRoles.includes(role));
  
        if (!hasAllowedRole) {
          // Si el usuario no tiene un rol permitido, lanza un error
          throw new Error('Rol no permitido. Acceso denegado.');
        }
        
        this.userloged = username;
        // Si el rol es permitido, guarda el token y las funcionalidades
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('functionalities', JSON.stringify(response.functionalities));
        localStorage.setItem('role', JSON.stringify(response.Role));
        this.functionalities = response.functionalities;
      }),
      catchError(error => {
        // Maneja errores de autenticación y otros errores
        const errorMsg = error.status === 401
          ? "Error de autenticación. Por favor, intente de nuevo."
          : "Ocurrió un error al intentar iniciar sesión. Por favor, intente de nuevo más tarde.";
        return throwError(errorMsg);
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

