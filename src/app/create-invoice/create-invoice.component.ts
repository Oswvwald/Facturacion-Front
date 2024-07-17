import { Component, OnInit } from '@angular/core';
import { Cliente } from '../models/client.model';
import { ApiFacturacionService } from '../services/api-facturacion.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

interface Producto {
  iD_Producto: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  stockProducto: number;
  costo: number;
  pvp: number;
  gravaIVA: boolean;
}

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.css']
})
export class CreateInvoiceComponent implements OnInit {
  cedulaInput: string;
  filteredClientes: Cliente[] = [];
  allClientes: Cliente[] = [];
  selectedCliente: Cliente | any = {};
  tipoPago: string;
  iva: number = 0;
  tiposPago: any[] = [];

  // Factura
  fechaFactura = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  facturaId: string;
  private static ultimoNumeroFactura: number = 0;

  // Productos
  productos: Producto[] = [];
  originalProductos: Producto[] = []; // Para almacenar los productos originales con su stock inicial
  filteredProductos: Producto[] = [];
  productSearch: string = '';
  selectedProduct: Producto;
  cantidad: number = 1;
  carrito: any[] = [];
  totalCarrito: number = 0;

  showValidationError: boolean = false;


  constructor(private api: ApiFacturacionService, private router: Router) {
    this.facturaId = 'FACT-XXXXX' ;
  }

  ngOnInit(): void {
    this.getClientes();
    this.getTiposPago();
    this.getProductos();
    this.calculatePages();
  }

  cancelarFactura() {
    this.router.navigate(['/facturas-view']);
  }

  getClientes() {
    this.api.getClients().subscribe((res: any) => {
      this.allClientes = res.clientes;
      this.filteredClientes = res.clientes;
    });
  }

  onSearchCliente() {
    this.filteredClientes = this.allClientes.filter(cliente =>
      cliente.cedula.includes(this.cedulaInput)
    );
  }

  onSelectCliente(cedulaSeleccionada: string) {
    const clienteEncontrado = this.allClientes.find(cliente => cliente.cedula === cedulaSeleccionada);
    if (clienteEncontrado) {
      this.selectedCliente = clienteEncontrado;
    }
  }

  getTiposPago() {
    this.api.getTipoPago().subscribe((res: any) => {
      this.tiposPago = res.tipoPago;
    }, (error: any) => {
      console.log(error);
    });
  }

  getProductos() {
    this.api.getProducts().subscribe((res: any) => {
      // Filtrar solo los productos con "estado" en true
      const productosActivos = res.filter((producto: any) => producto.estado === true);
      this.productos = productosActivos;
      this.filteredProductos = productosActivos;
    }, (error: any) => {
      console.log(error);
    });
  }

  getProductById(productId: number): Observable<any> {
    return this.api.getProductById(productId);
  }

  updateProducto(productId: number, updatedData: any) {
    this.api.updateProduct(productId, updatedData).subscribe((response: any) => {
      console.log('Producto actualizado:', response);
      this.getProductos(); // Vuelve a obtener los productos para actualizar la lista
    }, (error: any) => {
      console.error('Error al actualizar producto', error);
    });
  }

  filterProducts() {
    this.filteredProductos = this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(this.productSearch.toLowerCase()) ||
      producto.codigo.toString().toLowerCase().includes(this.productSearch.toLowerCase()),
    );
    console.log('Productos filtrados:', this.filteredProductos); // Depuración
  }

  addProductToCartFromModal(producto: Producto): void {
    this.selectedProduct = producto;
    this.cantidad = 1; // O la cantidad que desees por defecto
    this.addProductToCart();
  }

  addProductToCart() {
    if (this.selectedProduct && this.cantidad > 0) {
      let precioUnitario = this.selectedProduct.gravaIVA ? this.selectedProduct.pvp : this.selectedProduct.costo;
      precioUnitario = Number(precioUnitario.toFixed(2)); // Limitar a 2 decimales
  
      const productoEnCarrito = this.carrito.find(item => item.iD_Producto === this.selectedProduct.iD_Producto);
      if (productoEnCarrito) {
        // Si el producto ya está en el carrito, actualizamos la cantidad y los valores asociados.
        productoEnCarrito.cantidad += this.cantidad;
        productoEnCarrito.subtotal = Number((productoEnCarrito.cantidad * precioUnitario).toFixed(2));
        productoEnCarrito.total = productoEnCarrito.gravaIva
          ? Number((productoEnCarrito.subtotal * (1 + this.iva / 100)).toFixed(2))
          : productoEnCarrito.subtotal;
      } else {
        // Si el producto no está en el carrito, lo agregamos.
        console.log('Producto que no está en carrito a agregar:', this.selectedProduct); // Depuración
        const itemCarrito = {
          ...this.selectedProduct,
          cantidad: this.cantidad,
          subtotal: Number((this.cantidad * precioUnitario).toFixed(2)),
          total: this.selectedProduct.gravaIVA
            ? Number((this.cantidad * precioUnitario * (1 + this.iva / 100)).toFixed(2))
            : Number((this.cantidad * precioUnitario).toFixed(2))
        };
        this.carrito.push(itemCarrito);
      }

      // Actualizar el stock del producto solo en el frontend
      this.selectedProduct.stockProducto -= this.cantidad;

      this.updateTotalCarrito();
      this.calculatePages();
      console.log('Carrito actualizado:', this.carrito); // Depuración
    }
  }
 
  removeProductFromCart(item: any) {
    const index = this.carrito.indexOf(item);
    if (index > -1) {
      this.carrito.splice(index, 1);

      // Obtener el producto original y restaurar su stock en el frontend
      this.getProductById(item.iD_Producto).subscribe((productoOriginal: Producto) => {
        const productoActualizado = this.productos.find(prod => prod.iD_Producto === item.iD_Producto);
        if (productoActualizado) {
          productoActualizado.stockProducto = productoOriginal.stockProducto;
        }
        this.updateTotalCarrito();
      }, (error: any) => {
        console.error('Error al obtener el producto original', error);
      });
    }
  }




  updateProductInCart(item: any, newCantidad: number) {
    const productoEnCarrito = this.carrito.find(producto => producto.iD_Producto === item.iD_Producto);
    if (productoEnCarrito) {
      productoEnCarrito.cantidad = newCantidad;
      productoEnCarrito.subtotal = Number((newCantidad * productoEnCarrito.pvp).toFixed(2)); // Limitar a 2 decimales
      productoEnCarrito.total = productoEnCarrito.gravaIVA
        ? Number((productoEnCarrito.subtotal * (1 + this.iva / 100)).toFixed(2)) // Limitar a 2 decimales
        : productoEnCarrito.subtotal;
      this.updateTotalCarrito();
    }
  }
  

  createInvoice() {
    const detalleFactura = this.carrito.map(item => ({
      factura_id: '', // Dejar este campo vacío por ahora
      producto_id: item.iD_Producto,
      nombre_producto: item.nombre,
      descripcion_producto: item.descripcion,
      cantidad: item.cantidad,
      precio_unitario: item.pvp,
      incluye_iva: item.gravaIVA,
      porcentaje_iva: item.gravaIVA ? this.iva : 0,
      subtotal: item.subtotal,
      total: item.total
    }));
  
    const factura = {
      factura_id: this.facturaId,
      cedula_cliente: this.selectedCliente.cedula,
      tipo_pago: this.tipoPago,
      fecha: this.fechaFactura,
      total: this.totalCarrito,
      iva: this.iva,
      detalle: detalleFactura
    };
  
    this.api.createFactura(factura).subscribe((response: any) => {
      console.log('Factura creada', response);
  
      // Obtener el factura_id asignado por el servidor
      const factura_id_asignado = response.factura.factura_id;
  
      // Actualizar el detalle de la factura con el factura_id asignado
      detalleFactura.forEach(detalle => {
        detalle.factura_id = factura_id_asignado;
        this.api.createDetalleFactura(detalle).subscribe((res: any) => {
          console.log('Detalle de factura guardado:', res);
        }, (error: any) => {
          console.error('Error al guardar detalle de factura', error);
        });
      });

        // Actualizar el stock de los productos en el backend
        this.carrito.forEach(item => {
          const productoActualizado = {
            ...item,
            stockProducto: item.stockProducto - item.cantidad
          };
          this.updateProducto(item.iD_Producto, productoActualizado);
        });

      this.resetForm();
    }, (error) => {
      console.error('Error al crear la factura', error);
    });
    this.showValidationError = false;
  }
  

  resetForm() {
    this.cedulaInput = '';
    this.filteredClientes = [];
    this.selectedCliente = {};
    this.tipoPago = '';
    this.iva = 0;
    this.carrito = [];
    this.totalCarrito = 0;
    CreateInvoiceComponent.ultimoNumeroFactura++;
    this.facturaId = 'FACT-' + CreateInvoiceComponent.ultimoNumeroFactura.toString().padStart(5, '0');
  }

  // Variables para la paginación
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number;
  pages: number[] = [];

  calculatePages() {
    this.totalPages = Math.ceil(this.carrito.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (v, k) => k + 1);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  get paginatedItems() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.carrito.slice(startIndex, startIndex + this.itemsPerPage);
  }

  showAlert(message: string, type: string, icon: string) {
    // Example implementation using console.log
    // Replace this with your actual alert display logic
    console.log(`Alert: ${message}, Type: ${type}, Icon: ${icon}`);
  }

  updateTotalCarrito() {
    this.totalCarrito = this.carrito.reduce((acc, item) => acc + item.total, 0);
  }

  isFormValid(): boolean {
    // Verificar si todos los campos requeridos están llenos
    return (
      this.cedulaInput && this.selectedCliente.cedula &&
      this.selectedCliente.nombres && this.selectedCliente.apellidos &&
      this.selectedCliente.direccion && this.selectedCliente.telefono &&
      this.selectedCliente.email && this.selectedCliente.fecha_nacimiento &&
      this.tipoPago && this.iva !== null && this.iva !== undefined
    );
  }
  
}
