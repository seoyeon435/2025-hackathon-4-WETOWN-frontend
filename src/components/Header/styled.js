// src/components/Header/styled.js
import styled from "styled-components";

export const HeaderWrapper = styled.header`
    width: 100%;
    height: 56px;
    /* background-color: #ffffff; */
    border-bottom: 1px solid #eaeaea;
    border-radius: 0 0 10px 10px;
    background: var(--main, #3851EC);
    display: flex;
    align-items: center;
    /* justify-content: center; */
    padding-left: 16px;
    position: fixed;
    top: 0;
    z-index: 1000;
    /* padding: 5% 30px 2% 7px; */

    @media (min-width: 768px) {
        height: 64px;
    }
`;

export const Title = styled.h1`
    color: var(--bg1, #FFF);
    font-family: Pretendard;
    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;

    @media (min-width: 768px) {
        font-size: 20px;
    }
`;
