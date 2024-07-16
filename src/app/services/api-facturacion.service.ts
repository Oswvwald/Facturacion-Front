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
  private baseUrl = '/api'; // Utiliza el proxy configurado
  private loginApi = 'https://api-modulo-seguridad.onrender.com/api/login_module';
  private auditApi = 'https://api-modulo-seguridad.onrender.com/api/auditoria';
  private userApi: string = 'https://api-modulo-seguridad.onrender.com/api/myuser';


  private functionalities: string[] = [];
  private userloged: string;

  constructor(private api: HttpClient, private http: HttpClient) { }

  //cargar las apis antes de llamarlas 
  chargeApis(retryCount = 0): Observable<any> {
    return this.http.get(this.baseUrl).pipe(
      catchError((error) => {
        if (retryCount < 3) { // Limita a 3 reintentos
          console.log(`Reintento ${retryCount + 1}`);
          return this.chargeApis(retryCount + 1); // Reintenta
        }
        return throwError(error); // Lanza el error después de 3 intentos
      })
    );
  } 

  chargeApis2(retryCount = 0): Observable<any> {
    return this.http.get(this.url).pipe(
      catchError((error) => {
        if (retryCount < 3) { // Limita a 3 reintentos
          console.log(`Reintento ${retryCount + 1}`);
          return this.chargeApis2(retryCount + 1); // Reintenta
        }
        return throwError(error); // Lanza el error después de 3 intentos
      })
    );
  }

  

  //Auditoria
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
    this.userloged = this.userLogged;
    return this.api.post(this.url + 'clientes', cliente).pipe(
      tap(() => {
        this.sendAudit({
          aud_usuario: this.userloged, // Cambiado de 'user' a 'aud_usuario'
          aud_accion: 'create', // Cambiado de 'action' a 'aud_accion'
          aud_modulo: 'Facturación', // Cambiado de 'module' a 'aud_modulo'
          aud_funcionalidad: 'clientes', // Cambiado de 'entity' a 'aud_funcionalidad'
          aud_observacion: `Creación de cliente con cédula: ${cliente.cedula}` // Cambiado de 'description' a 'aud_observacion'
        }).subscribe();
      })
    );
  }

  //Editar un cliente
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

  //Eliminar un cliente
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
    this.userloged = this.userLogged;
    return this.api.post(this.url + 'tipoPago', tipoPago).pipe(
      tap(() => {
        this.sendAudit({
          aud_usuario: this.userloged, // Asume que `userloged` contiene el usuario actual
          aud_accion: 'create', // Indica la acción de crear un nuevo tipo de pago
          aud_modulo: 'Facturación', // El módulo al que pertenece esta acción
          aud_funcionalidad: 'tipoPago', // La funcionalidad específica dentro del módulo
          aud_observacion: `Creación de tipo de pago: ${tipoPago.nombre}` // Detalle de la acción realizada
        }).subscribe();
      })
    );
  }
  //Editar un tipo de pago
  editTipoPago(id: string, tipoPago: any): Observable<any> {
    this.userloged = this.userLogged;
    return this.api.put(this.url + 'tipoPago/' + id, tipoPago).pipe(
      tap(() => {
        this.sendAudit({
          aud_usuario: this.userloged, // Asume que `userloged` contiene el usuario actual
          aud_accion: 'edit', // Indica la acción de editar un tipo de pago existente
          aud_modulo: 'Facturación', // El módulo al que pertenece esta acción
          aud_funcionalidad: 'tipoPago', // La funcionalidad específica dentro del módulo
          aud_observacion: `Edición de tipo de pago con ID: ${id}` // Detalle de la acción realizada
        }).subscribe();
      })
    );
  }
  //Eliminar un tipo de pago
  deleteTipoPago(id: string): Observable<any> {
    this.userloged = this.userLogged;
      return this.api.delete(this.url + 'tipoPago/' + id).pipe(
        tap(() => {
          this.sendAudit({
            aud_usuario: this.userloged, // Asume que `userloged` contiene el usuario actual
            aud_accion: 'delete', // Indica la acción de eliminar un tipo de pago
            aud_modulo: 'Facturación', // El módulo al que pertenece esta acción
            aud_funcionalidad: 'tipoPago', // La funcionalidad específica dentro del módulo
            aud_observacion: `Eliminación de tipo de pago con ID: ${id}` // Detalle de la acción realizada
          }).subscribe();
        })
      );
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
    this.userloged = this.userLogged;
    return this.api.post(this.url + 'facturas', factura).pipe(
      tap((response) => {
        this.sendAudit({
          aud_usuario: this.userloged, // Asume que `userloged` contiene el usuario actual
          aud_accion: 'create', // Indica la acción de crear una factura
          aud_modulo: 'Facturación', // El módulo al que pertenece esta acción
          aud_funcionalidad: 'facturas', // La funcionalidad específica dentro del módulo
          aud_observacion: `Creación de factura con ID: ${factura.factura_id}` // Detalle de la acción realizada, asumiendo que la respuesta incluye el ID de la factura creada
        }).subscribe();
      })
    );
  }

  //obtener una factura por id
  getFactura(id: string): Observable<any> {
    return this.api.get(this.url + 'facturas/' + id);
  }

  //editar una factura
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

  //eliminar una factura
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

  //agregar el detalle de la factura
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

  //ver detalles por id 
  getDetalleFacturaById(id: string): Observable<any> {
    return this.api.get(this.url + 'detalle_factura/' + id);
  }

  //editar detalle de factura
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

  //eliminar detalle de factura
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

  //eliminar detalles por facturas 
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

  //ver productos de la factura
  verProductosFactura(facturaId: string): Observable<any> {
    return this.api.get(this.url + 'detalle_factura/factura/' + facturaId);
  }

  //Traer nombres del detalle de factura
  getNombresDetalleFactura(facturaid: string): Observable<any> {
    return this.api.get(this.url + 'detalle_factura/factura/' + facturaid + '/nombres_productos');
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
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.functionalities = [];
  }

}

