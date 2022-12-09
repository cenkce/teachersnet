import "./MainNavigation.scss";

export const MainNavigation = () => {
  return (
    <>
      <header className="MainNavigation_header"></header>
      <nav>
        <Navigaton></Navigaton>
        <UserBadge name=""></UserBadge>
      </nav>
    </>
  );
};

export const UserBadge = (props: { name: string }) => {
  return <div className="UserBadge">{props.name}</div>;
};

export const Navigaton = (props: {}) => {
  return <div className="MainNavigation"></div>;
};
