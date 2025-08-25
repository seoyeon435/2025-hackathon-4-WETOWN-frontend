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

const API_BASE = import.meta.env.VITE_BASE_URL;

export default function AdminPost() {
  const navigate = useNavigate();

  const [orgCode, setOrgCode] = useState("");
  const [orgName, setOrgName] = useState("");
  const [agencyId, setAgencyId] = useState(null);
  const [verifyState, setVerifyState] = useState("idle"); // idle | checking | ok | fail | format
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const startRef = useRef(null);
  const endRef = useRef(null);

  const isCodeFormatOk = useMemo(
    () => /^[A-Za-z0-9]+$/.test(orgCode || ""),
    [orgCode]
  );

  // ✅ datetime-local 기본 UI 열기 (iOS 대응)
  const openNativePicker = (refId) => {
    const el = document.getElementById(refId);
    if (!el) return;
    try {
      if (typeof el.showPicker === "function") {
        el.showPicker(); // 크롬, 안드로이드
      } else {
        el.focus();      // iOS 사파리 폴백
        el.click();
      }
    } catch {
      el.focus();
      el.click();
    }
  };

  // 인증코드 자동 검증 (debounce)
  useEffect(() => {
    if (!orgCode) {
      setVerifyState("idle");
      setOrgName("");
      setAgencyId(null);
      return;
    }
    if (!isCodeFormatOk) {
      setVerifyState("format");
      setOrgName("");
      setAgencyId(null);
      return;
    }
    setVerifyState("checking");

    const t = setTimeout(async () => {
      try {
        const { data } = await axios.post(
          `${API_BASE}/surveys/verify-code`,
          { code: orgCode }
        );
        if (data?.valid) {
          setVerifyState("ok");
          setOrgName(data?.agency_name ?? "");
          setAgencyId(data?.agency_id ?? null);
        } else {
          setVerifyState("fail");
          setOrgName("");
          setAgencyId(null);
        }
      } catch {
        setVerifyState("fail");
        setOrgName("");
        setAgencyId(null);
      }
    }, 450);

    return () => clearTimeout(t);
  }, [orgCode, isCodeFormatOk]);

  const canSubmit =
    verifyState === "ok" &&
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    startAt &&
    endAt;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      title,
      description: content,
      start_at: startAt.length === 16 ? `${startAt}:00` : startAt,
      end_at: endAt.length === 16 ? `${endAt}:00` : endAt,
      code: orgCode, // ✅ 서버 요구 필드
    };

    try {
      console.log("payload:", payload);

      await axios.post(`${API_BASE}/surveys/`, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      alert("등록되었습니다.");
      setTitle("");
      setContent("");
      setStartAt("");
      setEndAt("");
      setOrgCode("");
      setOrgName("");
      setAgencyId(null);
    } catch (err) {
      console.error("등록 실패:", err.response?.data || err.message);
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
            placeholder="기관의 인증코드를 입력해주세요."
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
          <CaptionSuccess>{orgName} 인증되었습니다</CaptionSuccess>
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

        <BtnRow style={{ gap: 10 }}>
          <GhostBlue
            as="button"
            type="button"
            title="시작날짜 선택"
            onClick={() => openNativePicker("startAtPicker")}
          >
            <FiCalendar />
            <span>{startAt ? "시작 선택됨" : "시작날짜"}</span>
          </GhostBlue>

          <GhostRed
            as="button"
            type="button"
            title="종료날짜 선택"
            onClick={() => openNativePicker("endAtPicker")}
          >
            <FiCalendar />
            <span>{endAt ? "종료 선택됨" : "종료날짜"}</span>
          </GhostRed>
        </BtnRow>

        <HiddenDateTime
          id="startAtPicker"
          name="start_at"
          ref={startRef}
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
        />
        <HiddenDateTime
          id="endAtPicker"
          name="end_at"
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
