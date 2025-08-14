import * as S from "./styled";
import { useNavigate } from "react-router-dom";
import { FaMapMarkedAlt } from "react-icons/fa";

const FloatingMapButton = () => {
    const navigate = useNavigate();

    return (
        <S.FloatingButton onClick={() => navigate("/map")}>
            <FaMapMarkedAlt size={30} color="#fff" />
        </S.FloatingButton>
    );
};

export default FloatingMapButton;
