import { Component, OnInit } from '@angular/core';
import { Cliente } from '../models/client.model';
import { ApiFacturacionService } from '../services/api-facturacion.service';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  stockProducto: number;
  costo: number;
  pvp: number;
  gravaIva: boolean;
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
  filteredProductos: Producto[] = [];
  productSearch: string = '';
  selectedProduct: Producto;
  cantidad: number = 1;
  carrito: any[] = [];
  totalCarrito: number = 0;

  constructor(private api: ApiFacturacionService) {
    CreateInvoiceComponent.ultimoNumeroFactura++;
    this.facturaId = 'FACT-' + CreateInvoiceComponent.ultimoNumeroFactura.toString().padStart(5, '0');
  }

  ngOnInit(): void {
    this.getClientes();
    this.getTiposPago();
    this.getProductos();
    this.calculatePages();
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
      this.productos = res;
      this.filteredProductos = res;
    }, (error: any) => {
      console.log(error);
    });
  }

  filterProducts() {
    this.filteredProductos = this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(this.productSearch.toLowerCase())
    );
  }

  addProductToCartFromModal(producto: Producto): void {
    this.selectedProduct = producto;
    this.cantidad = 1; // O la cantidad que desees por defecto
    this.addProductToCart();
  }

  addProductToCart() {
    if (this.iva <= 0) {
      this.showAlert('Por favor ingrese el valor del IVA antes de agregar productos al carrito.', 'error', 'warning');
      return;
    }

    if (this.selectedProduct && this.cantidad > 0) {
      const productoEnCarrito = this.carrito.find(item => item.id === this.selectedProduct.id);
      if (productoEnCarrito) {
        productoEnCarrito.cantidad += this.cantidad;
        productoEnCarrito.subtotal = productoEnCarrito.cantidad * productoEnCarrito.pvp;
        productoEnCarrito.total = productoEnCarrito.gravaIva
          ? productoEnCarrito.subtotal * (1 + this.iva / 100)
          : productoEnCarrito.subtotal;
      } else {
        const itemCarrito = {
          ...this.selectedProduct,
          cantidad: this.cantidad,
          subtotal: this.cantidad * this.selectedProduct.pvp,
          total: this.selectedProduct.gravaIva
            ? this.cantidad * this.selectedProduct.pvp * (1 + this.iva / 100)
            : this.cantidad * this.selectedProduct.pvp
        };
        this.carrito.push(itemCarrito);
      }
      this.updateTotalCarrito();
    }
  }

  removeProductFromCart(item: any) {
    const index = this.carrito.indexOf(item);
    if (index > -1) {
      this.carrito.splice(index, 1);
      this.updateTotalCarrito();
    }
  }

  updateProductInCart(item: any, newCantidad: number) {
    const productoEnCarrito = this.carrito.find(producto => producto.id === item.id);
    if (productoEnCarrito) {
      productoEnCarrito.cantidad = newCantidad;
      productoEnCarrito.subtotal = newCantidad * productoEnCarrito.pvp;
      productoEnCarrito.total = productoEnCarrito.gravaIva
        ? productoEnCarrito.subtotal * (1 + this.iva / 100)
        : productoEnCarrito.subtotal;
      this.updateTotalCarrito();
    }
  }

  createInvoice() {
    const detalleFactura = this.carrito.map(item => ({
      factura_id: this.facturaId,
      producto_id: item.id,
      cantidad: item.cantidad,
      precio_unitario: item.pvp,
      incluye_iva: item.gravaIva,
      porcentaje_iva: item.gravaIva ? this.iva : 0,
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

    this.api.createFactura(factura).subscribe(response => {
      console.log('Factura creada', response);
      this.resetForm();
    }, (error) => {
      console.error('Error al crear la factura', error);
    });
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
    this.calculatePages();
  }
}
