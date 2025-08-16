// src/pages/Home/SurveyDetail.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiChevronLeft, FiSend } from "react-icons/fi";
import { AiOutlineLike, AiOutlineDislike } from "react-icons/ai";
import surveyDone from "../../components/assets/surveyDone.svg";

import {
  Wrap,
  TopBar, TopBackBtn, TopTitle,
  MetaRow, MetaAvatar, MetaInfo, MetaName,
  TitleBlock, TitleMain, TitleSub, Divider,
  VoteCard, VoteHeader, VoteBtns, VoteBtn,
  ReasonWrap, ReasonInput, SendBtn,
  DoneWrap, DoneIcon, DoneText,
  PrevBtn,
  ResultCard, ResultHeader, ResultBar, YesSeg, NoSeg,
} from "./surveyDetail.styled";

const SurveyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 필요시 API 연동

  // step: 'choose' | 'reason' | 'done' | 'result'
  const [step, setStep] = useState("choose");
  const [choice, setChoice] = useState(null); // 'good' | 'bad'
  const [reason, setReason] = useState("");

  // 데모용 집계 (API 연동 전)
  const [yes, setYes] = useState(27);
  const [no, setNo] = useState(73);

  const handleBack = () => {
    if (step === "reason") {
      setStep("choose"); // 선택 수정 가능
      return;
    }
    // 그 외에는 이전 화면(목록)으로
    navigate(-1);
  };

  const pick = (w) => {
    setChoice(w);
    setStep("reason");
  };

  // 전송 → 집계 반영 후 "완료 화면"
  const onSend = () => {
    if (choice === "good") setYes((v) => v + 1);
    if (choice === "bad") setNo((v) => v + 1);
    setStep("done");
  };

  // ===== 완료 화면 (아이콘 + 문구 + '이전화면' 버튼) =====
  if (step === "done") {
    return (
      <Wrap>
        <DoneWrap>
          <DoneIcon>
            <img src={surveyDone} alt="투표 아이콘" />
          </DoneIcon>
          <DoneText>
            설문 참여가 완료되었습니다. <br />
            오늘의 참여가 내일의 더 나은 동네를 만듭니다.
          </DoneText>

          {/* 이전화면: 완료화면에서 게시판의 결과(투표현황)으로 전환 */}
          <PrevBtn onClick={() => setStep("result")}>이전 화면</PrevBtn>
        </DoneWrap>
      </Wrap>
    );
  }

  // ===== 결과 화면 (상세 + 투표현황) =====
  if (step === "result") {
    const total = yes + no;
    const yesPct = Math.round((yes / total) * 100);
    const noPct = 100 - yesPct;

    return (
      <Wrap>
        {/* 상단 바 */}
        <TopBar>
          <TopBackBtn onClick={() => navigate(-1)} aria-label="뒤로가기">
            <FiChevronLeft />
          </TopBackBtn>
          <TopTitle>설문하기</TopTitle>
          <div style={{ width: 32 }} />
        </TopBar>

        {/* 상세 정보 */}
        <MetaRow>
          <MetaAvatar />
          <MetaInfo><MetaName>장충동 주민센터 담당자 김동국</MetaName></MetaInfo>
        </MetaRow>

        <Divider />

        <TitleBlock>
          <TitleMain>「우리 동네 생활환경 만족도 조사」</TitleMain>
          <TitleSub>
            주민 여러분의 소중한 의견을 반영하여 쾌적하고 안전한 생활환경을 조성하고자 합니다.
            도로, 보도, 가로등, 공원 등 생활 인프라 전반에 대한 만족도를 조사합니다.
            불편사항 개선이 필요한 구체적 의견을 자유롭게 적어주시면 적극 반영하겠습니다.
            수집된 의견은 통계 처리 후 시책 수립에만 활용될 예정입니다.
            많은 참여 부탁드립니다.
          </TitleSub>
        </TitleBlock>

        {/* 투표현황 */}
        <ResultCard>
          <ResultHeader>투표현황</ResultHeader>
          <ResultBar aria-label={`찬성 ${yesPct}%, 반대 ${noPct}%`}>
            <YesSeg style={{ flexBasis: `${yesPct}%` }}>찬성({yesPct}%)</YesSeg>
            <NoSeg  style={{ flexBasis: `${noPct}%`  }}>반대({noPct}%)</NoSeg>
          </ResultBar>
        </ResultCard>

        {/* 이전화면 버튼 (논의 후 결정) */}
        {/* <PrevBtn onClick={() => navigate(-1)}>이전 화면</PrevBtn> */}
      </Wrap>
    );
  }

  // ===== 선택/이유 입력 화면 =====
  return (
    <Wrap>
      {/* 상단 바 */}
      <TopBar>
        <TopBackBtn onClick={handleBack} aria-label="뒤로가기">
          <FiChevronLeft />
        </TopBackBtn>
        <TopTitle>설문하기</TopTitle>
        <div style={{ width: 32 }} />
      </TopBar>

      {/* 작성자/부서 정보 */}
      <MetaRow>
        <MetaAvatar />
        <MetaInfo><MetaName>장충동 주민센터 담당자 김동국</MetaName></MetaInfo>
      </MetaRow>

      <Divider />

      {/* 설문 본문 */}
      <TitleBlock>
        <TitleMain>「우리 동네 생활환경 만족도 조사」</TitleMain>
        <TitleSub>
          주민 여러분의 소중한 의견을 반영하여 쾌적하고 안전한 생활환경을 조성하고자 합니다.
          도로, 보도, 가로등, 공원 등 생활 인프라 전반에 대한 만족도를 조사합니다.
          불편사항 개선이 필요한 구체적 의견을 자유롭게 적어주시면 적극 반영하겠습니다.
          수집된 의견은 통계 처리 후 시책 수립에만 활용될 예정입니다.
          많은 참여 부탁드립니다.
        </TitleSub>
      </TitleBlock>

      {/* 투표 카드 */}
      <VoteCard>
        <VoteHeader>투표</VoteHeader>
        <VoteBtns>
          <VoteBtn
            $active={choice === "good"}
            $kind="good"
            onClick={() => pick("good")}
          >
            <AiOutlineLike />
            <span>만족</span>
          </VoteBtn>
          <VoteBtn
            $active={choice === "bad"}
            $kind="bad"
            onClick={() => pick("bad")}
          >
            <AiOutlineDislike />
            <span>불만족</span>
          </VoteBtn>
        </VoteBtns>

        {step === "reason" && (
          <ReasonWrap>
            <ReasonInput
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="이유를 작성해주세요. (선택 사항)"
              rows={3}
            />
            <SendBtn onClick={onSend} aria-label="전송">
              <FiSend />
            </SendBtn>
          </ReasonWrap>
        )}
      </VoteCard>
    </Wrap>
  );
};

export default SurveyDetail;
