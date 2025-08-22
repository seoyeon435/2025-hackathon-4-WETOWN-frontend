import { useEffect, useState } from "react";
import CategoryButtons from "../../components/CategoryButton";
import KakaoMap from "../../components/KakaoMap";
import SearchBar from "../../components/Board/SearchBar";
import { getPosts } from "../../apis/posts";

const MapPage = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [search, setSearch] = useState("");
    const [posts, setPosts] = useState([]);

    // ✅ 글 데이터 불러오기
    useEffect(() => {
    const fetchPosts = async () => {
        try {
            const data = await getPosts();
            console.log("📌 불러온 글:", data);   // ✅ 여기 확인
            setPosts(data);
        } catch (err) {
            console.error("글 불러오기 실패:", err);
        }
    };
    fetchPosts();
    }, []);


    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    const handleSearch = () => {
        console.log("검색어:", search);
    };

    return (
        <div style={{ position: "relative", width: "100%", height: "100vh" }}>
            {/* ✅ 지도 (posts 넘겨줌) */}
            <KakaoMap posts={posts} lat={37.5585} lng={127.0002} />

            {/* ✅ 검색창 */}
            <div style={{
                position: "absolute", top: "10px", left: "50%",
                transform: "translateX(-50%)", width: "95%", zIndex: 10
            }}>
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    onSearch={handleSearch}
                />
            </div>

            {/* ✅ 카테고리 버튼 */}
            <CategoryButtons
                selectedCategory={selectedCategory}
                onClick={handleCategoryClick}
            />
        </div>
    );
};

export default MapPage;
