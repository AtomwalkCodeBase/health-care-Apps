import React from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';

// InfoCard container with shadow and gradient background
const InfoCardContainer = styled(LinearGradient).attrs((props) => ({
  colors: props.colors || ['#ffffff', '#ffffff'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
}))`
  width: 120px;
  height: 120px;
  margin: 8px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  elevation: 4; /* Shadow for Android */
  shadow-color: #000; /* Shadow for iOS */
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
`;

// Text Components
const NumberText = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: #ffffff;
`;

const LabelText = styled.Text`
  font-size: 11px;
  color: #ffffff;
  margin-top: 4px;
  font-weight: 600;
  flex-wrap: wrap;
`;

// InfoCard Component
const InfoCard = ({ number, label, gradientColors }) => (
  <InfoCardContainer colors={gradientColors}>
    <NumberText>{number}</NumberText>
    <LabelText>{label}</LabelText>
  </InfoCardContainer>
);

export default InfoCard;
