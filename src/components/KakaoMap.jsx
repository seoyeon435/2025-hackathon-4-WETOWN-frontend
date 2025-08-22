import useKakaoMap from "../hooks/Map/useKakaoMap";

const KakaoMap = ({ posts, lat = 37.5585, lng = 127.0002 }) => {
    useKakaoMap("map", posts, lat, lng);

    return <div id="map" style={{ width: "100%", height: "90vh" }} />;
};

export default KakaoMap;
