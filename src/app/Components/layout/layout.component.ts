import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';
import { MenuService } from 'src/app/Services/menu.service';
import { Menu } from 'src/app/interfaces/menu';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, AfterViewInit {

  @ViewChild('sidenav') sidenav!: MatSidenav;

  listaMenus: Menu[]=[];
  correoUsuario: string = "";
  rolUsuario: string = "";

  constructor(
    private router: Router,
    private _menuServicio: MenuService,
    private _utilidadServicio: UtilidadService
  ){}

  ngOnInit(): void {
    const usuario = this._utilidadServicio.obetnerSesionUsuario();

    if(usuario != null){
      this.correoUsuario = usuario.correo;
      this.rolUsuario = usuario.rolDescripcion;

      this._menuServicio.lista(usuario.idUsuario).subscribe({
        next: (data) => {
          if(data.status) this.listaMenus = data.value;
        },
        error: (e) => {}
      })
    }
  }

  ngAfterViewInit() {
    this.checkWindowSize();
  }

  checkWindowSize(): void {
    this.sidenav.opened = window.innerWidth > 940;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowSize();
  }

  cerrarSesion(){
    this._utilidadServicio.eliminarSesionUsuario();
    this.router.navigate(["login"]);
  }

}
