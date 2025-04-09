import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import { View, TextInput, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import Logos from "../../assets/images/Atom_walk_logo.jpg";
import { useRouter } from "expo-router";
import { loginURL, userLoginURL } from "../../src/services/ConstantServies";
import axios from "axios"; // If you prefer axios for API calls
import { getCompanyInfo } from "../../src/services/authServices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAxiosPost, publicAxiosRequest } from "../../src/services/HttpMethod";
import { customerLogin } from "../../src/services/productServices";
const LoginScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userPin, setUserPin] = useState(null);

  useEffect(() => {
    const fetchUserPin = async () => {
      const storedPin = await AsyncStorage.getItem("userPin");
      setUserPin(storedPin); // storedPin will be `null` if no value is found
    };
    fetchUserPin();
  }, []);
  const validateInput = () => {
    if (!username) {
      setErrorMessage("User Mobile number is required");
      return false;
    }
    if (!password) {
      setErrorMessage("PIn is required");
      return false;
    }
    if (password.length < 4) {
      setErrorMessage("Password must be at least 4 characters long");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handlePressPassword = () => {
    router.push({
      pathname: "PinScreen",
    });
  };

  const handlePress = async () => {
    let tokens=`bf4401f70476590e194d2ed625f227f9532392c2`;
    await AsyncStorage.setItem("userToken", tokens);
    if (!validateInput()) {
      return;
    }
    let finalUsername = username;

    // // Check if username contains "@" (assuming it's an email)
    // if (!username.includes("@")) {
    //   try {
    //     // First API call to get the username if it's not an email
    //     const userDetailResponse = await axios.get(
    //       `https://www.atomwalk.com/api/get_user_detail/?user_id=${username}`
    //     );
    //     if (userDetailResponse.status === 200) {
    //       finalUsername = userDetailResponse.data.username;
    //     } else {
    //       setErrorMessage("User not found");
    //       return;
    //     }
    //   } catch (error) {
    //     console.error("Error fetching username:", error);
    //     setErrorMessage("Failed to retrieve user details");
    //     return;
    //   }
    // }

    // Proceed with the login using the final username
    try {
      const response = await customerLogin(finalUsername,password);

      if (response.status === 200) {
        AsyncStorage.setItem("Password", password);
        AsyncStorage.setItem("username", finalUsername);
  
        // getCompanyInfo()
        //   .then((res) => {
        //     let comanyInfo = res.data;
        //     AsyncStorage.setItem("companyInfo", JSON.stringify(comanyInfo));
        //     let db_name = comanyInfo.db_name.substr(3);
        //     AsyncStorage.setItem("dbName", db_name);
        //     console.log(res.data.db_name, db_name, "alldata--->");
        //   })
        //   .catch((error) => {
        //     console.log("ERROR", { error }, error.message);
        //   });

        const userToken = response.data?.token;
        const Customer_id = response.data?.customer_id;
         // Assuming the token is in the response data
        // Store the token in AsyncStorage
        await AsyncStorage.setItem("Customer_id", Customer_id.toString());
        await AsyncStorage.setItem("userToken", userToken);
        // Navigate to the home screen
        router.push("/home");
      } else {
        setErrorMessage("Invalid User id or Password");
      }
    } catch (error) {
      console.error("API call error:", error);
      setErrorMessage("Invalid User id or Password");
    }
  };

  return (
    <Container>
      {/* Logo Section */}
      <LogoContainer>
        <Logo source={Logos} resizeMode="contain" />
      </LogoContainer>

      {/* Login Text */}
      <Title>Log In</Title>
      <Subtitle> Enter your details to Login</Subtitle>
      {/* Input Fields Section */}
      <InputContainer>
        <InputWrapper>
          <MaterialIcons name="person-outline" size={20} color="#6c757d" />
          <Input
            placeholder="Enter Mobile Number"
            keyboardType="numeric"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#6c757d"
          />
        </InputWrapper>

        <InputWrapper>
          <MaterialIcons name="lock-outline" size={20} color="#6c757d" />
          <Input
            placeholder="PIN"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            placeholderTextColor="#6c757d"
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <MaterialIcons
              name={isPasswordVisible ? "visibility" : "visibility-off"}
              size={20}
              color="#6c757d"
            />
          </TouchableOpacity>
        </InputWrapper>
        {/* Error Message */}
        {errorMessage ? (
          <Subtitles style={{ color: "red" }}>{errorMessage}</Subtitles>
        ) : null}
      </InputContainer>
      {/* Sign In Button */}
      <Button onPress={() => handlePress()}>
        <ButtonText>Sign In</ButtonText>
      </Button>

      {/* Forgot Password Text */}
      {userPin && (
        <ForgotPasswordText
          onPress={() => {
            handlePressPassword();
          }}
        >
          Login With Your Pin
        </ForgotPasswordText>
      )}

      {/* Bottom Navigation */}
      <BottomNav>
        <FontAwesome name="sign-in" size={24} color="#e74c3c" />
        <NavText>Login</NavText>
      </BottomNav>
    </Container>
  );
};

// Styled Components
const Container = styled.View`
  flex: 1;
  background-color: #fff;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
`;

const LogoContainer = styled.View`
  margin-bottom: 30px;
`;

const Logo = styled.Image`
  width: 200px;
  height: 100px;
`;

const Title = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: #000;
  margin-bottom: 5px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 20px;
`;
const Subtitles = styled.Text`
  align-items: left;
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 20px;
`;

const InputContainer = styled.View`
  width: 100%;
  /* margin-bottom: 20px; */
`;

const InputWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #f1f3f5;
  padding: 10px 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #dfe2e5;
`;

const Input = styled.TextInput`
  flex: 1;
  padding: 0 10px;
  color: #000;
`;

const Button = styled.TouchableOpacity`
  background-color: #0062cc;
  padding: 15px;
  border-radius: 8px;
  align-items: center;
  width: 100%;
  margin-bottom: 15px;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

const ForgotPasswordText = styled.Text`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 20px;
`;

const BottomNav = styled.View`
  flex-direction: row;
  align-items: center;
  position: absolute;
  bottom: 20px;
`;

const NavText = styled.Text`
  font-size: 14px;
  color: #e74c3c;
  margin-left: 5px;
`;

export default LoginScreen;