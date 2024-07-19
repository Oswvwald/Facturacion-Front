import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiFacturacionService } from '../services/api-facturacion.service';
import { Cliente } from '../models/client.model';
import { Producto } from '../models/product.model'; // Assuming you have a separate Product model
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-edit-invoice',
  templateUrl: './edit-invoice.component.html',
  styleUrls: ['./edit-invoice.component.css']
})
export class EditInvoiceComponent implements OnInit {
  clienteSearchInput: string;
  cedulaInput: string;
  filteredClientes: Cliente[] = [];
  allClientes: Cliente[] = [];
  selectedCliente: Cliente | any = {};
  tipoPago: string;
  iva: number = 0;
  tiposPago: any[] = [];

  // Factura
  fechaFactura: string;
  facturaId: string;

  // Productos
  productos: Producto[] = [];
  filteredProductos: Producto[] = [];
  productSearch: string = '';
  selectedProduct: Producto;
  cantidad: number = 1;
  carrito: any[] = [];
  totalCarrito: number = 0;

  showValidationError: boolean = false;
  originalCarrito: any[] = []; // Para almacenar el carrito original

  constructor(
    private api: ApiFacturacionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.facturaId = this.route.snapshot.paramMap.get('id') || '';
    this.getClientes();
    this.getTiposPago();
    this.getProductos();
    this.loadFacturaData(this.facturaId);
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
      cliente.cedula.includes(this.clienteSearchInput)
    );
  }

  onSelectCliente(cedulaSeleccionada: string) {
    const clienteEncontrado = this.allClientes.find(cliente => cliente.cedula === cedulaSeleccionada);
    if (clienteEncontrado) {
      this.selectedCliente = clienteEncontrado;
      this.cedulaInput = clienteEncontrado.cedula;
      this.clienteSearchInput = ''; // Limpiar el campo de búsqueda
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
    }, (error: any) => {
      console.log(error);
    });
  }

  updateProducto(productId: number, updatedData: any) {
    this.api.updateProduct(productId, updatedData).subscribe((response: any) => {
    }, (error: any) => {
      console.error('Error al actualizar producto', error);
    });
  }

  getProductById(productId: number): Observable<Producto> {
    return this.api.getProductById(productId);
  }

  filterProducts() {
    this.filteredProductos = this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(this.productSearch.toLowerCase()) ||
      producto.codigo.toString().toLowerCase().includes(this.productSearch.toLowerCase()),
    );
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

      if (this.cantidad + cantidadTotalEnCarrito > this.selectedProduct.stockProducto) {
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
      this.updateTotalCarrito();
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

  saveInvoice() {
    const nuevoDetalleFactura = this.carrito.filter(item => !this.originalCarrito.some(original => original.producto_id === item.producto_id));
    const detalleFacturaModificado = this.carrito.filter(item => this.originalCarrito.some(original => original.producto_id === item.producto_id && original.cantidad !== item.cantidad));
    const detalleFacturaEliminado = this.originalCarrito.filter(original => !this.carrito.some(item => item.producto_id === original.producto_id));

    const factura = {
      factura_id: this.facturaId,
      cedula_cliente: this.selectedCliente.cedula,
      tipo_pago: this.tipoPago,
      fecha: this.fechaFactura,
      total: this.totalCarrito,
      iva: this.iva,
      detalle: this.carrito
    };

    this.api.editFactura(this.facturaId, factura).subscribe((response: any) => {
      console.log('Factura actualizada', response);

      nuevoDetalleFactura.forEach(detalle => {
        this.api.createDetalleFactura({
          factura_id: this.facturaId,
          producto_id: detalle.iD_Producto,
          cantidad: detalle.cantidad,
          precio_unitario: detalle.pvp,
          incluye_iva: detalle.gravaIVA,
          porcentaje_iva: detalle.gravaIVA ? this.iva : 0,
          subtotal: detalle.subtotal,
          total: detalle.total,
          nombre_producto: detalle.nombre,
          descripcion_producto: detalle.descripcion
        }).subscribe();
      });

      detalleFacturaModificado.forEach(detalle => {
        const original = this.originalCarrito.find(orig => orig.producto_id === detalle.producto_id);
        const diferenciaCantidad = detalle.cantidad - original.cantidad;
        this.api.editDetalleFactura(detalle.producto_id, {
          ...detalle,
          cantidad: detalle.cantidad,
          stockProducto: detalle.stockProducto - diferenciaCantidad
        }).subscribe();
      });

      detalleFacturaEliminado.forEach(detalle => {
        this.api.deleteDetalleFactura(detalle.producto_id).subscribe();
      });

      alert('La factura se ha actualizado exitosamente.');
      this.router.navigate(['/facturas-view']);
    }, (error) => {
      console.error('Error al actualizar la factura', error);
    });
    this.showValidationError = false;
  }

  private loadFacturaData(facturaId: string) {
    this.api.getFacturaById(facturaId).subscribe((res: any) => {
      const factura = res.factura;
      this.fechaFactura = factura.fecha;
      this.selectedCliente = this.allClientes.find(cliente => cliente.cedula === factura.cedula_cliente);
      this.tipoPago = factura.tipo_pago;
      this.iva = factura.iva;
    }, (error: any) => {
      console.error('Error al cargar los datos de la factura', error);
    });

    this.api.getFacturaDetallesById(facturaId).subscribe((detallesRes: any) => {
      const detalles = detallesRes.detallesFactura;

      const productosObservables: Observable<Producto>[] = detalles.map((detalle: any) =>
        this.api.getProductById(detalle.producto_id)
      );

      forkJoin(productosObservables).subscribe((productos: Producto[]) => {
        this.carrito = detalles.map((detalle: any, index: number) => {
          const producto = productos[index];
          return {
            ...detalle,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            pvp: producto.pvp,
            stockProducto: producto.stockProducto,
            gravaIVA: producto.gravaIVA,
            total: detalle.incluye_iva
              ? Number((detalle.subtotal * (1 + this.iva / 100)).toFixed(2))
              : detalle.subtotal
          };
        });
        this.originalCarrito = JSON.parse(JSON.stringify(this.carrito)); // Guardar el estado original del carrito
        this.updateTotalCarrito();
      }, (error: any) => {
        console.error('Error al obtener los productos', error);
      });
    }, (error: any) => {
      console.error('Error al cargar los detalles de la factura', error);
    });
  }

  resetForm() {
    this.clienteSearchInput = '';
    this.cedulaInput = '';
    this.filteredClientes = [];
    this.selectedCliente = {};
    this.tipoPago = '';
    this.iva = 0;
    this.carrito = [];
    this.totalCarrito = 0;
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

  updateTotalCarrito() {
    this.totalCarrito = this.carrito.reduce((acc, item) => acc + item.total, 0);
  }

  isFormValid(): boolean {
    return (
      this.selectedCliente.cedula &&
      this.selectedCliente.nombres && this.selectedCliente.apellidos &&
      this.selectedCliente.direccion && this.selectedCliente.telefono &&
      this.selectedCliente.email && this.selectedCliente.fecha_nacimiento &&
      this.tipoPago && this.iva !== null && this.iva !== undefined
    );
  }
}
