// src/components/BottomNav/styled.js
import styled from "styled-components";

export const NavWrapper = styled.nav`
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 75px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 1000;
    border-radius: 0 0 10px 10px;
    background: var(--bg1, #FFF);
    box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25) inset;
`;

export const NavItem = styled.button`
    background: none;
    border: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    gap: 4px;
    text-align: center;
    font-family: Pretendard;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    color: ${({ $active }) => ($active ? "#00B890" : "var(--text, #000)")};

    svg {
        color: ${({ $active }) => ($active ? "#00B890" : "var(--text, #000)")};
    }

    &:hover {
        font-weight: 600;
    }
`;

export const FloatingButton = styled.button`
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    width: 64px;
    height: 64px;
    background-color: #00B890;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1100;
    padding: 0;
    cursor: pointer;
`;
