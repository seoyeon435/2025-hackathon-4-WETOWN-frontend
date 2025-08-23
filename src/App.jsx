import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header/Header";
import BottomNav from "./components/BottomNav/BottomNav"; 

const App = () => {
  return (
    <>
      <Header />
      <Outlet />        {/* 자식 라우트(Home, Survey 등)가 여기 렌더링됨 */}
      <BottomNav />
    </>
  );
};

export default App;
