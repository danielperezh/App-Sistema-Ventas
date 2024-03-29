import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Usuario } from 'src/app/interfaces/usuario';
import { UsuarioService } from 'src/app/Services/usuario.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';
import { ModalUsuarioComponent } from '../../Modales/modal-usuario/modal-usuario.component';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit, AfterViewInit {

  columnasTabla: string[] = ["nombreCompleto","correo","rolDescripcion","estado","acciones"];
  datainicio: Usuario[] = [];
  dataListaUsuario = new MatTableDataSource(this.datainicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private _usuarioServicio: UsuarioService,
    private _utilidadServicio: UtilidadService
  ){}

  obtenerUsuarios(){
    this._usuarioServicio.lista().subscribe({
      next:(data) => {
        if(data.status) this.dataListaUsuario.data = data.value;
        else
        this._utilidadServicio.mostarAlerta("No se encontraron datos","Oops!")
      },
      error: (e) => {}
    })
  }

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  ngAfterViewInit(): void {
    this.dataListaUsuario.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListaUsuario.filter = filterValue.trim().toLocaleLowerCase();
  }

  nuevoUsuario(){
    this.dialog.open(ModalUsuarioComponent,{
      disableClose: true
    }).afterClosed().subscribe(r => {
      if(r === "true") this.obtenerUsuarios();
    });
  }

  editarUsuario(usuario: Usuario){
    this.dialog.open(ModalUsuarioComponent,{
      disableClose: true,
      data: usuario
    }).afterClosed().subscribe(r => {
      if(r === "true") this.obtenerUsuarios();
    });
  }

  eliminarUsuario(usuario: Usuario){
    Swal.fire({
      title: '¿Desea eliminar el usuario?',
      text: usuario.nombreCompleto,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Si, eliminar",
      showCancelButton: true,
      cancelButtonColor: "#d33",
      cancelButtonText: "No, volver"
    }).then((r)=>{
      if(r.isConfirmed) {
        this._usuarioServicio.eliminar(usuario.idUsuario).subscribe({
          next: (data) => {
            if(data.status){
              this._utilidadServicio.mostarAlerta("El usuario fue eliminado","Listo!");
              this.obtenerUsuarios();
            }else{
              this._utilidadServicio.mostarAlerta("No se pudo eliminar el usuario","Error!");
            }
          },
          error: (e) => {}
        })
      }
    })
  }

}
