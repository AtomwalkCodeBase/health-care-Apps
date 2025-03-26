import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import { Button } from "react-native-paper";

const CustomModal = ({isModalVisible ,onpressyes,onpresno,cancelclick,movetocancel}) => {
  return (
    <View style={styles.container}>

      <Modal isVisible={isModalVisible} animationIn="fadeInUp" animationOut="fadeOutDown">
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>Do you want to proceed?</Text>
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={cancelclick?movetocancel:onpressyes} style={styles.primaryButton}>
              Yes
            </Button>
            <Button mode="outlined" onPress={onpresno} style={styles.secondaryButton}>
              No
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  openButton: {
    backgroundColor: "#2A7FBA",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  primaryButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#2A7FBA",
  },
  secondaryButton: {
    flex: 1,
    marginLeft: 10,
    borderColor: "#2A7FBA",
  },
});

export default CustomModal;
