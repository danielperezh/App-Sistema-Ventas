import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { DetalleVenta } from 'src/app/interfaces/detalle-venta';
import { Producto } from 'src/app/interfaces/producto';
import Swal from 'sweetalert2';
import { VentaService } from 'src/app/Services/venta.service';
import { ProductoService } from 'src/app/Services/producto.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';
import { Venta } from 'src/app/interfaces/venta';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css']
})
export class VentaComponent {

  listaProductos: Producto[] = [];
  listaProductosFiltro: Producto[] = [];

  listaProductosParaVenta: DetalleVenta[] = [];
  bloquearBotonRegistrar: boolean = false;

  productoSeleccionado!: Producto;
  tipoPagoPorDefecto: string = "Efectivo";
  totalPagar: number = 0;

  formularioProductoVenta: FormGroup;
  columnasTabla: string[] = ["producto","cantidad","precio","total","accion"];
  datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta);

  retornarProductosPorFiltro(busqueda: any):Producto[]{
    const valorBuscado = typeof busqueda ==="string" ? busqueda.toLocaleLowerCase() : busqueda.nombre.toLocaleLowerCase();

    return this.listaProductos.filter(item => item.nombre.toLocaleLowerCase().includes(valorBuscado));
  }
  numCols: number = 3;

  constructor(
    private fb:FormBuilder,
    private _productosServicio: ProductoService,
    private _ventaServicio: VentaService,
    private _utilidadServicio: UtilidadService,
    private breakpointObserver: BreakpointObserver
  ){
    this.formularioProductoVenta = this.fb.group({
      producto: ["",Validators.required],
      cantidad: ["",Validators.required]
    });

    this._productosServicio.lista().subscribe({
      next:(data) => {
        if(data.status) {
          const lista = data.value as Producto[];
          this.listaProductos = lista.filter(p => p.esActivo == 1 && p.stock > 0)
        }
      },
      error: (e) => {}
    })

    this.formularioProductoVenta.get("producto")?.valueChanges.subscribe(value => {
      this.listaProductosFiltro = this.retornarProductosPorFiltro(value);
    })

    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).subscribe(result => {
      if (result.breakpoints[Breakpoints.XSmall]) {
        this.numCols = 1;
      } else if (result.breakpoints[Breakpoints.Small]) {
        this.numCols = 2;
      } else if (result.breakpoints[Breakpoints.Medium]) {
        this.numCols = 3;
      }
    });
  }

  mostrarProducto(producto: Producto): string{
    return producto.nombre;
  }

  productoParaVenta(event: any){
    this.productoSeleccionado = event.option.value;
  }

  agregarProductoParaVenta(){
    const _cantidad: number = this.formularioProductoVenta.value.cantidad;
    const _precio: number = parseFloat(this.productoSeleccionado.precio);
    const _total: number = _cantidad * _precio;
    this.totalPagar = this.totalPagar + _total;

    this.listaProductosParaVenta.push({
      idProducto : this.productoSeleccionado.idProducto,
      descripcionProducto: this.productoSeleccionado.descripcionCategoria,
      cantidad : _cantidad,
      precioTexto: String(_precio.toFixed(2)),
      totalTexto: String(_total.toFixed(2))
    })

    this.datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta);
    this.formularioProductoVenta.patchValue({
      producto:"",
      cantidad:""
    })
  }

  eliminarProducto(detalle: DetalleVenta){
    this.totalPagar = this.totalPagar - parseFloat(detalle.totalTexto),
    this.listaProductosParaVenta = this.listaProductosParaVenta.filter(p => p.idProducto != detalle.idProducto);

    this.datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta);
  }

  registrarVenta(){
    if(this.listaProductosParaVenta.length > 0){

      this.bloquearBotonRegistrar = true;

      const request: Venta = {
        tipoPago: this.tipoPagoPorDefecto,
        totalTexto: String(this.totalPagar.toFixed(2)),
        detalleVenta: this.listaProductosParaVenta
      }

      this._ventaServicio.registrar(request).subscribe({
        next: (response) => {
          if(response.status){
            this.totalPagar = 0.00;
            this.listaProductosParaVenta = [];
            this.datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta);

            Swal.fire({
              icon: "success",
              title: "Venta Registrada!",
              text: `Numero de venta: ${response.value.numeroDocumento}`
            })
          }else
            this._utilidadServicio.mostarAlerta("No se pudo registrar la venta","Opps!");
        },
        complete: () => {
          this.bloquearBotonRegistrar = false;
        },
        error: (e) => {}
      })
    }
  }

}
