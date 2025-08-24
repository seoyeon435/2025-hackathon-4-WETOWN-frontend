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

/* ---------------- axios 공통 설정 ---------------- */
const getCookie = (name) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : "";
};

const api = axios.create({
  baseURL: API_BASE?.replace(/\/+$/, "") || "",
  withCredentials: true, // 쿠키 기반 인증일 때 필수
  headers: { "Content-Type": "application/json" },
});

// 요청마다 CSRF/토큰 붙이기
api.interceptors.request.use((cfg) => {
  // CSRF (Django/DRF 등)
  const csrf = getCookie("csrftoken") || getCookie("CSRF-TOKEN") || getCookie("XSRF-TOKEN");
  if (csrf && !cfg.headers["X-CSRFToken"] && !cfg.headers["X-CSRF-Token"]) {
    cfg.headers["X-CSRFToken"] = csrf;
    cfg.headers["X-CSRF-Token"] = csrf;
  }
  // JWT/기타 토큰 (있을 때만)
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (token && !cfg.headers.Authorization) {
    cfg.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }
  return cfg;
});

// / 와 /없음 둘 다 시도
const postWithSlashFallback = async (path, body) => {
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

  // iOS 사파리 대응: showPicker 미지원/제한 시 포커스/클릭 폴백
  const openNativePicker = (ref) => {
    const el = ref.current;
    if (!el) return;
    try {
      if (typeof el.showPicker === "function") el.showPicker(); // 크롬/안드로이드
      else { el.focus(); el.click(); }                          // iOS 사파리 폴백
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
        const { data } = await api.post("/surveys/verify-code", { code: orgCode });
        if (data?.valid) {
          setVerifyState("ok");
          setOrgName(data?.agency_name ?? "");
        } else {
          setVerifyState("fail");
          setOrgName("");
        }
      } catch (err) {
        // 4xx면 메시지 보여주기(디버깅 도움)
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
      await postWithSlashFallback("/admin/posts", payload);
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
      console.error("Create failed:", status, detail, err);

      if (status === 403) {
        alert(
          "등록이 차단되었어요(403).\n" +
          "- 로그인/권한/CSRF 문제가 있을 수 있어요.\n" +
          "- 프런트와 API가 다른 도메인이면 서버 CORS에서 credentials 허용과 Origin 화이트리스트 설정이 필요해요.\n" +
          "- 쿠키 기반이면 CSRF 토큰 설정을 확인해주세요."
        );
      } else if (status === 400) {
        alert(`요청 형식 오류(400): ${detail}`);
      } else if (status === 401) {
        alert("인증 필요(401): 로그인 토큰이 없거나 만료되었습니다.");
      } else {
        alert(`등록에 실패했습니다. [${status ?? "네트워크"}] ${detail}`);
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

        <BtnRow>
          <label
            htmlFor="startAtPicker"
            style={{ cursor: "pointer" }}
            onClick={() => openNativePicker({ current: document.getElementById("startAtPicker") })}
          >
            <GhostBlue as="span" role="button" tabIndex={0}>
              <FiCalendar />
              <span>시작날짜</span>
            </GhostBlue>
          </label>

          <label
            htmlFor="endAtPicker"
            style={{ cursor: "pointer" }}
            onClick={() => openNativePicker({ current: document.getElementById("endAtPicker") })}
          >
            <GhostRed as="span" role="button" tabIndex={0}>
              <FiCalendar />
              <span>종료날짜</span>
            </GhostRed>
          </label>
        </BtnRow>

        {/* 숨겨진 datetime-local 입력 (뷰포트 안에 두기) */}
        <HiddenDateTime
          id="startAtPicker"
          ref={startRef}
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          style={{ position:"absolute", width:1, height:1, opacity:0 }}
        />
        <HiddenDateTime
          id="endAtPicker"
          ref={endRef}
          type="datetime-local"
          value={endAt}
          onChange={(e) => setEndAt(e.target.value)}
          style={{ position:"absolute", width:1, height:1, opacity:0 }}
        />
      </Field>

      <SubmitBtn type="submit" disabled={!canSubmit}>
        등록
      </SubmitBtn>
      <BottomSpacer />
    </Wrap>
  );
}
