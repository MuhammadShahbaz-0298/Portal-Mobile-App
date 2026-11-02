// Grouped switch list for choosing permissions.
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { ToggleRow } from './ToggleRow';
import { Card } from './Card';
import {
  PERMISSION_GROUPS,
  PERMISSION_GROUP_TITLES,
  PERMISSION_LABELS,
} from '../../constants/permissions';
import { colors, spacing } from '../../constants/theme';

export function PermissionChecklist({ selected = [], onToggle }) {
  return (
    <View style={styles.wrap}>
      {PERMISSION_GROUPS.map((group, index) => (
        <Card key={PERMISSION_GROUP_TITLES[index]}>
          <AppText variant="subtitle">{PERMISSION_GROUP_TITLES[index]}</AppText>
          {group.map((permission, itemIndex) => (
            <View
              key={permission}
              style={itemIndex > 0 ? styles.item : undefined}
            >
              <ToggleRow
                label={PERMISSION_LABELS[permission] || permission}
                value={selected.includes(permission)}
                onValueChange={() => onToggle(permission)}
              />
            </View>
          ))}
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  item: { borderTopWidth: 1, borderTopColor: colors.line },
});
