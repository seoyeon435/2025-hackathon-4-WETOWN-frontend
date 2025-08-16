import { useEffect } from "react";

const useKakaoMap = (containerId, lat = 37.5585, lng = 127.0002) => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY
            }&autoload=false`;
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            console.log("카카오 SDK 로드됨 ✅");
            window.kakao.maps.load(() => {
                console.log("카카오맵 초기화 시작 ✅");
                const container = document.getElementById(containerId);
                if (!container) return;

                const options = {
                    center: new window.kakao.maps.LatLng(lat, lng),
                    level: 3,
                };
                const map = new window.kakao.maps.Map(container, options);

                const marker = new window.kakao.maps.Marker({
                    position: new window.kakao.maps.LatLng(lat, lng),
                });
                marker.setMap(map);
            });
        };
    }, [containerId, lat, lng]);
};

export default useKakaoMap;
