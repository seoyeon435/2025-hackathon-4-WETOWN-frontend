// router.jsx
import { createBrowserRouter } from 'react-router-dom';
import App from './App';

import HomePage from "./pages/Home/HomePage";    
import SurveyPage from "./pages/Home/SurveyPage";
import SurveyDetail from "./pages/Home/SurveyDetail";
import WritePage from "./pages/Write/WritePage";
import MapPage from "./pages/Map/MapPage";
import BoardPage from "./pages/Board/BoardPage";
import NewsPage from "./pages/News/NewsPage";
import DetailPage from "./pages/DetailPage/DetailPage";



const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { path: "/", element: <HomePage /> },
            { path: "/survey", element: <SurveyPage />},
            { path: "/survey/:id", element: <SurveyDetail />},
            { path: "/post", element: <WritePage /> },
            { path: "/map", element: <MapPage /> },
            { path: "/board", element: <BoardPage /> },
            { path: "/news", element: <NewsPage /> },
            { path: "/detail/:postId", element: <DetailPage /> },
        ],
        },
]);

export default router;
