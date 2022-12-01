import { useUserService } from '@teachersnet/user';
import LoginButton from '@teachersnet/user/dist/LoginButton';
import LogoutButton from '@teachersnet/user/dist/LogoutButton';
import { useEffect } from 'react';
import './App.css';

function App() {
  const {isAuthenticated, getAccessTokenSilently, } = useUserService();
  useEffect(() => {
    getAccessTokenSilently({})
  }, [])
  return (
    <div className="App">
      <header className="App-header">Teachersnet</header>
      <main>
        {!isAuthenticated ? <LoginButton></LoginButton> : <LogoutButton></LogoutButton>}
      </main>
    </div>
  );
}

export default App;
