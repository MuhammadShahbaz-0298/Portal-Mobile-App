// Optional "enroll in a batch" toggle and batch picker shown when creating a student.
// Backend allows any students.create actor with batches.view to pass batchId.
import { ToggleRow } from '../ui/ToggleRow';
import { SelectRow } from '../ui/SelectRow';
import { USERS } from '../../constants/strings';

export function StudentBatchEnroll({
  useBatch,
  onToggleBatch,
  batchOptions,
  batchId,
  onBatchIdChange,
}) {
  return (
    <>
      <ToggleRow
        label={USERS.batchLabel}
        description={USERS.batchHint}
        value={useBatch}
        onValueChange={onToggleBatch}
      />
      {useBatch ? (
        <SelectRow
          label={USERS.pickBatch}
          value={batchId}
          valueLabel={
            batchOptions.find((item) => item.value === batchId)?.label
          }
          options={batchOptions}
          onChange={onBatchIdChange}
        />
      ) : null}
    </>
  );
}
