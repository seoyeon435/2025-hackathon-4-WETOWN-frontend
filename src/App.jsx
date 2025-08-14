import './App.css';
import { Outlet } from 'react-router-dom';
import Header from './components/Header/Header';
import BottomNav from './components/BottomNav/BottomNav';


function App() {
  return (
    <div>
      <Header />
      <Outlet />
      <BottomNav />
    </div>
  );
}

export default App;