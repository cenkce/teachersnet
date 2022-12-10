import { useUserService } from "@teachersnet/user";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";
import "./App.scss";
import { MainLayout } from "./layout/MainLayout";
import { ProfileModule } from "./modules/profile";
import { RequireAuth } from "./user/RequireAuth";

function App() {
  const { isAuthenticated } = useUserService();
  return (
    <div className="App">
      <MainLayout>
        <header></header>
        <section>
          <RequireAuth>
            <Routes>
              <Route
                path="/"
                caseSensitive={true}
                element={<Navigate to={"/user"} replace></Navigate>}
              />
              <Route path="/user/*" element={<ProfileModule></ProfileModule>} />
            </Routes>
          </RequireAuth>
          <Outlet />
        </section>
        <footer></footer>
      </MainLayout>
    </div>
  );
}

export default App;
