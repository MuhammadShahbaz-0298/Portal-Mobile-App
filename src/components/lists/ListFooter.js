// Pagination summary and a single Load more action.
import { StyleSheet, View } from 'react-native';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { COMMON } from '../../constants/strings';
import { spacing } from '../../constants/theme';

export function ListFooter({ loaded = 0, total = 0, loading = false, onLoadMore }) {
  if (!total && !loaded) return null;
  return (
    <View style={styles.container}>
      <AppText variant="caption">
        {COMMON.showingCount(loaded)} {COMMON.ofTotal(total)}
      </AppText>
      {loaded < total && onLoadMore ? (
        <Button
          title={COMMON.loadMore}
          variant="secondary"
          loading={loading}
          onPress={onLoadMore}
          compact
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
});
