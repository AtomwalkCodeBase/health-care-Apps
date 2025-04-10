import React from 'react';
import { Modal, View, Image, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  width: 80%;
  padding: 20px;
  background-color: #fff;
  border-radius: 16px;
  align-items: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

const IconContainer = styled.View`
  margin-bottom: 20px;
`;

const TitleText = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

const MessageText = styled.Text`
  font-size: 16px;
  color: #666;
  text-align: center;
  margin-bottom: 20px;
`;

const CloseButton = styled.TouchableOpacity`
  padding: 10px 30px;
  background-color: #007aff;
  border-radius: 25px;
`;

const CloseButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

const ErrorModal = ({ visible, message, onClose }) => (
  <Modal transparent visible={visible} animationType="fade">
    <ModalContainer>
      <ModalContent>
        <IconContainer>
          {/* <Image
            source={require('../../assets/images/EmptyState.png')} // replace with your error icon
            style={{ width: 80, height: 80 }}
          /> */}
        </IconContainer>
        <TitleText>Oops!</TitleText>
        <MessageText>{message || "Something went wrong, please try again"}</MessageText>
        <CloseButton onPress={onClose}>
          <CloseButtonText>Close</CloseButtonText>
        </CloseButton>
      </ModalContent>
    </ModalContainer>
  </Modal>
);

export default ErrorModal;
