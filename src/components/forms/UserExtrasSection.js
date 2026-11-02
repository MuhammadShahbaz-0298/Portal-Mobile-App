// Extra permissions checklist shown to admins on create and edit user screens.
// Values are the user's extra grants, layered on top of the role by the backend.
import { AppText } from '../ui/AppText';
import { SectionTitle } from '../ui/SectionTitle';
import { PermissionChecklist } from '../ui/PermissionChecklist';
import { USERS } from '../../constants/strings';

export function UserExtrasSection({ selected, onToggle }) {
  return (
    <>
      <SectionTitle title={USERS.extraPermissions} />
      <AppText variant="small">{USERS.extraPermissionsHint}</AppText>
      <PermissionChecklist selected={selected} onToggle={onToggle} />
    </>
  );
}
