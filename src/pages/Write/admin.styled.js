import styled from "styled-components";

/** 상단 고정 바 */
export const TopBar = styled.header`
  position: sticky;    /* 탑바가 스크롤 시 상단에 붙도록 */
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  align-items: center;
  height: 48px;
  padding: 0 12px;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
`;

export const TopBackBtn = styled.button`
  height: 32px;
  width: 32px;
  display: grid;
  place-items: center;
  border: none;
  background: transparent;
  cursor: pointer;
  svg { font-size: 20px; }
`;

export const TopTitle = styled.h1`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  text-align: center;
  color: #222;
`;

/** 네비게이션 바 사이 컨텐츠 래퍼 */
export const AdminWrap = styled.div`
  padding: 8px 16px 24px; /* TopBar 아래 살짝 여백 */
  max-width: 560px;
  margin: 0 auto;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0 18px;
`;

export const Label = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #3b3b3b;
`;

export const LabelRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

export const WarnText = styled.span`
  font-size: 11px;
  color: #ff3b30;
  font-weight: 600;
`;

export const CodeBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  input {
    width: 100%;
    height: 40px;
    border-radius: 10px;
    border: 1.2px solid
      ${({ $state }) =>
        $state === "ok"
          ? "#17c964"
          : $state === "fail" || $state === "format"
          ? "#ff3b30"
          : "#e6e6e6"};
    padding: 0 44px 0 12px;
    outline: none;
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.04);
    font-size: 14px;
    ::placeholder {
      color: #b7b7b7;
    }
  }
`;

export const RightAddon = styled.div`
  position: absolute;
  right: 10px;
  display: grid;
  place-items: center;
  color: #17c964;
  svg { display: block; }
`;

export const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #0e9f6e;
  background: #e8fff3;
  border: 1px solid #bff5dc;
`;

export const CaptionSuccess = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #16a34a;
  margin-top: -4px;
`;

export const CaptionError = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #ff3b30;
  margin-top: -4px;
`;

export const Input = styled.input`
  height: 40px;
  border-radius: 10px;
  border: 1.2px solid #e6e6e6;
  padding: 0 12px;
  outline: none;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.04);
  font-size: 14px;
  ::placeholder { color: #b7b7b7; }
`;

export const Textarea = styled.textarea`
  width: 95%;
  border-radius: 10px;
  border: 1.2px solid #e6e6e6;
  padding: 12px;
  outline: none;
  font-size: 14px;
  resize: vertical;
  min-height: 140px;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.04);
  ::placeholder { color: #b7b7b7; }
`;

export const BtnRow = styled.div`
  display: flex;
  gap: 16px;          /* 버튼 간격 넓힘 */
  margin-top: 12px;
  justify-content: center;
`;


export const GhostBlue = styled.button`
  flex: 1;
  min-width: 140px;   /* ✅ 버튼 크기 확대 */
  height: 48px;       /* ✅ 높이 키움 */
  border-radius: 12px;
  border: none;
  background: ${({ $active }) => ($active ? "#2C917B" : "#e8f0ff")};
  color: ${({ $active }) => ($active ? "#fff" : "#356aff")};
  font-weight: 700;
  font-size: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;

  svg {
    font-size: 18px;
  }

  &:hover {
    background: ${({ $active }) => ($active ? "#267866" : "#d0e0ff")};
  }
`;

export const GhostRed = styled(GhostBlue)`
  background: ${({ $active }) => ($active ? "#d64545" : "#ffe8e8")};
  color: ${({ $active }) => ($active ? "#fff" : "#ff5a64")};

  &:hover {
    background: ${({ $active }) => ($active ? "#b73737" : "#ffd6d6")};
  }
`;


export const HiddenDateTime = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
`;

export const SubmitBtn = styled.button`
  width: 120px;
  height: 42px;
  margin: 6px auto 0;
  display: block;
  border: none;
  border-radius: 12px;
  background: ${({ disabled }) => (disabled ? "#9ee2b7" : "#18c964")};
  color: white;
  font-weight: 800;
  font-size: 15px;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.08);
  transition: transform 0.02s ease;
  &:active { transform: translateY(1px); }
`;

export const BottomSpacer = styled.div`
  height: 80px; /* 하단 탭바와 간섭 방지 */
`;
