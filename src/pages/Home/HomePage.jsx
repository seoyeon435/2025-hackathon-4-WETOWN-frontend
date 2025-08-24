// src/pages/Home/HomePage.jsx
import React, { useEffect, useState } from "react";
import { RiUserVoiceLine, RiMailOpenLine } from "react-icons/ri";
import { AiOutlineLike } from "react-icons/ai";
import { BiChat } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import {
  HomeWrap, Section,
  ActionButtons, ActionCard, ActionEmoji, ActionText, SectionTitle,
  PopularList, PopularItem, ItemTitle, ItemMeta, ItemRight, Vote, Thumb,
  NewsGrid, NewsCard,
} from "./styled";

const API_BASE = (import.meta.env.VITE_BASE_URL || "").replace(/\/+$/, "");

export default function HomePage() {
  const navigate = useNavigate();

  // 데이터 상태
  const [popularPosts, setPopularPosts] = useState([]);
  const [newsList, setNewsList] = useState([]);

  // 섹션별 로딩/에러
  const [loading, setLoading] = useState({ posts: true, news: true });
  const [error, setError] = useState({ posts: "", news: "" });

  // 각 게시글에 좋아요/댓글수를 채워 넣는 유틸
  const augmentPostsWithCounts = async (posts, signal) => {
    const tasks = posts.map(async (p) => {
      const pid = p?.id ?? p?.post_id;
      if (!pid) return { ...p, likes_count: 0, comments_count: 0 };

      try {
        const [detailRes, commentsRes] = await Promise.all([
          fetch(`${API_BASE}/posts/${pid}`, { signal }),
          fetch(`${API_BASE}/posts/${pid}/comments`, { signal }),
        ]);

        let likes = 0;
        let commentsCount = 0;

        if (detailRes.ok) {
          const detail = await detailRes.json();
          likes = detail?.likes_count ?? 0;
        }

        if (commentsRes.ok) {
          const comments = await commentsRes.json();
          const arr = Array.isArray(comments) ? comments : comments?.results ?? [];
          commentsCount = Array.isArray(arr) ? arr.length : 0;
        }

        return { ...p, likes_count: likes, comments_count: commentsCount };
      } catch (e) {
        if (e?.name === "AbortError") throw e;
        return { ...p, likes_count: 0, comments_count: 0 };
      }
    });

    return Promise.all(tasks);
  };

  useEffect(() => {
    const ctrl = new AbortController();

    const loadPosts = async () => {
      try {
        setLoading((s) => ({ ...s, posts: true }));
        setError((e) => ({ ...e, posts: "" }));

        // 1) 인기글 가져오기
        const res = await fetch(`${API_BASE}/posts/top-liked`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`인기 글 요청 실패 (${res.status})`);
        const data = await res.json();
        const baseArr = Array.isArray(data) ? data : data?.results ?? [];

        // 2) 상위 4개만 사용
        const top4 = baseArr.slice(0, 4);

        // 3) 각 게시글의 좋아요/댓글 수 채우기
        const withCounts = await augmentPostsWithCounts(top4, ctrl.signal);

        setPopularPosts(withCounts);
      } catch (e) {
        if (e?.name !== "AbortError") {
          setError((prev) => ({ ...prev, posts: e.message || "인기 글 불러오기 실패" }));
        }
      } finally {
        setLoading((s) => ({ ...s, posts: false }));
      }
    };

    const loadNews = async () => {
      try {
        setLoading((s) => ({ ...s, news: true }));
        setError((e) => ({ ...e, news: "" }));

        const res = await fetch(`${API_BASE}/news/latest-three`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`뉴스 요청 실패 (${res.status})`);
        const data = await res.json(); // [{ id, title, short_title, image_url, ... }]
        setNewsList(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (e) {
        if (e?.name !== "AbortError") {
          setError((prev) => ({ ...prev, news: e.message || "뉴스 불러오기 실패" }));
        }
      } finally {
        setLoading((s) => ({ ...s, news: false }));
      }
    };

    loadPosts();
    loadNews();
    return () => ctrl.abort();
  }, []);

  // 액션 버튼
  const handleReport = () => navigate("/post");
  const handleSurvey = () => navigate("/survey");

  // 게시글 상세
  const goPostDetail = (id) => id && navigate(`/detail/${id}`);

  // 뉴스 상세
  const goNewsDetail = (id) => id && navigate(`/news/${id}`);

  return (
    <HomeWrap>
      {/* 1) 액션 버튼 */}
      <Section>
        <ActionButtons>
          <ActionCard onClick={handleReport}>
            <ActionEmoji aria-hidden><RiUserVoiceLine /></ActionEmoji>
            <ActionText>제보하기</ActionText>
          </ActionCard>
          <ActionCard onClick={handleSurvey}>
            <ActionEmoji aria-hidden><RiMailOpenLine /></ActionEmoji>
            <ActionText>설문하기</ActionText>
          </ActionCard>
        </ActionButtons>
      </Section>

      {/* 2) 인기 글 */}
      <Section>
        <SectionTitle>
          <span>인기 글</span><span className="hot" aria-hidden>🔥</span>
        </SectionTitle>

        <PopularList>
          {(loading.posts ? Array.from({ length: 4 }) : popularPosts).map((post, idx) => {
            if (loading.posts) {
              return (
                <PopularItem key={idx} className="skeleton">
                  <div><ItemTitle>&nbsp;</ItemTitle><ItemMeta>&nbsp;</ItemMeta></div>
                  <ItemRight />
                </PopularItem>
              );
            }

            const title = post?.title ?? "";
            const category = post?.category ?? post?.tag ?? "";
            const location = post?.location ?? post?.area ?? "";
            const date = post?.date ?? (post?.created_at?.slice(0, 10) ?? "");
            const up = post?.likes_count ?? post?.likes ?? 0;          // ← 좋아요 수
            const down = post?.comments_count ?? post?.comments ?? 0;  // ← 댓글 수
            const pid = post?.id ?? post?.post_id;

            return (
              <PopularItem
                key={pid ?? idx}
                role="button"
                tabIndex={0}
                onClick={() => goPostDetail(pid)}
                onKeyDown={(e) => (e.key === "Enter" ? goPostDetail(pid) : null)}
                style={{ cursor: "pointer" }}
                aria-label={`게시글 보기: ${title}`}
                title={title}
              >
                <div>
                  <ItemTitle>“ {title} ”</ItemTitle>
                  <ItemMeta>[{category}] · {location} · {date}</ItemMeta>
                </div>
                <ItemRight>
                  <Vote className="upvote">
                    <Thumb aria-hidden><AiOutlineLike /></Thumb>
                    <span className="count">{up}</span>
                  </Vote>
                  <Vote className="comment">
                    <Thumb aria-hidden><BiChat /></Thumb>
                    <span className="count">{down}</span>
                  </Vote>
                </ItemRight>
              </PopularItem>
            );
          })}
        </PopularList>

        {error.posts && (
          <div style={{ color: "#d00", marginTop: 8, fontSize: 12 }}>{error.posts}</div>
        )}
      </Section>

      {/* 3) 최근 뉴스 */}
      <Section>
        <SectionTitle>최근 뉴스</SectionTitle>
        <NewsGrid>
          {loading.news
            ? [1, 2, 3].map((n) => <NewsCard className="skeleton" key={n} />)
            : newsList.map((n, i) => {
                const id = n?.id ?? i;
                const title = n?.short_title || n?.title || "";
                const img = n?.image_url || "";

                return (
                  <NewsCard
                    key={id}
                    role="button"
                    tabIndex={0}
                    onClick={() => goNewsDetail(id)}
                    onKeyDown={(e) => e.key === "Enter" && goNewsDetail(id)}
                    style={{ height: 190 }}   // ← 높이만 여기서 조절
                  >
                    <div
                      style={{
                        position: "relative",
                        borderRadius: 12,
                        overflow: "hidden",
                        width: "100%",
                        height: "100%",
                      }}
                      aria-label={title}
                      title={title}
                    >
                      {img && (
                        <img
                          src={img}
                          alt={title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      )}

                      {!!title && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            padding: "8px 10px",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 14,
                            textShadow: "0 1px 2px rgba(0,0,0,.6)",
                            background: "linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0))",
                          }}
                        >
                          <span
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              lineHeight: "1.25",
                            }}
                          >
                            {title}
                          </span>
                        </div>
                      )}
                    </div>
                  </NewsCard>
                );
              })}
        </NewsGrid>
        {error.news && (
          <div style={{ color: "#d00", marginTop: 8, fontSize: 12 }}>{error.news}</div>
        )}
      </Section>
    </HomeWrap>
  );
}
