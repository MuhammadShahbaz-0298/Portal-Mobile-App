// The standard list-screen header: title with optional action, search, optional filter row.
// Every list screen assembles this instead of repeating the same block.
import { StyleSheet, View } from 'react-native';
import { PageHeader } from '../ui/PageHeader';
import { SearchBar } from '../ui/SearchBar';
import { SelectRow } from '../ui/SelectRow';
import { spacing } from '../../constants/theme';

export function ListHeader({
  title,
  subtitle,
  action,
  search,
  onSearchChange,
  filterLabel,
  filterValue,
  options,
  onFilterChange,
}) {
  return (
    <View style={styles.header}>
      <PageHeader title={title} subtitle={subtitle} action={action} />
      <SearchBar value={search} onChangeText={onSearchChange} />
      {options ? (
        <SelectRow
          label={filterLabel}
          value={filterValue}
          valueLabel={options.find((item) => item.value === filterValue)?.label}
          options={options}
          onChange={onFilterChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.md, marginBottom: spacing.lg },
});
