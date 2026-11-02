// Initials avatar for users and students.
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, layout, radius } from '../../constants/theme';

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
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: radius.pill },
      ]}
    >
      <AppText variant="label" style={styles.text}>
        {initials(name) || '?'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: colors.brandDark },
});
