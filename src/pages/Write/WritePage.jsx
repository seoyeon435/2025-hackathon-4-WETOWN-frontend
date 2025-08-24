import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrap, Section, LabelRow, ChipGroup, Chip, SubNote,
  MapBox, AddressInput, NextFab,

  Field, Input, TextArea, DangerNote,
  UploadGrid, UploadSlot, CameraBadge, RegisterBtn,
  SuggestTitle, SuggestChips, SuggestChip,
  DoneWrap, DoneIcon, DoneText,
  TopInline, BackBtn,

  ViewPostBtn
} from "./write.styled";
import { FiArrowRight, FiCamera, FiChevronLeft } from "react-icons/fi";
import reportDone from "../../components/assets/reportDone.svg";

// 훅
import useKakaoAddressPicker from "../../hooks/Map/useKakaoAddressPicker";
// API 인스턴스
import instance from "../../apis/instance";

const CATEGORIES = ["불편/민원", "동네 바람", "정보 공유", "자유 의견"];
const AREAS = ["장충동", "명동", "광희동", "약수동", "을지로동", "필동", "회현동", "청구동", "신당동", "황학동"];

const WritePage = () => {
  const navigate = useNavigate();

  // step: select -> compose -> done
  const [step, setStep] = useState("select");

  // 기본 선택 해제 (빈 값으로 시작)
  const [cat, setCat] = useState("");
  const [area, setArea] = useState("");
  const [addr, setAddr] = useState("");

  // 지도 좌표(초기: 서울 시청 인근)
  const [mapLat, setMapLat] = useState(37.5665);
  const [mapLng, setMapLng] = useState(126.9780);

  // step2
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState([]); // File[]
  const fileRef = useRef(null);

  // 등록 완료 후 응답으로 받은 포스트
  const [createdPost, setCreatedPost] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [activeTagIdx, setActiveTagIdx] = useState(null); // 추천태그 UI 토글

  // Step1 진행 가능 여부
  const canNext = !!cat && !!area;

  // Step2 등록 가능 여부(필수값 3개)
  const canSubmit = Boolean(author.trim() && title.trim() && body.trim());

  const aiChips = useMemo(() => {
    if (!cat) return [];
    return cat === "동네 바람"
      ? ["# 가로등이 너무 어두워요", "# 가로등", "# 여기 가로등 꺼졌어요", "# 놀이터가어둡"]
      : ["# 불편 신고", "# 제설 요청", "# 위험 지역"];
  }, [cat]);

  // 주소 검색 + 지도/핀 훅 (select 단계에서만 활성화)
  const {
    ready, error,
    query, setQuery,
    suggestions, onChangeQuery, pickSuggestion,
    searchByAddress, setCenter,
  } = useKakaoAddressPicker({
    containerId: "kakao-map",
    initialLat: mapLat,
    initialLng: mapLng,
    level: 3,
    active: step === "select",
  });

  // 외부 좌표 상태 변경을 지도에 반영
  useEffect(() => {
    if (ready) setCenter(mapLat, mapLng);
  }, [ready, mapLat, mapLng, setCenter]);

  // 주소 입력 → 엔터로 확정(정확주소)
  const handleEnterAddress = async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const r = await searchByAddress();
    if (r) {
      setMapLat(r.lat);
      setMapLng(r.lng);
      setAddr(r.address);
    }
  };

  // 제안 클릭 시 처리
  const handlePick = (item) => {
    const r = pickSuggestion(item);
    setMapLat(r.lat);
    setMapLng(r.lng);
    setAddr(r.address);
  };

  const onPickFiles = (ev) => {
    const files = Array.from(ev.target.files || []).slice(0, Math.max(0, 10 - images.length));
    if (files.length) setImages((prev) => [...prev, ...files]);
    ev.target.value = "";
  };

  const onRemoveImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const goNext = () => {
    if (!canNext) return;
    setStep("compose");
  };

  // 등록 (백엔드 연동)
  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !canSubmit) return; // 가드

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("content", body);
      form.append("writer", author);
      form.append("category", cat);
      form.append("area", area);
      if (addr) form.append("address", addr);
      form.append("latitude", String(mapLat));
      form.append("longitude", String(mapLng));
      // 단일 이미지(백 규약이 여러 장이면 images[]로 반복 append)
      if (images[0]) form.append("image", images[0]);

      const res = await instance.post("/posts/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 응답 그대로 저장(최소한 id 포함)
      const newPost = res?.data;
      if (!newPost?.id) throw new Error("생성된 게시글 ID가 응답에 없습니다.");
      setCreatedPost(newPost);
      setStep("done");
    } catch (err) {
      console.error("게시글 등록 실패:", err);
      // 필요하면 서버 에러를 폼 아래 텍스트로 매핑 가능
    } finally {
      setSubmitting(false);
    }
  };

  // ===== STEP 3: 등록 완료 =====
  if (step === "done") {
    return (
      <Wrap>
        <DoneWrap>
          <DoneIcon>
            <img src={reportDone} alt="등록 완료" />
          </DoneIcon>
          <DoneText>
            <b>[ {cat || "민원"} ]</b> 민원이 등록되었습니다.
            <br />
            당신의 한 마디가 우리 동네를 움직입니다.
          </DoneText>

          {/* 작성된 글 보기 → DetailPage로 이동 */}
          <ViewPostBtn
            type="button"
            onClick={() => navigate(`/detail/${createdPost.id}`)}
            disabled={!createdPost}
          >
            작성된 글 보기
          </ViewPostBtn>
        </DoneWrap>
      </Wrap>
    );
  }

  // ===== STEP 2: 작성 =====
  if (step === "compose") {
    return (
      <Wrap as="form" onSubmit={onSubmit}>
        <Section>
          {/* 작성 화면 상단 뒤로가기 (1단계로 복귀) */}
          <TopInline>
            <BackBtn type="button" aria-label="뒤로가기" onClick={() => setStep("select")}>
              <FiChevronLeft />
            </BackBtn>
          </TopInline>

          <Field>
            <label>작성자</label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="이름 / 별명 입력"
            />
          </Field>

          <Field>
            <label>제목</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요."
            />
          </Field>

          <Field>
            <label>
              민원을 작성해주세요. <DangerNote as="span">작성 이후 수정은 불가합니다.</DangerNote>
            </label>
            <TextArea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="작성 이후 수정은 불가합니다."
            />
          </Field>

          <Field>
            <label>사진</label>
            <UploadGrid>
              <UploadSlot as="button" type="button" onClick={() => fileRef.current?.click()}>
                <CameraBadge>
                  <FiCamera />
                  <span>{images.length}/10</span>
                </CameraBadge>
              </UploadSlot>

              {images.map((f, i) => {
                const url = URL.createObjectURL(f);
                return (
                  <UploadSlot key={i} title="클릭해서 삭제" onClick={() => onRemoveImage(i)}>
                    <img src={url} alt={`첨부${i + 1}`} />
                  </UploadSlot>
                );
              })}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={onPickFiles}
              />
            </UploadGrid>
          </Field>

          {!!aiChips.length && (
            <>
              <SuggestTitle>AI 추천 태그</SuggestTitle>
              <SuggestChips>
                {aiChips.map((t, idx) => (
                  <SuggestChip
                    key={idx}
                    type="button"                  // submit 방지
                    $active={activeTagIdx === idx} // 색상 토글
                    onClick={() => {
                      setActiveTagIdx((prev) => (prev === idx ? null : idx)); // 다시 누르면 해제
                      // 제목이 비어있을 때만 한 번 채워줌(옵션)
                      setTitle((v) => v || t.replace(/^#\s*/, ""));
                    }}
                  >
                    {t}
                  </SuggestChip>
                ))}
              </SuggestChips>
            </>
          )}

          <RegisterBtn
            type="submit"
            disabled={!canSubmit || submitting}
            $fabLikeDisabled
            title={
              !canSubmit
                ? "작성자/제목/내용을 모두 입력하면 등록할 수 있어요"
                : (submitting ? "등록 중…" : "등록")
            }
            aria-disabled={!canSubmit || submitting}
          >
            {submitting ? "등록 중…" : "등록"}
          </RegisterBtn>
        </Section>
      </Wrap>
    );
  }

  // ===== STEP 1: 유형/장소 선택 =====
  return (
    <Wrap>
      <Section>
        <LabelRow>어떤 종류의 글인가요 ?</LabelRow>
        <ChipGroup>
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              $active={cat === c}
              onClick={() => setCat(prev => (prev === c ? "" : c))} // 다시 누르면 해제
            >
              {c}
            </Chip>
          ))}
        </ChipGroup>

        <LabelRow style={{ marginTop: 22 }}>어디서 발생한 민원인가요 ?</LabelRow>
        <ChipGroup>
          {AREAS.map((a) => (
            <Chip
              key={a}
              $active={area === a}
              onClick={() => setArea(prev => (prev === a ? "" : a))} // 다시 누르면 해제
            >
              {a}
            </Chip>
          ))}
        </ChipGroup>

        <LabelRow style={{ marginTop: 22 }}>정확한 위치를 입력해주세요 (선택 사항)</LabelRow>

        {/* 입력 + 자동완성 드롭다운 */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <AddressInput
              value={query}
              onChange={(e) => onChangeQuery(e.target.value)}
              onKeyDown={handleEnterAddress}
              placeholder="예) 서울 중구 필동로 1길 30 / 남산타워 / 을지로입구역 등"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={async () => {
                const r = await searchByAddress();
                if (r) {
                  setMapLat(r.lat);
                  setMapLng(r.lng);
                  setAddr(r.address);
                }
              }}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "#f6f7f9",
                cursor: "pointer",
                fontWeight: 600,
              }}
              title="주소 검색"
            >
              주소 검색
            </button>
          </div>

          {/* 제안 목록 */}
          {suggestions.length > 0 && (
            <ul
              style={{
                position: "absolute",
                zIndex: 20,
                top: "44px",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              {suggestions.map((s, i) => (
                <li
                  key={`${s.lat}-${s.lng}-${i}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handlePick(s)}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderBottom: i === suggestions.length - 1 ? "none" : "1px solid #f2f3f5",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{s.address}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 지도 영역 */}
        <MapBox aria-label="지도">
          <div
            id="kakao-map"
            style={{
              width: "100%",
              height: 260,
              borderRadius: 12,
              overflow: "hidden",
              background: "#f4f6f8",
              position: "relative",
            }}
          >
            {!ready && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: "#6b7280",
                }}
              >
                {error
                  ? (error === "NO_APPKEY"
                      ? "카카오 JavaScript 키가 설정되지 않았습니다 (.env 확인)"
                      : "지도를 불러오지 못했습니다. (도메인 허용/키 종류/네트워크 확인)")
                  : "지도를 로드중입니다. 잠시만 기다려주세요."}
              </div>
            )}
          </div>
        </MapBox>

        <NextFab
          type="button"
          aria-label="다음"
          disabled={!canNext}
          onClick={goNext}
          title={canNext ? "다음 단계" : "유형과 장소를 선택해주세요"}
        >
          <FiArrowRight />
        </NextFab>

        <SubNote />
      </Section>
    </Wrap>
  );
};

export default WritePage;
