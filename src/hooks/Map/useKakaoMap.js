import { useEffect } from "react";

const useKakaoMap = (containerId, posts, lat = 37.5585, lng = 127.0002) => {
    useEffect(() => {
        const initMap = () => {
            const container = document.getElementById(containerId);
            if (!container) return;

            const options = {
                center: new window.kakao.maps.LatLng(lat, lng),
                level: 4,
            };
            const map = new window.kakao.maps.Map(container, options);

            posts.forEach((post) => {
                if (!post.latitude || !post.longitude) return;

                const marker = new window.kakao.maps.Marker({
                    position: new window.kakao.maps.LatLng(post.latitude, post.longitude),
                    map,
                });

                const created = new Date(post.created_at);
                const formattedDate = `${created.getFullYear()}.${String(
                    created.getMonth() + 1
                ).padStart(2, "0")}.${String(created.getDate()).padStart(2, "0")}`;

                const iwContent = `
                    <div style="padding:8px; width:220px; font-size:13px; cursor:pointer; border-radius:6px;">
                        <div style="display:flex; justify-content:space-between; font-weight:bold; margin-bottom:4px;">
                        <span>${post.category}</span>
                        <span style="font-size:12px; color:#666;">${formattedDate}</span>
                        </div>
                        <div style="color:#333; margin-bottom:4px;">
                        "${post.title || post.body || "내용 없음"}"
                        </div>
                    </div>
                `;

                const infowindow = new window.kakao.maps.InfoWindow({
                    content: iwContent,
                });

                window.kakao.maps.event.addListener(marker, "click", () => {
                    infowindow.open(map, marker);

                    // 클릭 시 상세 페이지 이동
                    setTimeout(() => {
                        const iwEl = document.querySelector(".wrap");
                        if (iwEl) {
                            iwEl.onclick = () => {
                                window.location.href = `/detail/${post.id}`;
                            };
                        }
                    }, 0);
                });
            });
        };

        // ✅ SDK 로드
        if (!document.getElementById("kakao-map-sdk")) {
            const script = document.createElement("script");
            script.id = "kakao-map-sdk";
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY
                }&autoload=false`;
            script.async = true;
            document.head.appendChild(script);

            script.onload = () => {
                window.kakao.maps.load(initMap);
            };
        } else {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(initMap);
            }
        }
    }, [containerId, posts, lat, lng]);
};

export default useKakaoMap;
