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
    this.facturaId = 'FACT-XXXXX';
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
      const productosActivos = res.filter((producto: any) => producto.estado === true);
      this.productos = productosActivos;
      this.filteredProductos = productosActivos;
      this.originalProductos = JSON.parse(JSON.stringify(productosActivos)); // Copia profunda de los productos originales
    }, (error: any) => {
      console.log(error);
    });
  }

  updateProducto(productId: number, updatedData: any) {
    this.api.updateProduct(productId, updatedData).subscribe((response: any) => {
      console.log('Producto actualizado:', response);
    }, (error: any) => {
      console.error('Error al actualizar producto', error);
    });
  }

  getProductById(productId: number): Observable<any> {
    return this.api.getProductById(productId);
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
      const productoEnCarrito = this.carrito.find(item => item.iD_Producto === this.selectedProduct.iD_Producto);

      // Verificar la cantidad total de este producto en el carrito
      const cantidadTotalEnCarrito = productoEnCarrito ? productoEnCarrito.cantidad : 0;
     

      if (this.cantidad > this.selectedProduct.stockProducto ) {
        alert('No hay suficiente stock para este producto.');
        return;
      }

      let precioUnitario = this.selectedProduct.gravaIVA ? this.selectedProduct.pvp : this.selectedProduct.costo;
      precioUnitario = Number(precioUnitario.toFixed(2)); // Limitar a 2 decimales

      if (productoEnCarrito) {
        productoEnCarrito.cantidad += this.cantidad;
        productoEnCarrito.subtotal = Number((productoEnCarrito.cantidad * precioUnitario).toFixed(2));
        productoEnCarrito.total = productoEnCarrito.gravaIVA
          ? Number((productoEnCarrito.subtotal * (1 + this.iva / 100)).toFixed(2))
          : productoEnCarrito.subtotal;
      } else {
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
    const productoOriginal = this.productos.find(producto => producto.iD_Producto === item.iD_Producto);

    if (productoEnCarrito && productoOriginal) {
      const diferenciaCantidad = newCantidad - productoEnCarrito.cantidad;

      if (diferenciaCantidad > 0 && diferenciaCantidad > productoOriginal.stockProducto) {
        alert('No hay suficiente stock para este producto.');
        return;
      }

      productoEnCarrito.cantidad = newCantidad;
      productoOriginal.stockProducto -= diferenciaCantidad;

      productoEnCarrito.subtotal = Number((newCantidad * productoEnCarrito.pvp).toFixed(2));
      productoEnCarrito.total = productoEnCarrito.gravaIVA
        ? Number((productoEnCarrito.subtotal * (1 + this.iva / 100)).toFixed(2))
        : productoEnCarrito.subtotal;

      this.updateTotalCarrito();
    }
  }

  validateAndUpdateQuantity(item: any) {
    if (item.cantidad > item.stockProducto) {
      item.cantidad = 1;
      alert('No hay suficiente stock para este producto.');
    }
    this.updateProductInCart(item, item.cantidad);
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

      const factura_id_asignado = response.factura.factura_id;

      detalleFactura.forEach(detalle => {
        detalle.factura_id = factura_id_asignado;
        this.api.createDetalleFactura(detalle).subscribe((res: any) => {
          console.log('Detalle de factura guardado:', res);
        }, (error: any) => {
          console.error('Error al guardar detalle de factura', error);
        });
      });

      this.carrito.forEach(item => {
        const productoActualizado = {
          ...item,
          stockProducto: item.stockProducto - item.cantidad
        };
        this.updateProducto(item.iD_Producto, productoActualizado);
      });

      this.resetForm();
      alert('La factura se ha creado exitosamente.');
      this.router.navigate(['/facturas-view']);
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
    console.log(`Alert: ${message}, Type: ${type}, Icon: ${icon}`);
  }

  updateTotalCarrito() {
    this.totalCarrito = this.carrito.reduce((acc, item) => acc + item.total, 0);
  }

  isFormValid(): boolean {
    return (
      this.cedulaInput && this.selectedCliente.cedula &&
      this.selectedCliente.nombres && this.selectedCliente.apellidos &&
      this.selectedCliente.direccion && this.selectedCliente.telefono &&
      this.selectedCliente.email && this.selectedCliente.fecha_nacimiento &&
      this.tipoPago && this.iva !== null && this.iva !== undefined
    );
  }
}