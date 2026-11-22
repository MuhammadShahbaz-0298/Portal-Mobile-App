// Dashboard: greeting, date, stat tiles, attention queue, and shortcuts.
import { Screen } from '../components/ui/Screen';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { SectionTitle } from '../components/ui/SectionTitle';
import { QueueCard } from '../components/lists/QueueCard';
import { ShortcutList } from '../components/lists/ShortcutList';
import { DashboardStats } from '../components/lists/DashboardStats';
import { LoadingState } from '../components/states/LoadingState';
import { ErrorState } from '../components/states/ErrorState';
import { useAuth } from '../hooks/useAuth';
import { useDashboardData } from '../hooks/useDashboardData';
import { PERMISSIONS, ROLE_SETS, can } from '../constants/permissions';
import { DASHBOARD, FEATURES, QUIZZES } from '../constants/strings';
import { ROUTES } from '../constants/app';
import { formatLongDate } from '../utils/dates';
import { queueAssignmentItem, queueSubmissionItem } from '../utils/queueItems';
import { isAdminRole, isStaffRole, isStudentRole } from '../utils/access';
import { useApiData } from '../hooks/useApiData';
import { getWeightedGrades } from '../api/grades';
import { getBatchName, getId } from '../utils/ids';

export function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const staff = isStaffRole(user);
  const student = isStudentRole(user);
  const showStudents = isAdminRole(user) && can(user, PERMISSIONS.STUDENTS_VIEW, ROLE_SETS.ADMIN);
  const canViewGrades = can(user, PERMISSIONS.GRADES_VIEW, ROLE_SETS.LEARNING);
  const dash = useDashboardData(staff, showStudents, student && can(user, PERMISSIONS.QUIZ_VIEW, ROLE_SETS.STUDENT));
  const firstAssignmentBatch = dash.data.assignments.find((item) => item.batch)?.batch;
  const batchId = typeof firstAssignmentBatch === 'object'
    ? getId(firstAssignmentBatch)
    : firstAssignmentBatch;
  const studentId = getId(user);
  const weightedGrade = useApiData(
    () => getWeightedGrades(studentId, { batchId }),
    {
      enabled: student && canViewGrades && Boolean(studentId && batchId),
      reloadKey: `${studentId}:${batchId}`,
    }
  );

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
  const quizItems = dash.data.quizzes.slice(0, 5).map((quiz) => ({
    id: `quiz-${getId(quiz)}`,
    title: quiz.title || DASHBOARD.availableQuizzes,
    detail: `${getBatchName(quiz.batch)} · ${quiz.questions?.length || 0} questions`,
    badgeLabel: QUIZZES.take,
    badgeStatus: 'active',
    onPress: () => navigation.navigate(ROUTES.quizTake, { id: getId(quiz) }),
  }));

  const hour = new Date().getHours();
  let greeting = DASHBOARD.goodEvening;
  if (hour < 12) {
    greeting = DASHBOARD.goodMorning;
  } else if (hour < 18) {
    greeting = DASHBOARD.goodAfternoon;
  }

  const shortcuts = [
    can(user, PERMISSIONS.ASSIGNMENTS_VIEW, ROLE_SETS.LEARNING)
      && { icon: 'document-text-outline', label: DASHBOARD.openAssignmentsLink, to: ROUTES.assignments },
    staff
      ? can(user, PERMISSIONS.SUBMISSIONS_GRADE, ROLE_SETS.STAFF)
        && { icon: 'ribbon-outline', label: DASHBOARD.gradingDesk, to: ROUTES.grading }
      : can(user, PERMISSIONS.SUBMISSIONS_VIEW, ROLE_SETS.LEARNING)
        && { icon: 'cloud-upload-outline', label: DASHBOARD.yourSubmissions, to: ROUTES.submissions },
    staff
      ? can(user, PERMISSIONS.BATCHES_VIEW, ROLE_SETS.STAFF)
        && { icon: 'people-circle-outline', label: DASHBOARD.teachingBatches, to: ROUTES.batches }
      : can(user, PERMISSIONS.ATTENDANCE_VIEW, ROLE_SETS.LEARNING)
        && { icon: 'calendar-outline', label: DASHBOARD.yourAttendance, to: ROUTES.attendance },
    student && can(user, PERMISSIONS.QUIZ_VIEW, ROLE_SETS.STUDENT)
        && { icon: 'help-circle-outline', label: DASHBOARD.availableQuizzes, to: ROUTES.quizList },
    can(user, PERMISSIONS.ASSISTANT_USE, ROLE_SETS.LEARNING)
        && { icon: 'chatbubble-ellipses-outline', label: FEATURES.chat, to: ROUTES.chat },
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
        onRetry={dash.refresh}
      />

      {student ? (
        <QueueCard
          heading={DASHBOARD.availableQuizzes}
          items={quizItems}
          loading={dash.loading}
          emptyText={DASHBOARD.noQuizzes}
          error={dash.quizzesError}
          onRetry={dash.refresh}
        />
      ) : null}

      {student && canViewGrades && batchId ? (
        <Card>
          <SectionTitle title={DASHBOARD.weightedGrade} />
          {weightedGrade.loading ? (
            <LoadingState />
          ) : weightedGrade.error ? (
            <ErrorState message={weightedGrade.error} onRetry={weightedGrade.retry} />
          ) : (
            <>
              <AppText variant="title">
                {typeof weightedGrade.data?.weightedScore === 'number'
                  ? `${weightedGrade.data.weightedScore}%`
                  : weightedGrade.data?.message || DASHBOARD.weightedGradeNotAvailable}
              </AppText>
            </>
          )}
        </Card>
      ) : null}

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
