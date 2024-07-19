// src/app/models/product.model.ts
export interface Producto {
    iD_Producto: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    stockProducto: number;  
    costo: number;
    pvp: number;
    gravaIVA: boolean;
    estado: boolean;
  }