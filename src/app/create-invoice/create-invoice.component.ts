import { Component, OnInit } from '@angular/core';
import { Cliente } from '../models/client.model';  
import { ApiFacturacionService } from '../services/api-facturacion.service';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  stock: number;
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

  onSelectProduct() {
    // Puedes agregar lógica adicional aquí si es necesario
  }

  addProductToCart() {
    if (this.iva <= 0) {
      alert("Por favor ingrese el valor del IVA antes de agregar productos al carrito.");
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
    if (newCantidad <= 0) {
      alert("La cantidad debe ser mayor a cero.");
      return;
    }

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

  updateTotalCarrito() {
    this.totalCarrito = this.carrito.reduce((acc, item) => acc + item.total, 0);
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
}
