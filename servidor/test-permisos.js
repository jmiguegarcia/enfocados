const assert = require('assert');
const { PERMISOS, tienePermiso, obtenerRolEfectivo } = require('./middleware/auth');

console.log('Iniciando pruebas unitarias de permisos del backend...');

// 1. Validar que el rol 'admin' tiene los permisos esperados y NO tiene 'workout:write'
const adminUser = { id: 10, rol: 'admin', activo: true, temporary_assistant: false };

assert.strictEqual(
  tienePermiso(adminUser, 'workout:write'),
  false,
  'Admin NO debe tener permiso workout:write'
);

assert.strictEqual(
  tienePermiso(adminUser, 'workout:read_hidden'),
  true,
  'Admin debe tener permiso workout:read_hidden'
);

assert.strictEqual(
  tienePermiso(adminUser, 'workout:add_notes'),
  true,
  'Admin debe tener permiso workout:add_notes'
);

assert.strictEqual(
  tienePermiso(adminUser, 'attendance:mark'),
  true,
  'Admin debe tener permiso attendance:mark'
);

assert.strictEqual(
  tienePermiso(adminUser, 'attendance:view_own'),
  true,
  'Admin debe tener permiso attendance:view_own'
);

assert.strictEqual(
  tienePermiso(adminUser, 'user:view'),
  true,
  'Admin debe tener permiso user:view'
);

assert.strictEqual(
  tienePermiso(adminUser, 'user:manage_students'),
  true,
  'Admin debe tener permiso user:manage_students'
);

assert.strictEqual(
  tienePermiso(adminUser, 'user:toggle_temp_assistant'),
  true,
  'Admin debe tener permiso user:toggle_temp_assistant'
);

// 2. Validar que 'assistant_coach' YA NO tiene 'user:toggle_temp_assistant'
const asistenteUser = { id: 20, rol: 'assistant_coach', activo: true, temporary_assistant: false };

assert.strictEqual(
  tienePermiso(asistenteUser, 'user:toggle_temp_assistant'),
  false,
  'Assistant coach ya NO debe tener permiso user:toggle_temp_assistant'
);

assert.strictEqual(
  tienePermiso(asistenteUser, 'workout:write'),
  false,
  'Assistant coach NO debe tener workout:write'
);

assert.strictEqual(
  tienePermiso(asistenteUser, 'workout:read_hidden'),
  true,
  'Assistant coach debe tener workout:read_hidden'
);

// 3. Validar objeto PERMISOS directamente
assert.deepStrictEqual(
  PERMISOS.admin,
  [
    'workout:read_hidden',
    'workout:add_notes',
    'attendance:mark',
    'attendance:view_own',
    'user:view',
    'user:manage_students',
    'user:toggle_temp_assistant'
  ],
  'La lista de permisos de admin debe coincidir exactamente'
);

assert.strictEqual(
  PERMISOS.assistant_coach.includes('user:toggle_temp_assistant'),
  false,
  'PERMISOS.assistant_coach no debe incluir user:toggle_temp_assistant'
);

console.log('✅ Todas las pruebas de permisos del backend pasaron exitosamente!');

