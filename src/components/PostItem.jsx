import styled from "styled-components";


const PostItem = ({ title, info, likes, comments }) => {
    return (
        <PostContainer>
            <PostContent>
                <Title>{title}</Title>
                <Info>{info}</Info>
                <Stats>❤️ {likes} 💬 {comments}</Stats>
            </PostContent>
            <Thumbnail />
        </PostContainer>
    );
};


const PostContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
`;

const PostContent = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: 14px;
  margin: 0 0 4px 0;
`;

const Info = styled.div`
  font-size: 12px;
  color: gray;
`;

const Stats = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const Thumbnail = styled.div`
  width: 50px;
  height: 50px;
  background: #ddd;
  border-radius: 6px;
  margin-left: 8px;
`;


export default PostItem;
