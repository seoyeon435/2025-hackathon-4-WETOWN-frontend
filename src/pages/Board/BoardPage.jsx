import { useState, useEffect,useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import SearchBar from "../../components/Board/SearchBar";
import CategoryButtons2 from "../../components/CategoryButton2";
import AdBanner from "../../components/Board/AdBanner";
import PostList from "../../components/Board/PostList";
// 정적 목데이터 (UI 확인용)
const MOCK_POSTS = [
    {
        id: 1,
        writer: "홍길동",
        title: "정릉3동 가로등 고장",
        content: "밤에 너무 어두워요.",
        created_at: "2025-08-14T11:32:10.123Z",
        category: "치안/안전",
        dong: "정릉3동",
        image: null,
    },
    {
        id: 2,
        writer: "김철수",
        title: "쓰레기 무단 투기",
        content: "길모퉁이에 쓰레기가 쌓여있어요.",
        created_at: "2025-08-15T09:20:00.000Z",
        category: "환경/청결",
        dong: "광희동",
        image: null,
    },
];

// 상단 import는 기존 그대로

const BoardPage = () => {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(""); // "" = 전체
    const [selectedDong, setSelectedDong] = useState("");         // "" = 전체
    const [startDate, setStartDate] = useState("");               // "YYYY-MM-DD" 또는 ""
    const [endDate, setEndDate] = useState("");


    // 정적 UI 단계에서는 화면 표시만. (로컬 필터만 간단 적용)
    const filtered = MOCK_POSTS.filter((p) => {
        const matchCategory = !selectedCategory || p.category === selectedCategory;
        const q = search.trim();
        const matchSearch =
            !q ||
            p.title.includes(q) ||
            p.content.includes(q) ||
            p.dong.includes(q) ||
            p.category.includes(q);
        const matchDong = !selectedDong || p.dong === selectedDong;

        // 날짜 필터 
        const created = new Date(p.created_at).toISOString().slice(0, 10);
        const afterStart = !startDate || created >= startDate;
        const beforeEnd = !endDate || created <= endDate;

        return matchCategory && matchSearch && matchDong && afterStart && beforeEnd;
    });

    return (
        <Page>
            <SearchBar value={search} onChange={setSearch} onSearch={() => { /* 정적 단계: 동작 없음 */ }} />
            <div style={{ marginTop: "0px" , marginBottom: "45px"}}>

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/posts`);
                setPosts(res.data);
            } catch (err) {
                console.error("게시글 불러오기 실패:", err);
            }
        };
        fetchPosts();
    }, []);

    // 소문자/공백 정규화
    const normalize = (v) =>
        (v ?? "")
            .toString()
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " "); // 공백/줄바꿈 모두 일반 스페이스로


    // ISO/Date 모두 안전하게 YYYY-MM-DD 뽑기
    const toYMD = (d) => {
        try {
            return new Date(d).toISOString().slice(0, 10);
        } catch { return ""; }
    };

    // ✅ 검색/필터링 (백엔드 스키마에 맞춤)
    const filtered = useMemo(() => {
        const q = normalize(search);

        return posts.filter((p) => {
            console.log("제목:", p.title, "본문:", p.content);
            const matchCategory =
                !selectedCategory || normalize(p.category) === normalize(selectedCategory);

            const matchDong =
                !selectedDong || normalize(p.dong) === normalize(selectedDong);

            // 검색어: 제목/작성자/상세위치/카테고리/행정동 (본문 필드는 백엔드 스키마에 없음)
            const haystack = [
                p.title,
                p.content,
            ].map(normalize).join(" ");

            const matchSearch = !q || haystack.includes(q);

            // 날짜 범위: created_at 기준
            const created = toYMD(p.created_at);
            const afterStart = !startDate || created >= startDate;
            const beforeEnd = !endDate || created <= endDate;

            console.log({
                title: p.title,
                category: p.category,
                selectedCategory,
                matchCategory,
                dong: p.dong,
                selectedDong,
                matchDong,
                searchQuery: q,
                haystack,
                matchSearch,
                created,
                startDate,
                endDate,
                afterStart,
                beforeEnd
            });

            return matchCategory && matchDong && matchSearch && afterStart && beforeEnd;
        });
    }, [posts, selectedCategory, selectedDong, search, startDate, endDate]);

    // (선택) 날짜 역전 방지: 시작 > 종료이면 스왑
    useEffect(() => {
        if (startDate && endDate && startDate > endDate) {
            setStartDate(endDate);
            setEndDate(startDate);
        }
    }, [startDate, endDate]);

    return (
        <Page>
            <SearchBar value={search} onChange={setSearch} onSearch={() => { }} />

            <div style={{ marginTop: 0, marginBottom: 45 }}>
                <CategoryButtons2
                    selectedCategory={selectedCategory}
                    onClick={setSelectedCategory}
                    
                />
            </div>
            

            <Filters>
                {/* 🔸 백엔드 스키마의 'dong' 값과 동일하게 옵션 구성 */}
                <Select value={selectedDong} onChange={(e) => setSelectedDong(e.target.value)}>
                    <option value="">전체</option>
                    <option value="장충동">장충동</option>
                    <option value="명동">명동</option>
                    <option value="광희동">광희동</option>
                    <option value="약수동">약수동</option>
                    <option value="을지로동">을지로동</option>
                    <option value="필동">필동</option>
                    <option value="회현동">회현동</option>
                    <option value="청구동">청구동</option>
                    <option value="신당동">신당동</option>
                    <option value="황학동">황학동</option>
                </Select>


                <Dates>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <span>~</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </Dates>
            </Filters>

            <AdBanner />

            <PostList posts={filtered} />

            <WriteBtn onClick={() => navigate("/post")}>글쓰기</WriteBtn>

        </Page>
    );
};


export default BoardPage;

/* ---------- styled ---------- */
const Page = styled.div`
    margin-top: 70px; /* 헤더 높이 고려 */
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
