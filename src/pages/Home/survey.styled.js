import styled from "styled-components";

const BRAND = "#00B890";
const TEXT = "var(--text, #1b1d22)";
const MUTED = "#9aa1a9";
const LINE = "#e9edf1";

export const Wrap = styled.main`
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  padding: 12px 16px;
  /* padding-top: 70px; */
  padding-bottom: 92px; /* 하단 네비 공간 */
  box-sizing: border-box;
  background: #fff;
  min-height: 100dvh;

  @media (min-width: 431px) {
    border-left: 1px solid #f2f4f6;
    border-right: 1px solid #f2f4f6;
  }
`;

/* 상단 바 */
export const TopBar = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr 32px; /* 좌:뒤로, 가운데:제목, 우:균형 */
  align-items: center;
  margin-top: 2px;
  margin-bottom: 16px;
`;

export const TopBackBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid white;
  background: #fff;
  display: grid;
  place-items: center;
  svg { width: 18px; height: 18px; color: ${TEXT}; }
  cursor: pointer;
`;

export const TopTitle = styled.h1`
  margin: 0;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: ${TEXT};
`;


export const ListHeader = styled.h3`
  margin: 18px 2px 10px;
  color: ${MUTED};
  font-size: 13px;
  font-weight: 700;
`;

export const SectionTop = styled.section`
  display: flex;
  justify-content: center;
  margin-top: 4px;
`;

export const Segmented = styled.div`
  display: inline-flex;
  background: #f4f6f8;
  border-radius: 999px;
  padding: 4px;
  gap: 6px;
`;

export const SegBtn = styled.button`
  min-width: 88px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: ${({ $active }) => ($active ? "#fff" : "transparent")};
  color: ${({ $active }) => ($active ? TEXT : MUTED)};
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  box-shadow: ${({ $active }) => ($active ? "0 1px 3px rgba(0,0,0,0.06)" : "none")};
  border-color: ${({ $active }) => ($active ? LINE : "transparent")};
`;

export const List = styled.section`
  margin-top: 14px;
  background: #fff;
  border: 1px solid ${LINE};
  border-radius: 12px;
  overflow: hidden;
`;

export const Item = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding: 14px 12px;
  background: ${({ $disabled }) => ($disabled ? "#f4f6f8" : "#fff")};
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
  cursor: pointer;
`;

export const Title = styled.div`
  color: ${({ $disabled }) => ($disabled ? MUTED : TEXT)};
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.2px;
`;

export const More = styled.button`
  border: none;
  background: none;
  color: ${({ $disabled }) => ($disabled ? MUTED : "#8a8f98")};
  font-size: 13px;
`;

export const Divider = styled.hr`
  margin: 0;
  border: none;
  border-top: 1px solid ${LINE};
`;

export const DoneHeader = styled.h3`
  margin: 18px 2px 10px;
  color: ${MUTED};
  font-size: 13px;
  font-weight: 700;
`;

export const DoneBlock = styled.section`
  border: 1px solid ${LINE};
  border-radius: 12px;
  overflow: hidden;
  background: #f4f6f8;
`;
