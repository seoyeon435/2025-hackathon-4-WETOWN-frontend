let baseLoadPromise = null;
let servicesLoadPromise = null;

export function loadKakaoMapsWithServices() {
  const appkey = import.meta.env.VITE_KAKAO_MAP_KEY;
  if (!appkey) return Promise.reject(new Error("NO_APPKEY"));

  // 이미 maps+services 준비됨
  if (window.kakao?.maps?.services) return Promise.resolve(window.kakao);

  // maps만 있고 services 없음 → services만 추가 로드
  if (window.kakao?.maps && !window.kakao.maps.services) {
    if (!servicesLoadPromise) {
      servicesLoadPromise = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=services`;
        s.async = true;
        s.onload = () => {
          try {
            window.kakao.maps.load(() => resolve(window.kakao));
          } catch (e) {
            reject(e);
          }
        };
        s.onerror = () => reject(new Error("KAKAO_SDK_LOAD_ERROR"));
        document.head.appendChild(s);
      });
    }
    return servicesLoadPromise;
  }

  // 아무것도 없는 경우 → maps+services 통합 로드
  if (!baseLoadPromise) {
    baseLoadPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=services`;
      s.async = true;
      s.onload = () => {
        try {
          window.kakao.maps.load(() => resolve(window.kakao));
        } catch (e) {
          reject(e);
        }
      };
      s.onerror = () => reject(new Error("KAKAO_SDK_LOAD_ERROR"));
      document.head.appendChild(s);
    });
  }
  return baseLoadPromise;
}

export function waitForElementById(id, timeoutMs = 1500) {
  return new Promise((resolve, reject) => {
    const t0 = performance.now();
    const tick = () => {
      const el = document.getElementById(id);
      if (el) return resolve(el);
      if (performance.now() - t0 > timeoutMs) return reject(new Error("CONTAINER_NOT_FOUND"));
      requestAnimationFrame(tick);
    };
    tick();
  });
}
