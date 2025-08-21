import { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import SearchBar from "../../components/Board/SearchBar";
import CategoryButtons2 from "../../components/CategoryButton2";
import AdBanner from "../../components/Board/AdBanner";
import PostList from "../../components/Board/PostList";

const BoardPage = () => {
    const [posts, setPosts] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDong, setSelectedDong] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // 백엔드에서 글 목록 불러오기
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/posts`);
                console.log("불러온 데이터:", res.data);
                setPosts(res.data); 
            } catch (err) {
                console.error("게시글 불러오기 실패:", err);
            }
        };
        fetchPosts();
    }, []);

    // 검색/필터링
    const filtered = posts.filter((p) => {
        const matchCategory = !selectedCategory || p.category === selectedCategory;
        const q = search.trim();
        const matchSearch =
            !q ||
            p.title.includes(q) ||
            p.content.includes(q) ||
            p.dong.includes(q) ||
            p.category.includes(q);
        const matchDong = !selectedDong || p.dong === selectedDong;

        const created = new Date(p.created_at).toISOString().slice(0, 10);
        const afterStart = !startDate || created >= startDate;
        const beforeEnd = !endDate || created <= endDate;

        return matchCategory && matchSearch && matchDong && afterStart && beforeEnd;
    });

    return (
        <Page>
            <SearchBar value={search} onChange={setSearch} onSearch={() => {}} />

            <div style={{ marginTop: "0px", marginBottom: "45px" }}>
                <CategoryButtons2
                    selectedCategory={selectedCategory}
                    onClick={setSelectedCategory}
                />
            </div>

            <Filters>
                <Select value={selectedDong} onChange={(e) => setSelectedDong(e.target.value)}>
                    <option value="">전체</option>
                    <option value="광희동">광희동</option>
                    <option value="다산동">다산동</option>
                    <option value="신당동">신당동</option>
                    <option value="약수동">약수동</option>
                    <option value="을지로동">을지로동</option>
                    <option value="황학동">황학동</option>
                    <option value="정릉3동">정릉3동</option>
                </Select>

                <Dates>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <span>~</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </Dates>
            </Filters>

            <AdBanner />

            {/* 🔥 실제 데이터로 바뀐 PostList */}
            <PostList posts={filtered} />
        </Page>
    );
};

export default BoardPage;

/* ---------- styled ---------- */
const Page = styled.div`
    margin-top: 0; /* 헤더 높이 고려 */
`;

const Filters = styled.div`
    display: flex;
    gap: 15px;
    align-items: center;
    padding: 0 15px 8px 15px;
`;

const Select = styled.select`
    padding: 4px 6px;
    border-radius: 8px;
    border: 1px solid #ddd;
    background: #fff;
`;

const Dates = styled.div`
    display: flex;
    gap: 5px;
    align-items: center;
    & > input {
        width: 100px;  
        height: 20px;       
        padding: 2px 4px;     
        font-size: 12px;      
        border-radius: 6px;   
        border: 1px solid #ddd;
    }
`;
