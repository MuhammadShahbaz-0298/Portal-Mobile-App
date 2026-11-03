// Grouped switch list for choosing role permissions.
// The list itself comes from GET /api/permissions; labels and groups are copy.
import { Card } from './Card';
import { AppText } from './AppText';
import { ToggleRow } from './ToggleRow';
import { PERMISSION_GROUPS, PERMISSION_LABELS } from '../../constants/permissions';
import { ROLES } from '../../constants/strings';
import { spacing } from '../../constants/theme';

export function PermissionChecklist({ catalog = [], selected = [], onToggle }) {
  const available = new Set(catalog);
  const groups = Object.entries(PERMISSION_GROUPS)
    .map(([label, members]) => [
      label,
      members.filter((permission) => available.has(permission)),
    ])
    .filter(([, members]) => members.length);
  const grouped = new Set(groups.flatMap(([, members]) => members));
  const rest = catalog.filter((permission) => !grouped.has(permission));
  if (rest.length) groups.push(['Other', rest]);

  if (!catalog.length) {
    return <AppText variant="small">{ROLES.noPermissions}</AppText>;
  }

  return (
    <>
      {groups.map(([label, members]) => (
        <Card key={label} style={{ gap: 0 }}>
          <AppText variant="subtitle" style={{ marginBottom: spacing.sm }}>
            {label}
          </AppText>
          {members.map((permission) => (
            <ToggleRow
              key={permission}
              label={PERMISSION_LABELS[permission] || permission}
              value={selected.includes(permission)}
              onValueChange={() => onToggle(permission)}
            />
          ))}
        </Card>
      ))}
    </>
  );
}
