import styled from "styled-components";

export const StyledModalHeader = styled.div`
    color: #1cc1cc;
    font-family: DIN-Black;
    font-size: 40px;
    letter-spacing: 0;
    line-height: 50px;
`;

export const StyledModalBody = styled.p`
    color: #002326;
    display: inline-block;
    font-family: DIN;
    font-size: 17px;
    line-height: 25.5px;
`;

export const StyledModalBodyBold = styled.span`
    font-family: DINBold;
`;

export const StyledModalBodyBoldBlue = StyledModalBodyBold.extend`
    color: #1cc1cc;
`;

export const StyledModalBodyDetail = StyledModalBody.extend`
    font-size: 12px;
`;
