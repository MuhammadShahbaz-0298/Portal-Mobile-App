// Role list and role form copy.
// Split from strings.js so every constant file stays small.

export const ROLES = Object.freeze({
  title: 'Roles',
  subtitle: 'Control what each role can do.',
  newTitle: 'New role',
  editTitle: 'Edit role',
  nameLabel: 'Role name',
  namePlaceholder: 'e.g. Coordinator',
  descriptionLabel: 'Description',
  descriptionPlaceholder: 'What is this role responsible for?',
  permissionsLabel: 'Permissions',
  permissionsHint: 'Select every action this role should be allowed to perform.',
  systemRole: 'System role',
  userCount: 'Users',
  empty: 'No roles yet',
  emptyHint: 'Create a custom role for your team.',
  created: 'Role created.',
  updated: 'Role updated.',
  deleted: 'Role deleted.',
    deleteTitle: 'Delete role?',
    deleteBody:
      'Users with this role may lose access. Reassign them before deleting.',
    pickPermissions: 'Select at least one permission.',
    coreRoleLocked: 'Core roles can be edited but not deleted.',
    customRole: 'Custom',
    labelLabel: 'Display label',
    labelPlaceholder: 'e.g. Coordinator',
    nameHint: 'Lowercase letters, numbers, - or _ only.',
    permissionCount: (count) => `${count} permissions`,
  });
