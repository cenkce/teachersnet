import { Route, Routes } from "react-router-dom";
import { ProfilePage } from "./ProfilePage";


export const ProfileModule = () => {
  return (
    <Routes>
      <Route index element={<ProfilePage></ProfilePage>} />
      <Route path={"me"} element={<ProfilePage></ProfilePage>} />
    </Routes>
  );
};
