import styled from "styled-components";
import NewsCard from "../../components/News/NewsCard";
import { useNewsList } from "../../hooks/News/useNewsList";

export default function NewsPage() {
  const { news, loading } = useNewsList();

  if (loading) return <Loading>불러오는 중...</Loading>;

  if (!news || news.length === 0) {
    return (
      <Wrap>
        <Empty>표시할 뉴스가 없습니다.</Empty>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <Grid>
        {news.map((n) => (
          <NewsCard
            key={n.id ?? n.news_id ?? n.slug}
            id={n.id ?? n.news_id}
            title={n.short_title ?? n.title}
            image_url={n.image_url ?? n.imageUrl ?? "/default.jpg"}
          />
        ))}
      </Grid>
    </Wrap>
  );
}

/* ---------- styles ---------- */
const Wrap = styled.div`
  max-width: 420px;
  margin: 0 auto;
  padding: 12px;
`;

const Loading = styled.div`
  padding: 60px 0;
  text-align: center;
  color: #777;
`;

const Empty = styled(Loading)``;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3열 */
  gap: 2px;
`;