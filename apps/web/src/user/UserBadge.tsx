import { useUserService } from "@teachersnet/user";
import './UserBadge.scss';

export const UserBadge = () => {
  const { user } = useUserService();
  return <div className="UserBadge">{user?.name?.substring(0, 2)}</div>;
};
