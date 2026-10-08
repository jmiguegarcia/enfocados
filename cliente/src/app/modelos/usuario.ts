export type RolUsuario = 'superadmin' | 'admin' | 'head_coach' | 'assistant_coach' | 'student';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  rolEfectivo?: RolUsuario;
  activo: boolean;
  temporary_assistant: boolean;
  permisos?: string[];
  created_at?: string;
}

export interface RespuestaAuth {
  token: string;
  usuario: Usuario;
  impersonando?: boolean;
}

