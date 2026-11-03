// More menu: the overflow destinations that do not fit in the bottom tabs.
// Built entirely from the NAV_ITEMS config; visibility follows permissions.
import { useState } from 'react';
import { Screen } from '../components/ui/Screen';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { MenuRow } from '../components/ui/MenuRow';
import { SectionTitle } from '../components/ui/SectionTitle';
import { AppText } from '../components/ui/AppText';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Divider } from '../components/ui/Divider';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { APP, ROUTES, overflowNavItems } from '../constants/app';
import { NAV, MORE, AUTH, COMMON, PROFILE } from '../constants/strings';

export function MoreScreen({ navigation }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const items = overflowNavItems(user);
  const learning = items.filter((item) =>
    [ROUTES.assignments, ROUTES.submissions, ROUTES.attendance].includes(item.name)
  );
  const management = items.filter((item) =>
    [ROUTES.grading, ROUTES.batches, ROUTES.users, ROUTES.roles].includes(item.name)
  );

  async function onLogout() {
    setBusy(true);
    try {
      await logout();
      toast(COMMON.signOut);
    } catch {
      // AuthContext already cleans up the local session; nothing else to do here.
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  }

  return (
    <Screen>
      <PageHeader title={MORE.title} subtitle={MORE.subtitle} />

      {learning.length ? (
        <>
          <SectionTitle title={MORE.learning} />
          <Card>
            {learning.map((item) => (
              <MenuRow
                key={item.name}
                icon={item.icon}
                label={item.title}
                onPress={() => navigation.navigate(item.name)}
              />
            ))}
          </Card>
        </>
      ) : null}

      {management.length ? (
        <>
          <SectionTitle title={NAV.management} />
          <Card>
            {management.map((item) => (
              <MenuRow
                key={item.name}
                icon={item.icon}
                label={item.title}
                onPress={() => navigation.navigate(item.name)}
              />
            ))}
          </Card>
        </>
      ) : null}

      <SectionTitle title={NAV.account} />
      <Card>
        <MenuRow
          icon="person-circle-outline"
          label={PROFILE.title}
          onPress={() => navigation.navigate(ROUTES.profile)}
        />
        <Divider />
        <MenuRow
          icon="log-out-outline"
          label={COMMON.signOut}
          onPress={() => setConfirm(true)}
          danger
        />
      </Card>

      <AppText variant="caption" style={{ textAlign: 'center' }}>
        {MORE.version}: {APP.version}
      </AppText>

      <ConfirmDialog
        visible={confirm}
        title={AUTH.logoutConfirmTitle}
        body={AUTH.logoutConfirmBody}
        confirmLabel={COMMON.signOut}
        loading={busy}
        onCancel={() => setConfirm(false)}
        onConfirm={onLogout}
      />
    </Screen>
  );
}
