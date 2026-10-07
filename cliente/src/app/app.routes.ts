import { Routes } from '@angular/router';
import { Lista } from './entrenamientos/lista/lista';
import { Formulario } from './entrenamientos/formulario/formulario';
import { Editar } from './entrenamientos/editar/editar';
import { Login } from './auth/login/login';
import { Registro } from './auth/registro/registro';
import { Usuarios } from './usuarios/usuarios';
import { authGuard, publicGuard, rolGuard } from './guardas/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [publicGuard]
  },
  {
    path: 'registro',
    component: Registro,
    canActivate: [publicGuard]
  },
  {
    path: '',
    component: Lista,
    canActivate: [authGuard]
  },
  {
    path: 'nuevo',
    component: Formulario,
    canActivate: [authGuard, rolGuard],
    data: { roles: ['superadmin', 'head_coach'] }
  },
  {
    path: 'editar/:id',
    component: Editar,
    canActivate: [authGuard, rolGuard],
    data: { roles: ['superadmin', 'head_coach', 'assistant_coach'] }
  },
  {
    path: 'usuarios',
    component: Usuarios,
    canActivate: [authGuard, rolGuard],
    data: { roles: ['superadmin', 'head_coach', 'assistant_coach'] }
  },
  {
    path: '**',
    redirectTo: ''
  }
];