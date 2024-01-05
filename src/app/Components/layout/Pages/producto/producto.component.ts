import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import Swal from 'sweetalert2';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';
import { Producto } from 'src/app/interfaces/producto';
import { ProductoService } from 'src/app/Services/producto.service';
import { ModalProductoComponent } from '../../Modales/modal-producto/modal-producto.component';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit, AfterViewInit{

  columnasTabla: string[] = ["nombre","categoria","stock","precio","estado","acciones"];
  datainicio: Producto[] = [];
  dataListaProductos = new MatTableDataSource(this.datainicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private _productoServicio: ProductoService,
    private _utilidadServicio: UtilidadService
  ){}

  obtenerProducto(){
    this._productoServicio.lista().subscribe({
      next:(data) => {
        if(data.status) this.dataListaProductos.data = data.value;
        else
        this._utilidadServicio.mostarAlerta("No se encontraron datos","Oops!")
      },
      error: (e) => {}
    })
  }

  ngOnInit(): void {
    this.obtenerProducto();
  }

  ngAfterViewInit(): void {
    this.dataListaProductos.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListaProductos.filter = filterValue.trim().toLocaleLowerCase();
  }

  nuevoProducto(){
    this.dialog.open(ModalProductoComponent,{
      disableClose: true
    }).afterClosed().subscribe(r => {
      if(r === "true") this.obtenerProducto();
    });
  }

  editarProducto(producto: Producto){
    this.dialog.open(ModalProductoComponent,{
      disableClose: true,
      data: producto
    }).afterClosed().subscribe(r => {
      if(r === "true") this.obtenerProducto();
    });
  }

  eliminarProducto(producto: Producto){
    Swal.fire({
      title: '¿Desea eliminar el usuario?',
      text: producto.nombre,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Si, eliminar",
      showCancelButton: true,
      cancelButtonColor: "#d33",
      cancelButtonText: "No, volver"
    }).then((r)=>{
      if(r.isConfirmed) {
        this._productoServicio.eliminar(producto.idProducto).subscribe({
          next: (data) => {
            if(data.status){
              this._utilidadServicio.mostarAlerta("El producto fue eliminado","Listo!");
              this.obtenerProducto();
            }else{
              this._utilidadServicio.mostarAlerta("No se pudo eliminar el producto","Error!");
            }
          },
          error: (e) => {}
        })
      }
    })
  }

}
