import { useUserService } from '@teachersnet/user';
import './App.scss';
import { MainLayout } from './layout/MainLayout';

function App() {
  const {isAuthenticated } = useUserService();

  return (
    <div className="App">
      <MainLayout></MainLayout>
      {/* <main>
        {!isAuthenticated ? <LoginButton></LoginButton> : <LogoutButton></LogoutButton>}
      </main> */}
    </div>
  );
}

export default App;
