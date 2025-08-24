// src/pages/Home/SurveyDetail.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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

const API_BASE = (import.meta.env.VITE_BASE_URL || "").replace(/\/+$/, "");

/* =========================
   결과 응답 파싱: normalize
   ========================= */
function normalizeResults(raw) {
  if (!raw) return { yes: 0, no: 0 };

  const toNum = (v) => {
    if (v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const lowerObj = (obj) =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [String(k).toLowerCase(), v]));

  // 객체형
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const obj = lowerObj(raw);
    const inner =
      (obj.counts && lowerObj(obj.counts)) ||
      (obj.results && lowerObj(obj.results)) ||
      obj;

    // 가능한 키들을 폭넓게 매핑
    const yes =
      toNum(inner.yes) ??
      toNum(inner.yes_count) ??
      toNum(inner.agree) ??
      toNum(inner.agree_count) ??
      toNum(inner.satisfied) ??
      toNum(inner.satisfied_count) ??
      toNum(inner.good) ??
      toNum(inner.true) ??
      0;

    const no =
      toNum(inner.no) ??
      toNum(inner.no_count) ??
      toNum(inner.disagree) ??
      toNum(inner.disagree_count) ??
      toNum(inner.unsatisfied) ??
      toNum(inner.unsatisfied_count) ??
      toNum(inner.bad) ??
      toNum(inner.false) ??
      0;

    // 비율만 주는 경우
    const yRatio =
      toNum(inner.yes_ratio) ??
      toNum(inner.agree_ratio) ??
      toNum(inner.good_ratio);
    const nRatio =
      toNum(inner.no_ratio) ??
      toNum(inner.disagree_ratio) ??
      toNum(inner.bad_ratio);

    if (yes || no) return { yes, no };
    if (Number.isFinite(yRatio) || Number.isFinite(nRatio)) {
      const y = Math.max(0, Math.min(1, yRatio ?? 1 - (nRatio ?? 0)));
      const n = 1 - y;
      // 비율만 있으면 퍼센트 정수로 반환
      return { yes: Math.round(y * 100), no: Math.round(n * 100), isRatioOnly: true };
    }
  }

  // 배열형
  if (Array.isArray(raw)) {
    let yes = 0, no = 0;
    for (const it of raw) {
      const item = typeof it === "object" ? it : {};
      const key = (item.key ?? item.name ?? item.option ?? item.label ?? "")
        .toString()
        .toLowerCase();
      const cnt = toNum(item.count ?? item.value ?? item.total ?? item.cnt ?? 0) ?? 0;
      if (["yes", "agree", "satisfied", "good", "y", "true", "찬성"].includes(key)) yes += cnt;
      else if (["no", "disagree", "unsatisfied", "bad", "n", "false", "반대"].includes(key)) no += cnt;
    }
    return { yes, no };
  }

  return { yes: 0, no: 0 };
}

/* =========================
   투표 전송: 다양한 스키마 대응
   ========================= */
async function tryPostVote(id, choice, reason) {
  const endpoints = [
    `${API_BASE}/surveys/${id}/vote/`,
    `${API_BASE}/surveys/${id}/vote`,
  ];

  const bool = choice === "good"; // good → 찬성/만족
  const bodies = [
    { choice: bool ? "yes" : "no", reason },
    { vote: bool ? "agree" : "disagree", reason },
    { is_agree: bool, reason },
    { satisfied: bool, reason },
    { value: bool ? 1 : 0, reason },
  ];

  for (const url of endpoints) {
    for (const body of bodies) {
      try {
        const res = await axios.post(url, body, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        if (res.status >= 200 && res.status < 300) return { ok: true };
      } catch (e) {
        // console.warn("[vote fail]", url, body, e?.response?.status, e?.response?.data);
      }
    }
  }
  return { ok: false };
}

/* =========================
   결과 조회 (슬래시 유/무 시도)
   ========================= */
async function fetchResultsOnce(id) {
  const urls = [
    `${API_BASE}/surveys/${id}/results/`,
    `${API_BASE}/surveys/${id}/results`,
  ];
  for (const u of urls) {
    try {
      const { data } = await axios.get(u, { withCredentials: true });
      return normalizeResults(data);
    } catch (e) {
      // console.warn("[results fail]", u, e?.response?.status, e?.response?.data);
    }
  }
  return null;
}

export default function SurveyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // step: 'choose' | 'reason' | 'done' | 'result'
  const [step, setStep] = useState(location.state?.mode === "result" ? "result" : "choose");
  const [choice, setChoice] = useState(null); // 'good' | 'bad'
  const [reason, setReason] = useState("");

  const [detail, setDetail] = useState(null);
  const [results, setResults] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // 상세 불러오기 (+ 결과 선조회: result 모드로 들어온 경우)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const detailUrls = [
          `${API_BASE}/surveys/${id}/`,
          `${API_BASE}/surveys/${id}`,
        ];
        let d = null;
        for (const u of detailUrls) {
          try {
            const res = await axios.get(u, { withCredentials: true });
            d = res.data; break;
          } catch (_) {}
        }
        if (!d) throw new Error("detail fail");
        if (!alive) return;
        setDetail(d);

        if (location.state?.mode === "result") {
          const r = await fetchResultsOnce(id);
          if (alive) setResults(r ?? { yes: 0, no: 0 });
        }
      } catch (e) {
        if (alive) setErr("설문 상세를 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, location.state?.mode]);

  const handleBack = () => {
    if (step === "reason") { setStep("choose"); return; }
    navigate(-1);
  };

  const pick = (w) => { setChoice(w); setStep("reason"); };

  // 투표 전송 + 결과로 이동 (낙관적 업데이트 포함)
  const onSend = async () => {
    const ok = await tryPostVote(id, choice, reason?.trim() || undefined);
    if (!ok) {
      alert("투표 전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    // 서버 결과 재조회
    const fresh = await fetchResultsOnce(id);

    if (fresh && !fresh.isRatioOnly) {
      setResults(fresh);
    } else {
      // 서버가 바로 집계 안 주거나 비율만 주는 경우 낙관적 보정
      setResults((prev) => ({
        yes: (prev?.yes ?? 0) + (choice === "good" ? 1 : 0),
        no: (prev?.no ?? 0) + (choice === "bad" ? 1 : 0),
      }));
    }

    setStep("result");
  };

  // 완료 화면(현재는 바로 결과로 보내지만 남겨둠)
  if (step === "done") {
    return (
      <Wrap>
        <DoneWrap>
          <DoneIcon><img src={surveyDone} alt="투표 아이콘" /></DoneIcon>
          <DoneText>
            설문 참여가 완료되었습니다. <br />
            오늘의 참여가 내일의 더 나은 동네를 만듭니다.
          </DoneText>
          <PrevBtn
            onClick={async () => {
              const r = await fetchResultsOnce(id);
              setResults(r ?? { yes: 0, no: 0 });
              setStep("result");
            }}
          >
            결과 보기
          </PrevBtn>
        </DoneWrap>
      </Wrap>
    );
  }

  // 결과 화면
  if (step === "result") {
    const yes = results?.yes ?? 0;
    const no = results?.no ?? 0;
    const total = yes + no;
    const yesPct = total > 0 ? Math.round((yes / total) * 100) : 0;
    const noPct = total > 0 ? 100 - yesPct : 0;

    return (
      <Wrap>
        <TopBar>
          <TopBackBtn onClick={() => navigate(-1)} aria-label="뒤로가기">
            <FiChevronLeft />
          </TopBackBtn>
          <TopTitle>설문하기</TopTitle>
          <div style={{ width: 32 }} />
        </TopBar>

        <MetaRow>
          <MetaAvatar />
          <MetaInfo>
            {/* ✅ 담당부서 → agency_name */}
            <MetaName>{detail?.agency_name || "기관"}</MetaName>
          </MetaInfo>
        </MetaRow>

        <Divider />

        <TitleBlock>
          <TitleMain>{detail?.title || "제목"}</TitleMain>
          <TitleSub>{detail?.description || detail?.content || ""}</TitleSub>
        </TitleBlock>

        <ResultCard>
          <ResultHeader>투표현황</ResultHeader>

          {/* ✅ total이 0이면 퍼센트 막대를 그리지 않음 */}
          {total > 0 ? (
            <ResultBar aria-label={`찬성 ${yesPct}%, 반대 ${noPct}%`} style={{ minWidth: 0 }}>
              {yesPct > 0 && (
                <YesSeg style={{ flexBasis: `${yesPct}%` }}>찬성({yesPct}%)</YesSeg>
              )}
              {noPct > 0 && (
                <NoSeg style={{ flexBasis: `${noPct}%` }}>반대({noPct}%)</NoSeg>
              )}
            </ResultBar>
          ) : (
            <ResultBar style={{ minWidth: 0 }} aria-label="집계 없음" />
          )}

          {total === 0 && (
            <div style={{ marginTop: 8, color: "#777", fontSize: 14 }}>
              아직 집계된 투표가 없습니다.
            </div>
          )}
        </ResultCard>
      </Wrap>
    );
  }

  // 선택/이유 입력 화면
  return (
    <Wrap>
      <TopBar>
        <TopBackBtn onClick={handleBack} aria-label="뒤로가기">
          <FiChevronLeft />
        </TopBackBtn>
        <TopTitle>설문하기</TopTitle>
        <div style={{ width: 32 }} />
      </TopBar>

      {loading && <div style={{ padding: 24, color: "#777" }}>불러오는 중…</div>}
      {err && <div style={{ padding: 24, color: "#c00" }}>{err}</div>}

      {!loading && !err && (
        <>
          <MetaRow>
            <MetaAvatar />
            <MetaInfo>
              {/* ✅ 담당부서 대신 agency_name 표시 */}
              <MetaName>{detail?.agency_name || "기관"}</MetaName>
            </MetaInfo>
          </MetaRow>

          <Divider />

          <TitleBlock>
            <TitleMain>{detail?.title || "제목"}</TitleMain>
            <TitleSub>{detail?.description || detail?.content || ""}</TitleSub>
          </TitleBlock>

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
        </>
      )}
    </Wrap>
  );
}
