import './App.css';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div>
      <h1>WETOWN 프로젝트</h1>
      <Outlet />
    </div>
  );
}

export default App;
