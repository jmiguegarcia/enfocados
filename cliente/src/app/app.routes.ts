import { Routes } from '@angular/router';
import { Lista } from './entrenamientos/lista/lista';
import { Formulario } from './entrenamientos/formulario/formulario';
import { Editar } from './entrenamientos/editar/editar';

export const routes: Routes = [
  { path: '', component: Lista },
  { path: 'nuevo', component: Formulario },
  { path: 'editar/:id', component: Editar }
];