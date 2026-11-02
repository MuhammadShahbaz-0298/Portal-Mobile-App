// Role-aware dashboard with counts, quick actions, and upcoming assignments.
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { AppText } from '../components/ui/AppText';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { StatTile } from '../components/ui/StatTile';
import { MenuRow } from '../components/ui/MenuRow';
import { SectionTitle } from '../components/ui/SectionTitle';
import { AssignmentCard } from '../components/lists/AssignmentCard';
import { InfoBanner } from '../components/ui/InfoBanner';
import { useAuth } from '../hooks/useAuth';
import { useApiData } from '../hooks/useApiData';
import { listUsers } from '../api/users';
import { listBatches } from '../api/batches';
import { listAssignments } from '../api/assignments';
import { listSubmissions } from '../api/submissions';
import { listAttendance } from '../api/attendance';
import { PERMISSIONS, hasPermission } from '../constants/permissions';
import { DASHBOARD } from '../constants/strings';
import { ROUTES } from '../constants/app';
import { colors, radius, spacing } from '../constants/theme';
import { todayInput } from '../utils/dates';
import { getDisplayName } from '../utils/ids';

export function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const canStudents = hasPermission(user, PERMISSIONS.STUDENTS_VIEW);
  const canBatches = hasPermission(user, PERMISSIONS.BATCHES_VIEW);
  const canAssignments = hasPermission(user, PERMISSIONS.ASSIGNMENTS_VIEW);
  const canSubmissions = hasPermission(user, PERMISSIONS.SUBMISSIONS_VIEW);
  const canGrade =
    hasPermission(user, PERMISSIONS.SUBMISSIONS_GRADE) && canSubmissions;
  const canAttendance = hasPermission(user, PERMISSIONS.ATTENDANCE_VIEW);
  const students = useApiData(() => listUsers({ limit: 1 }), [], { enabled: canStudents });
  const batches = useApiData(() => listBatches({ limit: 1 }), [], { enabled: canBatches });
  const assignments = useApiData(() => listAssignments({ limit: 1 }), [], {
    enabled: canAssignments,
  });
  const grading = useApiData(() => listSubmissions({ status: 'submitted', limit: 1 }), [], {
    enabled: canGrade,
  });
  const today = useApiData(
    () => listAttendance({ date: todayInput(), limit: 1 }),
    [],
    { enabled: canAttendance }
  );
  const recent = useApiData(() => listAssignments({ limit: 3 }), [], {
    enabled: canAssignments,
  });

  const hint =
    user?.role === 'student'
      ? DASHBOARD.studentHint
      : user?.role === 'teacher'
        ? DASHBOARD.teacherHint
        : DASHBOARD.adminHint;

  function refreshAll() {
    students.refresh();
    batches.refresh();
    assignments.refresh();
    grading.refresh();
    today.refresh();
    recent.refresh();
  }

  const refreshing = [students, batches, assignments, grading, today, recent].some(
    (item) => item.refreshing
  );

  const actions = [
    canGrade && {
      icon: 'ribbon-outline',
      label: DASHBOARD.pendingGrading,
      route: ROUTES.grading,
    },
    hasPermission(user, PERMISSIONS.ASSIGNMENTS_CREATE) && {
      icon: 'document-text-outline',
      label: DASHBOARD.createAssignment,
      route: ROUTES.assignmentForm,
    },
    hasPermission(user, PERMISSIONS.BATCHES_CREATE) && {
      icon: 'people-circle-outline',
      label: DASHBOARD.newBatch,
      route: ROUTES.batchForm,
    },
    hasPermission(user, PERMISSIONS.ATTENDANCE_MANAGE) && {
      icon: 'calendar-outline',
      label: DASHBOARD.markAttendance,
      route: ROUTES.attendanceMark,
    },
    hasPermission(user, PERMISSIONS.STUDENTS_CREATE) && {
      icon: 'person-add-outline',
      label: DASHBOARD.newUser,
      route: ROUTES.userCreate,
    },
  ].filter(Boolean);

  return (
    <Screen
      edges={['top', 'left', 'right']}
      refreshing={refreshing}
      onRefresh={refreshAll}
    >
      <PageHeader
        title={DASHBOARD.greeting(getDisplayName(user))}
        subtitle={hint}
      />

      {canStudents ||
      canBatches ||
      canAssignments ||
      canGrade ||
      canAttendance ? (
        <View style={styles.stats}>
          {canStudents ? (
            <StatTile
              label={DASHBOARD.students}
              value={students.data?.meta?.total ?? '—'}
              icon="people-outline"
              onPress={() => navigation.navigate(ROUTES.users)}
            />
          ) : null}
          {canBatches ? (
            <StatTile
              label={DASHBOARD.batches}
              value={batches.data?.meta?.total ?? '—'}
              icon="albums-outline"
              onPress={() => navigation.navigate(ROUTES.batches)}
            />
          ) : null}
          {canAssignments ? (
            <StatTile
              label={DASHBOARD.assignments}
              value={assignments.data?.meta?.total ?? '—'}
              icon="document-text-outline"
              onPress={() => navigation.navigate(ROUTES.assignments)}
            />
          ) : null}
          {canGrade ? (
            <StatTile
              label={DASHBOARD.pendingGrading}
              value={grading.data?.meta?.total ?? '—'}
              icon="ribbon-outline"
              tone={colors.warning}
              onPress={() => navigation.navigate(ROUTES.grading)}
            />
          ) : null}
          {canAttendance ? (
            <StatTile
              label={DASHBOARD.attendanceToday}
              value={today.data?.meta?.total ?? '—'}
              icon="calendar-outline"
              tone={colors.success}
              onPress={() => navigation.navigate(ROUTES.attendance)}
            />
          ) : null}
        </View>
      ) : null}

      {actions.length ? (
        <>
          <SectionTitle title={DASHBOARD.quickActions} />
          <Card style={styles.actions}>
            {actions.map((action) => (
              <MenuRow
                key={action.label}
                icon={action.icon}
                label={action.label}
                onPress={() => navigation.navigate(action.route)}
              />
            ))}
          </Card>
        </>
      ) : null}

      {canAssignments ? (
        <>
          <SectionTitle title={DASHBOARD.recentAssignments} />
          {recent.error ? <InfoBanner tone="danger" text={recent.error} /> : null}
          {(recent.data?.items || []).length ? (
            <View style={styles.list}>
              {recent.data.items.map((item) => (
                <AssignmentCard
                  key={item._id}
                  assignment={item}
                  onPress={() =>
                    navigation.navigate(ROUTES.assignmentDetail, {
                      assignmentId: item._id,
                    })
                  }
                />
              ))}
            </View>
          ) : (
            <AppText variant="small">{DASHBOARD.noRecent}</AppText>
          )}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actions: { backgroundColor: colors.surface, borderRadius: radius.lg, gap: 0 },
  list: { gap: spacing.sm },
});
