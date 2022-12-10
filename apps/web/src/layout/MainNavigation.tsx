import { useUserService } from "@teachersnet/user";
import LoginButton from "@teachersnet/user/dist/LoginButton";
import { UserBadge } from "../user/UserBadge";
import "./MainNavigation.scss";
  // {!isAuthenticated ? <LoginButton></LoginButton> : <LogoutButton></LogoutButton>}

export const MainNavigation = () => {
  const { isAuthenticated } = useUserService();

  return (
    <>
      <header className="MainNavigation_header"></header>
      <nav>
        <Navigaton></Navigaton>
        <div className="MainNavigation_user">
          {isAuthenticated ? <UserBadge></UserBadge> : <LoginButton></LoginButton>}
        </div>
      </nav>
    </>
  );
};

export const Navigaton = (props: {}) => {
  return <div className="MainNavigation"></div>;
};
