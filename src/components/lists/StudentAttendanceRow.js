import { View } from 'react-native';
import { CheckboxRow } from '../ui/CheckboxRow';
import { ToggleRow } from '../ui/ToggleRow';
import { Input } from '../ui/Input';
import { ATTENDANCE } from '../../constants/strings';

function withoutStudent(current, studentId) {
  const next = { ...current };
  delete next[studentId];
  return next;
}

export function StudentAttendanceRow({
  student,
  studentId,
  present,
  onLeave,
  leaveReason,
  reasonMissing,
  disabled,
  setPresentIds,
  setLeaves,
}) {
  function togglePresent() {
    setPresentIds((current) => ({ ...current, [studentId]: !current[studentId] }));
    setLeaves((current) => withoutStudent(current, studentId));
  }

  function changeLeave(value) {
    if (value) {
      setLeaves((current) => ({ ...current, [studentId]: '' }));
      setPresentIds((current) => withoutStudent(current, studentId));
    } else {
      setLeaves((current) => withoutStudent(current, studentId));
    }
  }

  return (
    <View>
      <CheckboxRow
        name={student.name}
        email={student.email}
        checked={present && !onLeave}
        leave={onLeave}
        onToggle={togglePresent}
        disabled={disabled}
      />
      <ToggleRow
        label={ATTENDANCE.onLeave}
        value={onLeave}
        onValueChange={changeLeave}
        disabled={disabled}
      />
      {onLeave ? (
        <Input
          label={ATTENDANCE.leaveReasonLabel}
          multiline
          value={leaveReason}
          error={reasonMissing ? ATTENDANCE.leaveReasonRequired : undefined}
          onChangeText={(text) => setLeaves((current) => ({ ...current, [studentId]: text }))}
          editable={!disabled}
        />
      ) : null}
    </View>
  );
}
