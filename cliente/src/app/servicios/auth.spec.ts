import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth';

describe('AuthService - Roles y Permisos', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Rol admin', () => {
    beforeEach(() => {
      service.usuario.set({
        id: 10,
        nombre: 'Admin Deportes',
        email: 'admin.deportes@tracker.com',
        rol: 'admin',
        activo: true,
        temporary_assistant: false
      });
      service.token.set('fake-token');
    });

    it('debe tener rolActual y rolEfectivo como admin', () => {
      expect(service.rolActual()).toBe('admin');
      expect(service.rolEfectivo()).toBe('admin');
    });

    it('NO debe tener permiso de crear o editar plan de entrenamientos (workout:write)', () => {
      expect(service.puedeCrearEditar()).toBe(false);
    });

    it('SÍ debe tener permiso de ver usuarios (user:view)', () => {
      expect(service.puedeVerUsuarios()).toBe(true);
    });

    it('SÍ debe tener permiso de alternar asistente temporal a estudiantes (user:toggle_temp_assistant)', () => {
      expect(service.puedeToggleTempAssistant()).toBe(true);
    });

    it('SÍ debe tener permiso de editar notas (workout:add_notes)', () => {
      expect(service.puedeEditarNotas()).toBe(true);
    });

    it('NO debe ser superadmin', () => {
      expect(service.esSuperAdmin()).toBe(false);
    });
  });

  describe('Rol assistant_coach', () => {
    beforeEach(() => {
      service.usuario.set({
        id: 20,
        nombre: 'Asistente Laura',
        email: 'asistente@tracker.com',
        rol: 'assistant_coach',
        activo: true,
        temporary_assistant: false
      });
      service.token.set('fake-token');
    });

    it('ya NO debe tener permiso de alternar asistente temporal (user:toggle_temp_assistant removido)', () => {
      expect(service.puedeToggleTempAssistant()).toBe(false);
    });

    it('SÍ debe tener permiso de editar notas (workout:add_notes)', () => {
      expect(service.puedeEditarNotas()).toBe(true);
    });

    it('NO debe tener permiso de crear/editar plan de entrenamientos (workout:write)', () => {
      expect(service.puedeCrearEditar()).toBe(false);
    });

    it('SÍ debe poder ver la lista de usuarios (user:view)', () => {
      expect(service.puedeVerUsuarios()).toBe(true);
    });
  });

  describe('Rol head_coach', () => {
    beforeEach(() => {
      service.usuario.set({
        id: 30,
        nombre: 'Head Coach Carlos',
        email: 'coach@tracker.com',
        rol: 'head_coach',
        activo: true,
        temporary_assistant: false
      });
      service.token.set('fake-token');
    });

    it('debe tener permisos de crear/editar entrenamientos y toggle de asistente temporal', () => {
      expect(service.puedeCrearEditar()).toBe(true);
      expect(service.puedeToggleTempAssistant()).toBe(true);
      expect(service.puedeVerUsuarios()).toBe(true);
    });
  });

  describe('Rol student', () => {
    it('alumno regular NO debe poder editar notas ni ver usuarios', () => {
      service.usuario.set({
        id: 40,
        nombre: 'Alumno Juan',
        email: 'juan@tracker.com',
        rol: 'student',
        activo: true,
        temporary_assistant: false
      });
      expect(service.puedeEditarNotas()).toBe(false);
      expect(service.puedeVerUsuarios()).toBe(false);
      expect(service.puedeToggleTempAssistant()).toBe(false);
    });

    it('alumno con temporary_assistant SÍ debe poder editar notas y ver usuarios como asistente', () => {
      service.usuario.set({
        id: 41,
        nombre: 'Alumno Pedro',
        email: 'pedro@tracker.com',
        rol: 'student',
        activo: true,
        temporary_assistant: true
      });
      expect(service.rolEfectivo()).toBe('assistant_coach');
      expect(service.puedeEditarNotas()).toBe(true);
      expect(service.puedeVerUsuarios()).toBe(true);
      expect(service.puedeCrearEditar()).toBe(false);
      expect(service.puedeToggleTempAssistant()).toBe(false);
    });
  });
});

