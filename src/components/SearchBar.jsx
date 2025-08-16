import styled from "styled-components";


const SearchBar = ({ placeholder }) => {
    return (
        <SearchContainer>
            <Input placeholder={placeholder || "오늘의 이슈를 검색해보세요"} />
        </SearchContainer>
    );
};


// styled-components 정의

const SearchContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 20px;
    background-color: #f2f2f2;
    margin: 12px;
`;

const Input = styled.input`
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 14px;
`;


export default SearchBar;
