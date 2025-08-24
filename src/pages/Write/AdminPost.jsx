import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { FiCheckCircle, FiAlertCircle, FiCalendar, FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  AdminWrap as Wrap,
  TopBar, TopBackBtn, TopTitle,
  Field,
  Label,
  LabelRow,
  WarnText,
  CodeBox,
  RightAddon,
  Tag,
  CaptionSuccess,
  CaptionError,
  Input,
  Textarea,
  BtnRow,
  GhostBlue,
  GhostRed,
  HiddenDateTime,
  SubmitBtn,
  BottomSpacer,
} from "./admin.styled";

const API_BASE = (import.meta.env.VITE_BASE_URL || "").replace(/\/+$/, "");

/** POST /surveys/verify-code  (슬래시 없음, 바디 { code }) */
async function verifyCode(apiBase, rawCode) {
  const code = String(rawCode ?? "").trim();
  if (!code) return { ok: false, name: "" };

  try {
    const { data } = await axios.post(`${apiBase}/surveys/verify-code`, { code });
    const ok =
      (typeof data?.valid === "boolean" ? data.valid : undefined) ??
      (typeof data?.is_valid === "boolean" ? data.is_valid : undefined) ??
      (typeof data?.ok === "boolean" ? data.ok : undefined) ??
      false;

    const name =
      data?.name ??
      data?.orgName ??
      data?.org_name ??
      data?.org?.name ??
      "";

    return { ok: Boolean(ok), name };
  } catch (e) {
    return { ok: false, name: "" };
  }
}

export default function AdminPost() {
  const navigate = useNavigate();

  const [orgCode, setOrgCode] = useState("");
  const [orgName, setOrgName] = useState("");
  const [verifyState, setVerifyState] = useState("idle"); // idle | checking | ok | fail | format
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const startRef = useRef(null);
  const endRef = useRef(null);

  // 영문/숫자만 허용 (20041023 OK)
  const isCodeFormatOk = useMemo(() => /^[A-Za-z0-9]+$/.test(orgCode || ""), [orgCode]);

  // 인증코드 자동 검증 (debounce)
  useEffect(() => {
    if (!orgCode) {
      setVerifyState("idle");
      setOrgName("");
      return;
    }
    if (!isCodeFormatOk) {
      setVerifyState("format");
      setOrgName("");
      return;
    }

    setVerifyState("checking");
    const t = setTimeout(async () => {
      const { ok, name } = await verifyCode(API_BASE, orgCode);
      if (ok) {
        setVerifyState("ok");
        setOrgName(name || ""); // 예: 장충동 주민센터
      } else {
        setVerifyState("fail");
        setOrgName("");
      }
    }, 450);

    return () => clearTimeout(t);
  }, [orgCode, isCodeFormatOk]);

  // 제출 가능
  const canSubmit =
    verifyState === "ok" &&
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    startAt &&
    endAt;

  // datetime-local → "YYYY-MM-DDTHH:mm:ss"
  const toIsoSeconds = (v) => (v && v.length === 16 ? `${v}:00` : v || "");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // DRF 스펙에 맞게 보냄
    const payload = {
      code: orgCode,
      title,
      description: content,
      start_at: toIsoSeconds(startAt),
      end_at: toIsoSeconds(endAt),
    };

    try {
      await axios.post(`${API_BASE}/surveys/`, payload);
      alert("등록되었습니다.");
      // 초기화
      setTitle("");
      setContent("");
      setStartAt("");
      setEndAt("");
      // navigate(-1); // 필요 시 이동
    } catch (err) {
      console.error("설문 생성 실패:", err?.response?.data || err);
      alert("등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const formatDT = (v) => {
    if (!v) return "";
    const [d, t] = v.split("T");
    const [y, m, dd] = d.split("-");
    const hhmm = t?.slice(0, 5);
    return `${y}.${m.padStart(2, "0")}.${dd} ${hhmm}`;
  };

  return (
    <Wrap as="form" onSubmit={onSubmit}>
      {/* 상단 바 */}
      <TopBar>
        <TopBackBtn onClick={() => navigate(-1)} aria-label="뒤로가기">
          <FiChevronLeft />
        </TopBackBtn>
        <TopTitle>관리자 설문 작성</TopTitle>
        <div style={{ width: 32 }} />
      </TopBar>

      {/* 인증코드 */}
      <Field>
        <Label>인증코드</Label>
        <CodeBox $state={verifyState}>
          <input
            type="text"
            value={orgCode}
            onChange={(e) => setOrgCode(e.target.value.trim())}
            placeholder="기관의 인증코드를 입력해주세요. (예: 20041023)"
            maxLength={24}
            autoComplete="off"
          />
          <RightAddon>
            {verifyState === "ok" ? (
              <FiCheckCircle size={18} />
            ) : verifyState === "fail" ? (
              <FiAlertCircle size={18} />
            ) : (
              <Tag>인증</Tag>
            )}
          </RightAddon>
        </CodeBox>
        {verifyState === "ok" && orgName && (
          <CaptionSuccess>{orgName}</CaptionSuccess>
        )}
        {verifyState === "format" && (
          <CaptionError>영문과 숫자만 입력해주세요.</CaptionError>
        )}
        {verifyState === "fail" && (
          <CaptionError>존재하지 않는 인증코드입니다.</CaptionError>
        )}
      </Field>

      {/* 설문 제목 */}
      <Field>
        <Label>설문 제목</Label>
        <Input
          placeholder="진행하는 설문 조사의 제목을 입력해주세요."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>

      {/* 본문 */}
      <Field>
        <LabelRow>
          <Label>글을 작성해주세요.</Label>
          <WarnText>작성 이후 수정은 불가합니다.</WarnText>
        </LabelRow>
        <Textarea
          rows={7}
          placeholder="작성 이후 수정은 불가합니다."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </Field>

      {/* 설문 기한 */}
      <Field>
        <Label>설문 기한</Label>
        <Input
          placeholder="진행하는 설문의 마감기한을 입력해주세요"
          readOnly
          value={
            startAt && endAt ? `${formatDT(startAt)} ~ ${formatDT(endAt)}` : ""
          }
        />
        <BtnRow>
          <GhostBlue type="button" onClick={() => startRef.current?.showPicker?.()}>
            <FiCalendar />
            <span>시작날짜</span>
          </GhostBlue>
          <GhostRed type="button" onClick={() => endRef.current?.showPicker?.()}>
            <FiCalendar />
            <span>종료날짜</span>
          </GhostRed>
        </BtnRow>

        {/* 숨겨진 datetime-local 입력 */}
        <HiddenDateTime
          ref={startRef}
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
        />
        <HiddenDateTime
          ref={endRef}
          type="datetime-local"
          value={endAt}
          onChange={(e) => setEndAt(e.target.value)}
        />
      </Field>

      <SubmitBtn type="submit" disabled={!canSubmit}>
        등록
      </SubmitBtn>
      <BottomSpacer />
    </Wrap>
  );
}
