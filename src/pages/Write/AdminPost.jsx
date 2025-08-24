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

/* ---------------- axios 공통 설정 ---------------- */
const getCookie = (name) => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // 쿠키(세션/CSRFTOKEN) 전송
  headers: { "Content-Type": "application/json" },
});

// CSRF/JWT 자동 첨부
api.interceptors.request.use((cfg) => {
  const csrf = getCookie("csrftoken") || getCookie("CSRF-TOKEN") || getCookie("XSRF-TOKEN");
  if (csrf) {
    cfg.headers["X-CSRFToken"] = csrf;
    cfg.headers["X-CSRF-Token"] = csrf;
  }
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (token && !cfg.headers.Authorization) {
    cfg.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }
  return cfg;
});

// / 와 /없음 모두 시도
const postFallback = async (path, body) => {
  const p = path.startsWith("/") ? path : `/${path}`;
  try {
    return await api.post(p, body);
  } catch (err) {
    const st = err?.response?.status;
    if (st === 404 || st === 405) {
      const alt = p.endsWith("/") ? p.slice(0, -1) : `${p}/`;
      return await api.post(alt, body);
    }
    throw err;
  }
};
/* ------------------------------------------------ */

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

  const isCodeFormatOk = useMemo(
    () => /^[A-Za-z0-9]+$/.test(orgCode || ""),
    [orgCode]
  );

  // iOS: showPicker 미지원시 포커스/클릭
  const openNativePicker = (ref) => {
    const el = ref.current || document.getElementById(ref);
    if (!el) return;
    try {
      if (typeof el.showPicker === "function") el.showPicker();
      else { el.focus(); el.click(); }
    } catch {
      el.focus(); el.click();
    }
  };

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
      try {
        // 백엔드가 / 또는 /없음 한쪽만 받을 수 있으니 폴백 사용
        const { data } = await postFallback("/surveys/verify-code", { code: orgCode });
        if (data?.valid) {
          setVerifyState("ok");
          setOrgName(data?.agency_name ?? "");
        } else {
          setVerifyState("fail");
          setOrgName("");
        }
      } catch (err) {
        console.warn("verify-code failed", err?.response?.status, err?.response?.data);
        setVerifyState("fail");
        setOrgName("");
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
      content,
      start_at: startAt.length === 16 ? `${startAt}:00` : startAt,
      end_at: endAt.length === 16 ? `${endAt}:00` : endAt,
      org_code: orgCode,
    };

    try {
      await postFallback("/admin/posts", payload);
      alert("등록되었습니다.");
      setTitle("");
      setContent("");
      setStartAt("");
      setEndAt("");
    } catch (err) {
      const status = err?.response?.status;
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        JSON.stringify(err?.response?.data || {});
      console.error("Create failed:", status, detail);

      if (status === 403) {
        alert(
          "등록이 거절되었습니다(403).\n" +
          "- 로그인/권한/CSRF/CORS 이슈일 수 있어요.\n" +
          "- 같은 도메인에서 호출하거나, 서버에서 CORS(Origin, Credentials)와 쿠키 SameSite=None; Secure 설정을 확인해주세요."
        );
      } else if (status === 400) {
        alert(`요청 형식 오류(400): ${detail}`);
      } else if (status === 401) {
        alert("인증 필요(401): 로그인 토큰이 없거나 만료되었습니다.");
      } else {
        alert(`등록 실패 [${status ?? "네트워크"}]: ${detail}`);
      }
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
        {/* Issues 경고 해결: 명시적 type/title/aria-label */}
        <TopBackBtn type="button" title="뒤로가기" aria-label="뒤로가기" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </TopBackBtn>
        <TopTitle>관리자 설문 작성</TopTitle>
        <div style={{ width: 32 }} />
      </TopBar>

      {/* 인증코드 */}
      <Field>
        <Label htmlFor="orgCode">인증코드</Label>
        <CodeBox $state={verifyState}>
          <input
            id="orgCode"
            name="org_code"
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
        <Label htmlFor="title">설문 제목</Label>
        <Input
          id="title"
          name="title"
          placeholder="진행하는 설문 조사의 제목을 입력해주세요."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>

      {/* 본문 */}
      <Field>
        <LabelRow>
          <Label htmlFor="content">글을 작성해주세요.</Label>
          <WarnText>작성 이후 수정은 불가합니다.</WarnText>
        </LabelRow>
        <Textarea
          id="content"
          name="content"
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

        {/* 접근성/타입 경고 해결: span 대신 명시적 버튼 + type="button" */}
        <BtnRow style={{ gap: 10 }}>
          <label htmlFor="startAtPicker" style={{ cursor: "pointer" }}>
            <GhostBlue as="button" type="button" title="시작날짜 선택" onClick={() => openNativePicker("startAtPicker")}>
              <FiCalendar />
              <span>시작날짜</span>
            </GhostBlue>
          </label>

          <label htmlFor="endAtPicker" style={{ cursor: "pointer" }}>
            <GhostRed as="button" type="button" title="종료날짜 선택" onClick={() => openNativePicker("endAtPicker")}>
              <FiCalendar />
              <span>종료날짜</span>
            </GhostRed>
          </label>
        </BtnRow>

        {/* 뷰포트 안(폼 근처)에 두기: 위치/크기 최소화 + 투명 */}
        <HiddenDateTime
          id="startAtPicker"
          name="start_at"
          ref={startRef}
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
        />
        <HiddenDateTime
          id="endAtPicker"
          name="end_at"
          ref={endRef}
          type="datetime-local"
          value={endAt}
          onChange={(e) => setEndAt(e.target.value)}
          style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
        />
      </Field>

      <SubmitBtn type="submit" disabled={!canSubmit}>
        등록
      </SubmitBtn>
      <BottomSpacer />
    </Wrap>
  );
}
