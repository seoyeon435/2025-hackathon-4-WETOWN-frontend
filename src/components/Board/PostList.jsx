import { Link } from "react-router-dom";
import styled from "styled-components";
import PostItem from "./PostItem";

const PostList = ({ posts }) => {
    if (!posts?.length) return <Empty>게시글이 없습니다.</Empty>;

    return (
        <List>
            {posts.map((p) => (
                <Item key={p.id}>
                    <Link to={`/detail/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <h3>{p.title}</h3>
                        <Meta>
                            <span>{p.category}</span>
                            <span>{p.dong}</span>
                            <span>{new Date(p.created_at).toLocaleDateString()}</span>
                        </Meta>
                        <Preview>
                            {p.content?.slice(0, 80)}
                            {p.content?.length > 80 ? "…" : ""}
                        </Preview>
                    </Link>
                </Item>
            ))}
        </List>
    );
};

export default PostList;

const List = styled.div`display:flex; flex-direction:column; gap:12px; padding:0 15px;`;
const Item = styled.div`padding:12px; border:1px solid #eee; border-radius:10px; background:#fff;`;
const Meta = styled.div`display:flex; gap:10px; color:#666; font-size:12px; margin-top:4px;`;
const Preview = styled.p`margin-top:6px; color:#444;`;
const Empty = styled.div`padding:24px; color:#888; text-align:center;`;