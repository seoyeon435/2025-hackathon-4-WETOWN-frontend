import styled, { keyframes } from "styled-components";

const BRAND = "#00B890";
const TEXT = "var(--text, #1b1d22)";
const MUTED = "#9aa1a9";
const LINE = "#e9edf1";
const RED = "#E05656";
const GREEN = "#20b26b";

export const Wrap = styled.main`
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  padding: 12px 16px;
  /* padding-top: 70px; */
  padding-bottom: 92px;  /* 하단 네비 여백 */
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

/* 작성자 */
export const MetaRow = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 10px;
  align-items: center;
  margin-top: 6px;
`;
export const MetaAvatar = styled.div`
  width: 40px; height: 40px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #19c5a6, #0aa382);
`;
export const MetaInfo = styled.div``;
export const MetaName = styled.div`
  font-size: 13px; color: ${TEXT};
`;

/* 본문 제목/내용 */
export const Divider = styled.hr`
  margin: 20px 0; border: none; border-top: 1px solid ${LINE};
`;
export const TitleBlock = styled.section`
  margin-top: 6px;
`;
export const TitleMain = styled.h2`
  font-size: 18px; margin: 0 0 10px; font-weight: 800; color: ${TEXT};
`;
export const TitleSub = styled.p`
  margin: 0; font-size: 13px; line-height: 1.6; color: ${MUTED};
`;

/* 투표 카드 */
export const VoteCard = styled.section`
  margin-top: 30px;
  background: #f6f8fa;
  border: 1px solid ${LINE};
  border-radius: 14px;
  padding: 14px;
`;
export const VoteHeader = styled.h3`
  margin: 0 0 10px;
  text-align: center;
  font-size: 14px;
  color: ${TEXT};
  font-weight: 800;
`;
export const VoteBtns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;
export const VoteBtn = styled.button`
  height: 44px;
  border-radius: 999px;
  border: 1px solid ${LINE};
  background: ${({ $active, $kind }) =>
    $active ? ($kind === "good" ? GREEN : RED) : "#e3e6ea"};
  color: ${({ $active }) => ($active ? "#fff" : "#666")};
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 800;
  font-size: 14px;
  svg { width: 18px; height: 18px; }
  transition: background .15s ease, color .15s ease;
  cursor: pointer;
`;

/* 이유 입력 + 전송 */
export const ReasonWrap = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ReasonInput = styled.textarea`
  flex: 1;
  border: 1px solid ${LINE};
  background: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  resize: none;
  ::placeholder { color: #adb3ba; }
`;

export const SendBtn = styled.button`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid ${LINE};
  background: ${BRAND};
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;

  svg {
    width: 18px;
    height: 18px;
  }
`;

/* 완료 화면 */
const glow = keyframes`
  0% { transform: scale(0.96); opacity: .85; }
  50% { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(0.96); opacity: .85; }
`;

export const DoneWrap = styled.div`
  min-height: calc(100dvh - 70px - 92px - 24px);
  display: grid;
  align-content: center;
  justify-items: center;
  text-align: center;
  height: 100%;
  gap: 18px;
`;

export const DoneIcon = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 999px;
  position: relative;
  padding-top: 50px;
  background:
    radial-gradient(70px 70px at 50% 50%, rgba(0,184,144,0.55), transparent 65%),
    radial-gradient(130px 130px at 50% 50%, rgba(0,184,144,0.30), transparent 72%);
    img {
    width: 72px;
    height: 72px;
  }
`;

export const DoneText = styled.p`
  margin: 0;
  text-align: center;
  color: ${TEXT};
  font-weight: 700;
  line-height: 1.5;
`;

/* ===== 결과(투표현황) ===== */
export const ResultCard = styled.section`
  margin-top: 18px;
  background: #f6f8fa;
  border: 1px solid ${LINE};
  border-radius: 14px;
  padding: 16px 14px;
`;

export const ResultHeader = styled.h3`
  margin: 0 0 12px;
  text-align: center;
  font-size: 14px;
  color: ${TEXT};
  font-weight: 800;
`;

export const ResultBar = styled.div`
  display: flex;
  width: 100%;
  height: 44px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid ${LINE};
  background: #e3e6ea;
`;

export const YesSeg = styled.div`
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 13px;
  color: #fff;
  background: #2f65ff;      /* 파란색(찬성) */
`;

export const NoSeg = styled.div`
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 13px;
  color: #fff;
  background: #e05656;      /* 빨간색(반대) */
`;

/* ===== 이전 화면 버튼 ===== */
export const PrevBtn = styled.button`
  margin: 16px auto 0;
  padding: 0 18px;
  height: 44px;
  border: 1px solid ${LINE};
  border-radius: 999px;
  background: #fff;
  color: ${TEXT};
  font-weight: 800;
  font-size: 14px;
  display: block;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform .05s ease;
  &:active { transform: translateY(1px); }
  cursor: pointer;
`;
