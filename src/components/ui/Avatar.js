// Initials avatar for users and students.
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { layout, radius } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function Avatar({ name, size = layout.avatarSize }) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: radius.pill,
          backgroundColor: colors.brandSoft,
        },
      ]}
    >
      <AppText variant="label" style={{ color: colors.brandDark }}>
        {initials(name) || '?'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
