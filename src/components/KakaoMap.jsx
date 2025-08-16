import useKakaoMap from "../hooks/Map/useKakaoMap";

const KakaoMap = () => {
    useKakaoMap("map"); // hooks 실행

    return <div id="map" style={{ width: "100%", height: "90vh" }}></div>;
};

export default KakaoMap; 