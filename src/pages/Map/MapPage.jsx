import { useState } from "react";
import CategoryButtons from "../../components/CategoryButton";
import KakaoMap from "../../components/KakaoMap"; 
import SearchBar from "../../components/Board/SearchBar";



const MapPage = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [search, setSearch] = useState("");

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        console.log("선택된 카테고리:", category);
    };

    
    const handleSearch = () => {
        console.log("검색어:", search);
    }

    return (
        <div style={{ position: "relative", width: "100%", height: "100vh" }}>
            {/* 지도 */}
        <KakaoMap />

        <div style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", width: "95%", zIndex: 10 }}>
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    onSearch={handleSearch}
                />
        </div>
        

        {/* 카테고리 버튼 */}
        <CategoryButtons
            selectedCategory={selectedCategory}
            onClick={handleCategoryClick}
            
        />
        </div>
    );
};


export default MapPage;
