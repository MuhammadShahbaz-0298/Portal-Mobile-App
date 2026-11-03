// Dashboard: greeting, date, stat tiles, attention queue, and shortcuts.
import { Screen } from '../components/ui/Screen';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SectionTitle } from '../components/ui/SectionTitle';
import { QueueCard } from '../components/lists/QueueCard';
import { ShortcutList } from '../components/lists/ShortcutList';
import { DashboardStats } from '../components/lists/DashboardStats';
import { LoadingState } from '../components/states/LoadingState';
import { ErrorState } from '../components/states/ErrorState';
import { useAuth } from '../hooks/useAuth';
import { useDashboardData } from '../hooks/useDashboardData';
import { PERMISSIONS, can } from '../constants/permissions';
import { DASHBOARD } from '../constants/strings';
import { ROUTES } from '../constants/app';
import { formatLongDate } from '../utils/dates';
import { queueAssignmentItem, queueSubmissionItem } from '../utils/queueItems';
import { isAdminRole, isStaffRole, isStudentRole } from '../utils/access';

export function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const staff = isStaffRole(user);
  const student = isStudentRole(user);
  const showStudents = isAdminRole(user) && can(user, PERMISSIONS.STUDENTS_VIEW, ['admin']);
  const dash = useDashboardData(staff, showStudents);

  // Why: on first load a failure shows a full retry screen; stale data stays visible otherwise.
  if (dash.error && dash.noData) {
    return <Screen><ErrorState message={dash.error} onRetry={dash.reload} /></Screen>;
  }
  if (dash.loading) {
    return <Screen><LoadingState /></Screen>;
  }

  const queue = student ? dash.openAssignments : dash.awaiting;
  const queueItems = queue.slice(0, 5).map((item) =>
    student
      ? queueAssignmentItem(item, (id) =>
          navigation.navigate(ROUTES.assignmentDetail, { id })
        )
      : queueSubmissionItem(item, () => navigation.navigate(ROUTES.grading))
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? DASHBOARD.goodMorning : hour < 18 ? DASHBOARD.goodAfternoon : DASHBOARD.goodEvening;

  const shortcuts = [
    can(user, PERMISSIONS.ASSIGNMENTS_VIEW, ['admin', 'teacher', 'student'])
      && { icon: 'document-text-outline', label: DASHBOARD.openAssignmentsLink, to: ROUTES.assignments },
    staff
      ? can(user, PERMISSIONS.SUBMISSIONS_GRADE, ['admin', 'teacher'])
        && { icon: 'ribbon-outline', label: DASHBOARD.gradingDesk, to: ROUTES.grading }
      : can(user, PERMISSIONS.SUBMISSIONS_VIEW, ['admin', 'teacher', 'student'])
        && { icon: 'cloud-upload-outline', label: DASHBOARD.yourSubmissions, to: ROUTES.submissions },
    staff
      ? can(user, PERMISSIONS.BATCHES_VIEW, ['admin', 'teacher'])
        && { icon: 'people-circle-outline', label: DASHBOARD.teachingBatches, to: ROUTES.batches }
      : can(user, PERMISSIONS.ATTENDANCE_VIEW, ['admin', 'teacher', 'student'])
        && { icon: 'calendar-outline', label: DASHBOARD.yourAttendance, to: ROUTES.attendance },
  ].filter(Boolean);

  return (
    <Screen refreshing={dash.refreshing} onRefresh={dash.refresh}>
      <PageHeader
        title={greeting}
        subtitle={`${formatLongDate()} · ${DASHBOARD.subtitle}`}
        action={
          <Button
            title={DASHBOARD.openWorkspace}
            variant="secondary"
            compact
            onPress={() => navigation.navigate(ROUTES.assignments)}
          />
        }
      />

      <DashboardStats
        user={user}
        staff={staff}
        student={student}
        openCount={dash.openAssignments.length}
        awaitingCount={dash.awaiting.length}
        batchesCount={dash.data.batches.length}
        showStudents={showStudents}
        studentsCount={dash.data.studentsCount}
      />

      <QueueCard
        heading={student ? DASHBOARD.attentionStudent : DASHBOARD.awaitingQueue}
        items={queueItems}
        loading={dash.loading}
        emptyText={student ? DASHBOARD.noOpenAssignments : DASHBOARD.nothingAwaiting}
      />

      <Card>
        <SectionTitle title={DASHBOARD.shortcuts} />
        <ShortcutList
          items={shortcuts.map((item) => ({
            ...item,
            onPress: () => navigation.navigate(item.to),
          }))}
        />
      </Card>
    </Screen>
  );
}
