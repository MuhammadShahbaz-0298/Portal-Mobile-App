// More menu with management shortcuts and account actions.
import { useState } from 'react';
import { Screen } from '../components/ui/Screen';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { MenuRow } from '../components/ui/MenuRow';
import { SectionTitle } from '../components/ui/SectionTitle';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { PERMISSIONS, hasPermission } from '../constants/permissions';
import { MORE, COMMON, AUTH, NAV } from '../constants/strings';
import { ROUTES } from '../constants/app';

export function MoreScreen({ navigation }) {
  const { user, logout, logoutAll } = useAuth();
  const toast = useToast();
  const canAssignments = hasPermission(user, PERMISSIONS.ASSIGNMENTS_VIEW);
  const canSubmissions = hasPermission(user, PERMISSIONS.SUBMISSIONS_VIEW);
  const canAttendance = hasPermission(user, PERMISSIONS.ATTENDANCE_VIEW);
  const canUsers = hasPermission(user, PERMISSIONS.STUDENTS_VIEW);
  const canBatches = hasPermission(user, PERMISSIONS.BATCHES_VIEW);
  const canRoles = hasPermission(user, PERMISSIONS.ROLES_MANAGE);
  const canGrade =
    hasPermission(user, PERMISSIONS.SUBMISSIONS_GRADE) && canSubmissions;
  const canLearn = canAssignments || canSubmissions || canAttendance;
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    setBusy(true);
    try {
      if (confirm === 'all') await logoutAll();
      else await logout();
      toast(COMMON.signOut);
    } catch {
      // AuthContext already handles session cleanup.
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <PageHeader title={MORE.title} subtitle={MORE.subtitle} />
      {canLearn ? (
        <>
          <SectionTitle title={MORE.learning} />
          <Card>
            {canAssignments ? (
              <MenuRow
                icon="document-text-outline"
                label={MORE.assignments}
                onPress={() => navigation.navigate(ROUTES.assignments)}
              />
            ) : null}
            {canSubmissions ? (
              <MenuRow
                icon="cloud-upload-outline"
                label={MORE.submissions}
                onPress={() => navigation.navigate(ROUTES.submissions)}
              />
            ) : null}
            {canAttendance ? (
              <MenuRow
                icon="calendar-outline"
                label={MORE.attendance}
                onPress={() => navigation.navigate(ROUTES.attendance)}
              />
            ) : null}
          </Card>
        </>
      ) : null}

      {canGrade || canUsers || canBatches || canRoles ? (
        <>
          <SectionTitle title={NAV.management} />
          <Card>
            {canGrade ? (
              <MenuRow
                icon="ribbon-outline"
                label={MORE.grading}
                onPress={() => navigation.navigate(ROUTES.grading)}
              />
            ) : null}
            {canBatches ? (
              <MenuRow
                icon="people-circle-outline"
                label={MORE.batches}
                onPress={() => navigation.navigate(ROUTES.batches)}
              />
            ) : null}
            {canUsers ? (
              <MenuRow
                icon="people-outline"
                label={MORE.users}
                onPress={() => navigation.navigate(ROUTES.users)}
              />
            ) : null}
            {canRoles ? (
              <MenuRow
                icon="shield-checkmark-outline"
                label={MORE.roles}
                onPress={() => navigation.navigate(ROUTES.roles)}
              />
            ) : null}
          </Card>
        </>
      ) : null}

      <SectionTitle title={NAV.account} />
      <Card>
        <MenuRow
          icon="person-circle-outline"
          label={NAV.profile}
          onPress={() => navigation.navigate(ROUTES.profile)}
        />
        <MenuRow
          icon="log-out-outline"
          label={COMMON.signOut}
          onPress={() => setConfirm('one')}
        />
        <MenuRow
          icon="exit-outline"
          label={AUTH.logoutAll}
          onPress={() => setConfirm('all')}
          danger
        />
      </Card>

      <ConfirmDialog
        visible={confirm === 'one'}
        title={AUTH.logoutConfirmTitle}
        body={AUTH.logoutConfirmBody}
        confirmLabel={COMMON.signOut}
        loading={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={onLogout}
      />
      <ConfirmDialog
        visible={confirm === 'all'}
        title={AUTH.logoutAll}
        body={AUTH.logoutAllBody}
        confirmLabel={AUTH.logoutAll}
        danger
        loading={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={onLogout}
      />
    </Screen>
  );
}
