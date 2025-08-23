import { useEffect, useState } from "react";
import { getPostDetail } from "../../apis/posts";

export const useDetailPage = (postId) => {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDetail = async () => {
        const data = await getPostDetail(postId);
        setPost(data);
        setComments(Array.isArray(data?.comments) ? data.comments : []);
        return data;
    };

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const data = await getPostDetail(postId);
                if (!alive) return;
                setPost(data);
                setComments(Array.isArray(data?.comments) ? data.comments : []);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [postId]);

    // ✅ 상세 최신화(좋아요 토글 후 호출)
    const refetch = async () => {
        const data = await fetchDetail();
        return data;
    };

    return { post, comments, loading, refetch };
};
