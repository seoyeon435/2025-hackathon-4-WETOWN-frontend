// src/components/hooks/Map/useKakaoAddressPicker.js
import { useCallback, useEffect, useRef, useState } from "react";
import { loadKakaoMapsWithServices, waitForElementById } from "../../lib/kakaoLoader";

export default function useKakaoAddressPicker({
  containerId,
  initialLat = 37.5665,
  initialLng = 126.9780,
  level = 3,
  active = true, // 탭/스텝 전환 시 비활성화 가능
  debounceMs = 250,
}) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const placesRef = useRef(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]); // {label, address, lat, lng}
  const debounceTimer = useRef(null);

  // SDK + 지도 초기화
  useEffect(() => {
    let cancelled = false;
    if (!active) return;

    (async () => {
      try {
        setError(null);
        const kakao = await loadKakaoMapsWithServices();
        const container = await waitForElementById(containerId);

        if (cancelled) return;
        const center = new kakao.maps.LatLng(initialLat, initialLng);

        if (!mapRef.current) {
          mapRef.current = new kakao.maps.Map(container, { center, level });
          markerRef.current = new kakao.maps.Marker({ position: center, map: mapRef.current });
          geocoderRef.current = new kakao.maps.services.Geocoder();
          placesRef.current = new kakao.maps.services.Places();
        }
        setReady(true);
      } catch (e) {
        console.error("[Kakao AddressPicker] init failed:", e);
        setError(e?.message || "INIT_FAIL");
        setReady(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [containerId, initialLat, initialLng, level, active]);

  // 지도/마커 중심 이동
  const setCenter = useCallback((lat, lng) => {
    const kakao = window.kakao;
    if (!mapRef.current || !markerRef.current || !kakao) return;
    const pos = new kakao.maps.LatLng(lat, lng);
    mapRef.current.setCenter(pos);
    markerRef.current.setPosition(pos);
  }, []);

  // 주소 → 좌표 (정확주소용)
  const geocodeAddress = useCallback((addrText) => {
    const kakao = window.kakao;
    return new Promise((resolve, reject) => {
      if (!addrText?.trim()) return reject(new Error("EMPTY_QUERY"));
      if (!geocoderRef.current) return reject(new Error("NOT_READY"));
      geocoderRef.current.addressSearch(addrText, (results, status) => {
        if (status === kakao.maps.services.Status.OK && results[0]) {
          const r = results[0];
          const lat = parseFloat(r.y);
          const lng = parseFloat(r.x);
          resolve({
            lat,
            lng,
            address:
              r.road_address?.address_name ||
              r.address?.address_name ||
              addrText,
            label: r.road_address?.building_name || r.address?.address_name || addrText,
          });
        } else {
          reject(new Error("NOT_FOUND"));
        }
      });
    });
  }, []);

  // 키워드 검색 (자동완성 느낌)
  const searchPlaces = useCallback((text) => {
    const kakao = window.kakao;
    return new Promise((resolve, reject) => {
      if (!text?.trim()) return resolve([]);
      if (!placesRef.current) return reject(new Error("NOT_READY"));
      const opts = mapRef.current ? { location: mapRef.current.getCenter() } : undefined;
      placesRef.current.keywordSearch(text, (data, status) => {
        if (status === kakao.maps.services.Status.OK && Array.isArray(data)) {
          const list = data.slice(0, 7).map((p) => ({
            label: p.place_name,
            address: p.road_address_name || p.address_name || p.place_name,
            lat: parseFloat(p.y),
            lng: parseFloat(p.x),
          }));
          resolve(list);
        } else {
          resolve([]); // 결과 없음은 빈 배열
        }
      }, opts);
    });
  }, []);

  // 입력값 변경 시 디바운스로 제안 조회
  const onChangeQuery = useCallback((text) => {
    setQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      if (!text?.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const list = await searchPlaces(text);
        setSuggestions(list);
      } catch (e) {
        console.error("[Kakao AddressPicker] places error:", e);
      }
    }, debounceMs);
  }, [searchPlaces, debounceMs]);

  // 제안 목록 중 하나 선택
  const pickSuggestion = useCallback((item) => {
    setSuggestions([]);
    setQuery(item.address || item.label);
    setCenter(item.lat, item.lng);
    return { lat: item.lat, lng: item.lng, address: item.address || item.label };
  }, [setCenter]);

  // 엔터로 정확주소 검색(지오코딩)
  const searchByAddress = useCallback(async () => {
    if (!query?.trim()) return null;
    try {
      const r = await geocodeAddress(query);
      setCenter(r.lat, r.lng);
      setQuery(r.address);
      setSuggestions([]);
      return r; // {lat,lng,address,label}
    } catch {
      // 주소검색 실패 → 키워드로 재시도
      const list = await searchPlaces(query);
      setSuggestions(list);
      return null;
    }
  }, [query, geocodeAddress, searchPlaces, setCenter]);

  return {
    ready,
    error,             // "NO_APPKEY" / "KAKAO_SDK_LOAD_ERROR" / "CONTAINER_NOT_FOUND" 등
    query, setQuery,
    suggestions, onChangeQuery, pickSuggestion,
    searchByAddress,
    setCenter,
  };
}
