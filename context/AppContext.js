// src/context/AppContext.js
import React, { createContext, useState, useEffect } from 'react';
import { publicAxiosRequest } from "../src/services/HttpMethod";
import { loginURL } from "../src/services/ConstantServies";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getCompanyInfo} from '../src/services/authServices'
import { Alert } from 'react-native'
import axios from "axios";
import { useRouter } from 'expo-router';
import { customerLogin } from '../src/services/productServices';

// import { useRoute } from '@react-navigation/native';

// Create the context
const AppContext = createContext();

// Create a provider component
const AppProvider = ({ children }) => {
    const [state, setState] = useState("datass");
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [dbName, setDbName] = useState(null);
    const [error, setError] = useState('');
    const [refs,setRefs]=useState(1);
    const router=useRouter();

    const login = async(username, password) => {
      let tokens=`bf4401f70476590e194d2ed625f227f9532392c2`;
    await AsyncStorage.setItem("userToken", tokens);
        setIsLoading(true);
        let finalUsername = username;
        try {
          const response = await customerLogin(finalUsername,password);
          if (response.status === 200) {
            AsyncStorage.setItem("Password", password);
            AsyncStorage.setItem("username", finalUsername);
            const userToken = response.data?.token;
            const Customer_id = response.data?.customer_id;
            await AsyncStorage.setItem("Customer_id", Customer_id.toString());
            await AsyncStorage.setItem("userToken", userToken);
            router.push("/home");
          } else {
            alert("Invalid User id or Password");
          }
        } catch (error) {
          console.error("API call error:", error);
          setErrorMessage("Invalid User id or Password");
        }
    
        
        setIsLoading(false);
    }

    const logout = () => {
        setIsLoading(true);
        AsyncStorage.removeItem('userToken');
        AsyncStorage.removeItem('companyInfo');
        AsyncStorage.removeItem('dbName');
        
        setUserToken(null);
        setCompanyInfo([]);
        setDbName(null);
        setIsLoading(false);
        setError('')
        router.replace('AuthScreen')
    }


  const isLoggedIn = async() => {
    try {
        setIsLoading(true);
        let userToken = await AsyncStorage.getItem('userToken');
        setUserToken(userToken);
            
        let dbName = await AsyncStorage.getItem('dbName');
        setDbName(dbName);
        
        let companyInfo = await AsyncStorage.getItem('companyInfo');
        
        companyInfo = JSON.parse(companyInfo);
        // console.log('isLoggedin',companyInfo);
        if (companyInfo){
            setCompanyInfo(companyInfo);
        }
        setError('');
        setIsLoading(false);
    } catch (e) {
        console.log(`Logged In Error ${e}`);
        setError(`Logged In Error ${e}`)
    }
}

useEffect( () => {
    isLoggedIn();
}, []);

  return (
    <AppContext.Provider value={{ state, login, logout, isLoading, userToken, companyInfo, dbName, error,setRefs,refs }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };