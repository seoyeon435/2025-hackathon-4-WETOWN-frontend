// src/pages/DetailPage/DetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as S from "./DetailPage.styled";
import { FiMessageCircle, FiBookmark, FiSend } from "react-icons/fi";
import { AiOutlineLike } from "react-icons/ai";
import { useDetailPage } from "../../hooks/DetailPage/useDetailPage";
import instance from "../../apis/instance"; // axios 인스턴스

const DetailPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const { post, comments, loading, refetch } = useDetailPage(postId);

    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [liking, setLiking] = useState(false);

    useEffect(() => {
        if (!post) return;
        setLikes(Number(post.likes_count ?? 0));
        setIsLiked(Boolean(post.is_liked));
    }, [post]);

    const handleLike = async () => {
        if (liking) return;
        setLiking(true);

        try {
            let res;
            if (isLiked) {
                // ✅ 좋아요 취소 (DELETE는 반드시 { data: {} } 형태로 보내야 함)
                res = await instance.delete(`/posts/${postId}/like`, { data: {} });
            } else {
                // ✅ 좋아요 추가
                res = await instance.post(`/posts/${postId}/like`, {});
            }

            if (res?.data) {
                setLikes(Number(res.data.likes_count));
                setIsLiked(Boolean(res.data.is_liked));
            } else {
                // 만약 응답이 비어 있으면 refetch
                const fresh = await refetch();
                setLikes(Number(fresh.likes_count ?? 0));
                setIsLiked(Boolean(fresh.is_liked));
            }
        } catch (e) {
            console.error("좋아요 요청 실패:", e);
        } finally {
            setLiking(false);
        }
    };

    if (loading) {
        return (
            <S.Wrap>
                <S.Header>
                    <S.Brand>WE:TOWN</S.Brand>
                </S.Header>
                <S.Loading>불러오는 중…</S.Loading>
            </S.Wrap>
        );
    }

    if (!post) {
        return (
            <S.Wrap>
                <S.Header>
                    <S.Brand>WE:TOWN</S.Brand>
                </S.Header>
                <S.Loading>게시글이 없습니다.</S.Loading>
            </S.Wrap>
        );
    }

    return (
        <S.Wrap>
            <S.Header>
                <S.BackBtn onClick={() => navigate(-1)} aria-label="뒤로가기">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 10L13 19L14.4 17.5L7 10L14.4 2.5L13 1L4 10Z" fill="black" />
                    </svg>
                </S.BackBtn>
            </S.Header>

            <S.Card>
                <S.AuthorRow>
                    <S.Avatar />
                    <div>
                        <S.Author>{post.writer ?? "익명"}</S.Author>
                        <S.DateText>{formatDate(post.created_at)}</S.DateText>
                    </div>
                </S.AuthorRow>

                <S.TitleBox>
                    {post.category && <S.Chip>[ {post.category} ]</S.Chip>}
                    <S.Title>{post.title}</S.Title>
                    {post.content && <S.BodyText>{post.content}</S.BodyText>}
                </S.TitleBox>

                {post.image ? (
                    <S.ImageBox>
                        <img src={post.image} alt="post" />
                    </S.ImageBox>
                ) : (
                    <S.ImagePlaceholder />
                )}

                <S.MetaBar>
                    <S.MetaLeft>
                        {/* 좋아요 버튼 */}
                        <S.MetaItem
                            highlight
                            onClick={handleLike}
                            style={{ cursor: liking ? "not-allowed" : "pointer", opacity: liking ? 0.6 : 1 }}
                            title={isLiked ? "좋아요 취소" : "좋아요"}
                            aria-pressed={isLiked}
                        >
                            <AiOutlineLike color={isLiked ? "#e11d48" : "#111"} />
                            <span>{likes}</span>
                        </S.MetaItem>

                        <S.MetaItem title="댓글 수">
                            <FiMessageCircle />
                            <span>{comments.length}</span>
                        </S.MetaItem>
                    </S.MetaLeft>

                    <S.MetaRight>
                        <S.IconBtn aria-label="bookmark">
                            <FiBookmark />
                        </S.IconBtn>
                    </S.MetaRight>
                </S.MetaBar>
            </S.Card>

            <S.CommentsWrap>
                {comments.map((c, idx) => (
                    <S.CommentItem key={c.id ?? idx}>
                        <S.No>익명 {idx + 1}</S.No>
                        <S.Bubble>{c.content}</S.Bubble>
                    </S.CommentItem>
                ))}
            </S.CommentsWrap>

            <S.CommentBar>
                <S.Input placeholder="댓글을 입력하세요." />
                <S.SendBtn aria-label="send">
                    <FiSend size={18} />
                </S.SendBtn>
            </S.CommentBar>
        </S.Wrap>
    );
};

export default DetailPage;

function formatDate(d) {
    if (!d) return "";
    const date = new Date(d);
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${y} / ${m} / ${day}`;
}
