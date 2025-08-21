// src/pages/HomePage.jsx
import React, { useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { RiUserVoiceLine, RiMailOpenLine } from "react-icons/ri";
import { AiOutlineLike } from "react-icons/ai";
import { BiChat } from "react-icons/bi";
import { useNavigate } from "react-router-dom";


import {
  HomeWrap,
  Section,
  SearchBar,
  SearchIcon,
  SearchInput,
  SearchSubmit,
  ActionButtons,
  ActionCard,
  ActionEmoji,
  ActionText,
  SectionTitle,
  PopularList,
  PopularItem,
  ItemTitle,
  ItemMeta,
  ItemRight,
  Vote,
  Thumb,
  NewsGrid,
  NewsCard,
  SearchWrap,
  SuggestPanel,
  SuggestTitle,
  ChipGrid,
  Chip,
} from "./styled";

const HomePage = () => {
  const navigate = useNavigate();
  // 임시 데이터
  const popularPosts = [
    { id: 1, title: "교문 가로등이 고장났어요.", category: "불편 / 안전", location: "충주시 주덕읍", date: "2025.08.13", up: 203, down: 20 },
    { id: 2, title: "민원 제목", category: "불편 / 안전", location: "충주시청 자치행정과 민원담당 일", date: "2025.08.12", up: 203, down: 20 },
    { id: 3, title: "민원 제목", category: "불편 / 안전", location: "충주시청 자치행정과 민원담당 일", date: "2025.08.12", up: 203, down: 20 },
    { id: 4, title: "민원 제목", category: "불편 / 안전", location: "충주시청 자치행정과 민원담당 일", date: "2025.08.12", up: 203, down: 20 },
  ];
  const newsPlaceholders = [1, 2, 3];

  // 검색 바 누르면 해시태그
  const [query, setQuery] = useState("");
  const [openSuggest, setOpenSuggest] = useState(false);
  const blurTimer = useRef(null);

  const trending = [
    "가로등",
    "민생지원금",
    "음식물 쓰레기",
    "지역행정",
    "놀이터",
  ];

  const handleReport = () => {
    navigate("/post");
  };
  const handleSurvey = () => {};

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    // e.g., navigate(`/search?q=${encodeURIComponent(q)}`)
  };

  const onFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setOpenSuggest(true);
  };

  const onBlur = () => {
    // 칩 클릭 여유 시간
    blurTimer.current = setTimeout(() => setOpenSuggest(false), 120);
  };

  const onChipClick = (text) => {
    setQuery(text);
    setOpenSuggest(false);
    // 바로 검색 원하면 아래 주석 해제
    // navigate(`/search?q=${encodeURIComponent(text)}`)
  };

  return (
    <HomeWrap>
      {/* 1) 검색 & 액션 버튼 */}
      <Section>
        <SearchWrap>
          <SearchBar onSubmit={handleSearch}>
            <SearchIcon aria-hidden><FiSearch /></SearchIcon>
            <SearchInput
              type="search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="'충무로 민원'을 검색해보세요"
              aria-label="민원 검색"
            />
            <SearchSubmit type="submit" aria-label="검색">검색</SearchSubmit>
          </SearchBar>

          {openSuggest && (
            <SuggestPanel onMouseDown={(e) => e.preventDefault()}>
              <SuggestTitle>실시간 인기검색어</SuggestTitle>
              <ChipGrid>
                {trending.map((t, i) => (
                  <Chip key={i} onClick={() => onChipClick(t)}>
                    #{t}
                  </Chip>
                ))}
              </ChipGrid>
            </SuggestPanel>
          )}
        </SearchWrap>

        <ActionButtons>
          <ActionCard onClick={handleReport}>
            <ActionEmoji aria-hidden><RiUserVoiceLine /></ActionEmoji>
            <ActionText>제보하기</ActionText>
          </ActionCard>

          <ActionCard onClick={() => navigate("/survey")}>
            <ActionEmoji aria-hidden><RiMailOpenLine /></ActionEmoji>
            <ActionText>설문하기</ActionText>
          </ActionCard>
        </ActionButtons>
      </Section>

      {/* 2) 인기 글 */}
      <Section>
        <SectionTitle>
          <span>인기 글</span>
          <span className="hot" aria-hidden>🔥</span>
        </SectionTitle>

        <PopularList>
          {popularPosts.map((post) => (
            <PopularItem key={post.id}>
              <div>
                <ItemTitle>“ {post.title} ”</ItemTitle>
                <ItemMeta>[{post.category}] · {post.location} · {post.date}</ItemMeta>
              </div>

              <ItemRight>
                <Vote className="upvote">
                  <Thumb aria-hidden><AiOutlineLike /></Thumb>
                  <span className="count">{post.up}</span>
                </Vote>
                <Vote className="comment">
                  <Thumb aria-hidden><BiChat /></Thumb>
                  <span className="count">{post.down}</span>
                </Vote>
              </ItemRight>
            </PopularItem>
          ))}
        </PopularList>
      </Section>

      {/* 3) 최근 뉴스 */}
      <Section>
        <SectionTitle>최근 뉴스</SectionTitle>
        <NewsGrid>
          {newsPlaceholders.map((n) => (
            <NewsCard className="skeleton" key={n} />
          ))}
        </NewsGrid>
      </Section>
    </HomeWrap>
  );
};

export default HomePage;
