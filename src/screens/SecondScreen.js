import React, { useContext, useState, useEffect } from "react";
import { View, Text, FlatList, Dimensions } from "react-native";
import styled from "styled-components/native";
import InfoCard from "../components/InfoCard";
import { AppContext } from "../../context/AppContext";
import { getCompanyInfo } from "../services/authServices";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import ApplyButton from "../components/ApplyButton";

const { width } = Dimensions.get("window");

const Container = styled.View`
  background-color: #f5f5f5;
`;

const GradientBackground = styled(LinearGradient).attrs({
  colors: ["#c2e9fb", "#ffdde1"], // Top to bottom gradient
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
})`
  /* flex: 1; */
  align-items: center;
  /* padding: 20px; */
  height: 100%;
`;

const LogoContainer = styled.View`
  width: ${width * 0.25}px;
  height: ${width * 0.25}px;
  background-color: #ffffff;
  border-radius: ${width * 0.25}px;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  margin-top: 5%;
`;

const Logo = styled.Image.attrs(() => ({
  resizeMode: "contain", // Cover ensures the image fills the container
}))`
  width: 95%;
  height: 95%;
  border-radius: ${width *
  0.35}px; /* Ensures the image respects the circular shape */
`;

// Header styles
const CompanyName = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin: 10px 0;
  color: #333333;
`;

const SubHeader = styled.Text`
  font-size: 16px;
  margin-bottom: 20px;
  color: #555555;
`;

// Activity List
const ActivityContainer = styled.View`
  width: 100%;
  margin-top: 20px;
  padding: 20px;
`;

const ActivityRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #ffffff;
  margin-bottom: 5px;
  border-radius: 10px;
  elevation: 2;
`;

const ActivityText = styled.Text`
  font-size: 14px;
  color: #333333;
`;

const StatusText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #e63946;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: center;
  width: 100%;
  margin-bottom: 10px;
`;

// Main App Component
const HomePage = () => {
  const { userToken } = useContext(AppContext);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCompanyInfo()
      .then((res) => {
        setCompany(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activities = [
    { id: "1", btnName: "Book Appointment", status: "IN PROGRESS" },
    { id: "2", reference: "PROJECT-2023-00004", status: "IN PROGRESS" },
    { id: "3", reference: "PTAX-2020-00005", status: "IN PROGRESS" },
  ];

  return (
    <Container>
      <StatusBar barStyle="light-content" backgroundColor="#a970ff" />
      <GradientBackground>
        {/* Logo */}
        <LogoContainer>
          <Logo
            source={{ uri: company.image || "https://via.placeholder.com/150" }}
          />
        </LogoContainer>
        <CompanyName>{company.name || "ATOMWALK HOSPITAL CRM"}</CompanyName>

        {/* <Header>ATOMWALK TECHNOLOGIES</Header> */}
        <SubHeader>Welcome to Atomwalk Whatsapp CRM</SubHeader>

        {/* Cards Layout */}
        <Row>
          <InfoCard
            number="0"
            label="Booked Appointment"
            gradientColors={["#007bff", "#00c6ff"]}
          />
        </Row>

        <Row>
          <InfoCard
            number="1"
            label="Pending Appointment"
            gradientColors={["#38ef7d", "#11998e"]}
          />
          <InfoCard
            number="0"
            label="Cancel Appointment"
            gradientColors={["#e52d27", "#b31217"]}
          />
        </Row>

        {/* Activity List */}
        <ActivityContainer>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            {" "}
            Activity Reference{" "}
          </Text>
          <FlatList
            data={activities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ApplyButton ></ApplyButton>}
          />
        </ActivityContainer>
      </GradientBackground>
    </Container>
  );
};

export default HomePage;