// One text component keeps typography and colors consistent across the app.
import { Text } from 'react-native';
import { fontSize, lineHeight } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

const variants = (colors) => ({
  title: { size: fontSize.xxl, line: lineHeight.xxl, weight: '700', color: colors.ink },
  heading: { size: fontSize.xl, line: lineHeight.xl, weight: '700', color: colors.ink },
  subtitle: { size: fontSize.lg, line: lineHeight.lg, weight: '600', color: colors.ink },
  body: { size: fontSize.md, line: lineHeight.md, weight: '400', color: colors.inkSoft },
  small: { size: fontSize.sm, line: lineHeight.sm, weight: '400', color: colors.muted },
  caption: { size: fontSize.xs, line: lineHeight.xs, weight: '600', color: colors.muted },
  label: { size: fontSize.sm, line: lineHeight.sm, weight: '600', color: colors.inkSoft },
  button: { size: fontSize.md, line: lineHeight.md, weight: '700', color: colors.white },
  error: { size: fontSize.sm, line: lineHeight.sm, weight: '500', color: colors.danger },
  link: { size: fontSize.sm, line: lineHeight.sm, weight: '700', color: colors.brand },
});

export function AppText({ variant = 'body', style, children, ...rest }) {
  const colors = useThemeColors();
  const tokens = variants(colors);
  const token = tokens[variant] || tokens.body;
  return (
    <Text
      {...rest}
      style={[
        {
          fontSize: token.size,
          lineHeight: token.line,
          fontWeight: token.weight,
          color: token.color,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
