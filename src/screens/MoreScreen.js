// More menu: the overflow destinations that do not fit in the bottom tabs.
// Every row comes from NAV_ITEMS, so visibility follows permissions.
import { useState } from 'react';
import { Screen } from '../components/ui/Screen';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { MenuRow } from '../components/ui/MenuRow';
import { SectionTitle } from '../components/ui/SectionTitle';
import { AppText } from '../components/ui/AppText';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Divider } from '../components/ui/Divider';
import { ToggleRow } from '../components/ui/ToggleRow';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { APP, overflowNavSections } from '../constants/app';
import { APPEARANCE, AUTH, COMMON, MORE, NAV } from '../constants/strings';

function MenuRowItem({ item, onPress, showDivider }) {
  return (
    <>
      <MenuRow
        icon={item.icon}
        label={item.title}
        onPress={onPress}
      />
      {showDivider ? <Divider /> : null}
    </>
  );
}

export function MoreScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { resolvedScheme, setPreference, loadError } = useTheme();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const sections = overflowNavSections(user);

  async function onAppearanceChange(nextPreference) {
    try {
      await setPreference(nextPreference);
    } catch {
      toast(APPEARANCE.saveFailed);
    }
  }

  async function onLogout() {
    setBusy(true);
    try {
      await logout();
      toast(AUTH.signedOut);
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

      <Card>
        <ToggleRow
          label={APPEARANCE.title}
          description={APPEARANCE.subtitle}
          value={resolvedScheme === 'dark'}
          onValueChange={(enabled) => onAppearanceChange(enabled ? 'dark' : 'light')}
        />
        {loadError ? <AppText variant="error">{loadError}</AppText> : null}
      </Card>

      {sections.map((group) => (
        <Card key={group.section}>
          <SectionTitle title={group.section} />
          {group.items.map((item, index) => (
            <MenuRowItem
              key={item.name}
              item={item}
              onPress={() => navigation.navigate(item.name)}
              showDivider={index < group.items.length - 1}
            />
          ))}
          {group.section === NAV.account ? (
            <MenuRow
              icon="log-out-outline"
              label={COMMON.signOut}
              onPress={() => setConfirm(true)}
              danger
            />
          ) : null}
        </Card>
      ))}

      {!sections.some((group) => group.section === NAV.account) ? (
        <Card>
          <MenuRow
            icon="log-out-outline"
            label={COMMON.signOut}
            onPress={() => setConfirm(true)}
            danger
          />
        </Card>
      ) : null}

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
