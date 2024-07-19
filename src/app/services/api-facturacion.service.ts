import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retryWhen, scan, delay } from 'rxjs/operators';
import { tap, catchError, retry } from 'rxjs/operators';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiFacturacionService {

  url: string = 'http://45.70.13.48:3000/';
  private baseUrl = '/api'; // Este es el que usa el proxies.conf.json
  private loginApi = 'https://api-modulo-seguridad.onrender.com/api/login_module';
  private auditApi = 'https://api-modulo-seguridad.onrender.com/api/auditoria';
  private userApi: string = 'https://api-modulo-seguridad.onrender.com/api/myuser';

  private functionalities: string[] = [];
  private userloged: string;

  constructor(private api: HttpClient, private http: HttpClient) { }

  // Auditoría
  private sendAudit(auditoriaData: {
    aud_usuario: string,
    aud_accion: string,
    aud_modulo: string,
    aud_funcionalidad: string,
    aud_observacion: string
  }): Observable<any> {
    return this.http.post(this.auditApi, auditoriaData);
  }

  private getAuthToken(): string {
    return localStorage.getItem('access_token') || '';
  }

  getUserLoggedId(): void {
    const authToken = this.getAuthToken();
    const headers = { 'Authorization': `Bearer ${authToken}` };

    this.http.get<{ usr_id: string }>(this.userApi, { headers }).pipe(
      map(response => response.usr_id),
      catchError(error => {
        console.error('Error al obtener el ID del usuario logueado:', error);
        return throwError(error); // Asegúrate de importar throwError de 'rxjs'
      })
    ).subscribe(usr_id => {
      localStorage.setItem('user', usr_id);
    });
  }

  get userLogged(): string {
    return localStorage.getItem('user') || '';
  }

  // Clientes
  getClients(): Observable<any> {
    return this.api.get(this.url + 'clientes');
  }

  getClientByCedula(cedula: string): Observable<any> {
    return this.api.get(this.url + 'clientes/' + cedula);
  }

  createClient(cliente: any): Observable<any> {
    this.userloged = this.userLogged;
    return this.api.post(this.url + 'clientes', cliente).pipe(
      tap(() => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'create',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'clientes',
          aud_observacion: `Creación de cliente con cédula: ${cliente.cedula}`
        }).subscribe();
      })
    );
  }

  editClient(cedula: string, cliente: any): Observable<any> {
    this.userloged = this.userLogged;
    return this.api.put(this.url + 'clientes/' + cedula, cliente).pipe(
      tap(() => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'edit',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'clientes',
          aud_observacion: `Edición de cliente con cédula: ${cedula}`
        }).subscribe();
      }),
      catchError(error => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'edit',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'clientes',
          aud_observacion: `Error: ${error.message}`
        }).subscribe();
        return throwError(error);
      })
    );
  }

  deleteClient(cedula: string): Observable<any> {
    this.userloged = this.userLogged;
    return this.api.delete(this.url + 'clientes/' + cedula).pipe(
      tap(() => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'delete',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'clientes',
          aud_observacion: `Eliminación de cliente con cédula: ${cedula}`
        }).subscribe();
      }),
      catchError(error => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'delete',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'clientes',
          aud_observacion: `Error: ${error.message}`
        }).subscribe();
        return throwError(error);
      })
    );
  }

  // Tipo de pago
  getTipoPago(): Observable<any> {
    return this.api.get(this.url + 'tipoPago');
  }

  getTipoPagoById(id: string): Observable<any> {
    return this.api.get(this.url + 'tipoPago/' + id);
  }

  createTipoPago(tipoPago: any): Observable<any> {
    this.userloged = this.userLogged;
    return this.api.post(this.url + 'tipoPago', tipoPago).pipe(
      tap(() => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'create',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'tipoPago',
          aud_observacion: `Creación de tipo de pago: ${tipoPago.nombre}`
        }).subscribe();
      })
    );
  }

  editTipoPago(id: string, tipoPago: any): Observable<any> {
    this.userloged = this.userLogged;
    return this.api.put(this.url + 'tipoPago/' + id, tipoPago).pipe(
      tap(() => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'edit',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'tipoPago',
          aud_observacion: `Edición de tipo de pago con ID: ${id}`
        }).subscribe();
      })
    );
  }

  deleteTipoPago(id: string): Observable<any> {
    this.userloged = this.userLogged;
    return this.api.delete(this.url + 'tipoPago/' + id).pipe(
      tap(() => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'delete',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'tipoPago',
          aud_observacion: `Eliminación de tipo de pago con ID: ${id}`
        }).subscribe();
      })
    );
  }

  // Facturas
  getFacturas(): Observable<any> {
    return this.api.get(this.url + 'facturas');
  }

  getFacturaById(id: string): Observable<any> {
    return this.api.get(this.url + 'facturas/' + id);
  }

  getFacturaCompletaById(id: string): Observable<any> {
    return this.api.get(`${this.url}facturas/${id}/completa`).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((acc, error) => {
            if (acc >= 3) {
              throw error;
            }
            return acc + 1;
          }, 0),
          delay(1000)
        )
      )
    );
  }

  getProductosPorFactura(facturaId: string): Observable<any> {
    return this.http.get(`${this.url}detalle_factura/detalles_por_factura/${facturaId}`).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((acc, error) => {
            if (acc >= 3) {
              throw error;
            }
            return acc + 1;
          }, 0),
          delay(1000)
        )
      )
    );
  }

  getFacturaDetallesById(facturaId: string): Observable<any> {
    return this.api.get(`${this.url}detalle_factura/detalles_por_factura/${facturaId}`).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((acc, error) => {
            if (acc >= 3) {
              throw error;
            }
            return acc + 1;
          }, 0),
          delay(1000)
        )
      )
    );
  }

  createFactura(factura: any): Observable<any> {
    this.userloged = this.userLogged;
    return this.api.post(this.url + 'facturas', factura).pipe(
      tap((response) => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'create',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'facturas',
          aud_observacion: `Creación de factura con ID: ${factura.factura_id}`
        }).subscribe();
      })
    );
  }

  getFactura(id: string): Observable<any> {
    return this.api.get(this.url + 'facturas/' + id);
  }

  editFactura(id: string, factura: any): Observable<any> {
    this.userloged = this.userLogged;
    return this.api.put(this.url + 'facturas/' + id, factura).pipe(
      tap(() => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'edit',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'facturas',
          aud_observacion: `Edición de factura con ID: ${id}`
        }).subscribe();
      }),
      catchError(error => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'edit',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'facturas',
          aud_observacion: `Error: ${error.message}`
        }).subscribe();
        return throwError(error);
      })
    );
  }

  deleteFactura(id: string): Observable<any> {
    this.userloged = this.userLogged;
    return this.api.delete(this.url + 'facturas/' + id).pipe(
      tap(() => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'delete',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'facturas',
          aud_observacion: `Eliminación de factura con ID: ${id}`
        }).subscribe();
      }),
      catchError(error => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'delete',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'facturas',
          aud_observacion: `Error: ${error.message}`
        }).subscribe();
        return throwError(error);
      })
    );
  }

  createDetalleFactura(detalleFactura: any): Observable<any> {
    this.userloged = this.userLogged;
    return this.api.post(this.url + 'detalle_factura', detalleFactura).pipe(
      tap(() => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'create',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'detalle_factura',
          aud_observacion: `Creación de detalle de factura con ID: ${detalleFactura.detalle_factura_id}`
        }).subscribe();
      })
    );
  }

  getDetalleFacturaById(id: string): Observable<any> {
    return this.api.get(this.url + 'detalle_factura/' + id);
  }

  editDetalleFactura(id: string, detalleFactura: any): Observable<any> {
    this.userloged = this.userLogged;
    return this.api.put(this.url + 'detalle_factura/' + id, detalleFactura).pipe(
      tap(() => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'edit',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'detalle_factura',
          aud_observacion: `Edición de detalle de factura con ID: ${id}`
        }).subscribe();
      }),
      catchError(error => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'edit',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'detalle_factura',
          aud_observacion: `Error: ${error.message}`
        }).subscribe();
        return throwError(error);
      })
    );
  }

  deleteDetalleFactura(id: string): Observable<any> {
    this.userloged = this.userLogged;
    return this.api.delete(this.url + 'detalle_factura/' + id).pipe(
      tap(() => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'delete',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'detalle_factura',
          aud_observacion: `Eliminación de detalle de factura con ID: ${id}`
        }).subscribe();
      }),
      catchError(error => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'delete',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'detalle_factura',
          aud_observacion: `Error: ${error.message}`
        }).subscribe();
        return throwError(error);
      })
    );
  }

  deleteDetallesFacturaPorFacturaId(facturaId: string): Observable<any> {
    this.userloged = this.userLogged;
    return this.api.delete(this.url + 'detalle_factura/factura/' + facturaId).pipe(
      tap(() => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'delete',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'detalle_factura',
          aud_observacion: `Eliminación de detalles de factura con ID de factura: ${facturaId}`
        }).subscribe();
      }),
      catchError(error => {
        this.sendAudit({
          aud_usuario: this.userloged,
          aud_accion: 'delete',
          aud_modulo: 'Facturación',
          aud_funcionalidad: 'detalle_factura',
          aud_observacion: `Error: ${error.message}`
        }).subscribe();
        return throwError(error);
      })
    );
  }

  verProductosFactura(facturaId: string): Observable<any> {
    return this.api.get(this.url + 'detalle_factura/factura/' + facturaId);
  }

  getNombresDetalleFactura(facturaid: string): Observable<any> {
    return this.api.get(this.url + 'detalle_factura/factura/' + facturaid + '/nombres_productos');
  }

  // Productos
  getProducts(): Observable<any> {
    return this.http.get(this.baseUrl + '/Producto').pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((acc, error) => {
            if (acc >= 3) {
              throw error;
            }
            return acc + 1;
          }, 0),
          delay(1000)
        )
      )
    );
  }

  getProductById(productId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/Producto/${productId}`).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((acc, error) => {
            if (acc >= 3) {
              throw error;
            }
            return acc + 1;
          }, 0),
          delay(1000)
        )
      )
    );
  }

  updateProduct(productId: number, productData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/Producto/${productId}`, productData).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((acc, error) => {
            if (acc >= 3) {
              throw error;
            }
            return acc + 1;
          }, 0),
          delay(1000)
        )
      )
    );
  }

  // Login
  login(username: string, password: string, moduleName: string): Observable<any> {
    return this.http.post<any>(this.loginApi, {
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

        // Si el rol es permitido, guarda el token y las funcionalidades
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('functionalities', JSON.stringify(response.functionalities));
        localStorage.setItem('role', JSON.stringify(response.Role));
        this.functionalities = response.functionalities;

        this.getUserLoggedId(); // Obtiene el ID del usuario logueado

        // Registrar auditoría para el inicio de sesión
        this.sendAudit({
          aud_usuario: response.usr_id, // Usuario que inició sesión
          aud_accion: 'login',
          aud_modulo: 'Seguridad',
          aud_funcionalidad: 'login',
          aud_observacion: `Inicio de sesión del usuario: ${username}`
        }).subscribe();

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
    const userId = this.userLogged; // Obtener el ID del usuario antes de limpiar el almacenamiento local
    localStorage.removeItem('access_token');
    localStorage.removeItem('functionalities');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.functionalities = [];

    // Registrar auditoría para el cierre de sesión
    this.sendAudit({
      aud_usuario: userId,
      aud_accion: 'logout',
      aud_modulo: 'Seguridad',
      aud_funcionalidad: 'logout',
      aud_observacion: `Cierre de sesión del usuario: ${userId}`
    }).subscribe();
  }

}
