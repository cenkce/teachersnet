import { ReactElement } from "react";
import { Route, RouteProps, Routes } from "react-router";
import { ProfilePage } from "./ProfilePage";


export const ProfileModule = () => {
  return (
    <Routes>
      <Route index element={<ProfilePage></ProfilePage>} />
      <Route path={"me"} element={<ProfilePage></ProfilePage>} />
    </Routes>
  );
};
