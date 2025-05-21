import AsyncStorage from '@react-native-async-storage/async-storage';

export const persistData = async (token) => {
    // console.log('persistData', token, typeof(token))
    await AsyncStorage.setItem('userToken', token);
  };

export const getData = async () => {
    let token = await AsyncStorage.getItem('userToken');
    // console.log('getData', token, typeof(token))
    return token;
};

export const checkToken = async () => {
  let token = await AsyncStorage.getItem('userToken');
  // console.log('Check', token, typeof(token))
  if (token){
      // console.log('Check True')
      return true;
  };
  return false
};

export const getCustomerId = async () => {
  const customer_id = await AsyncStorage.getItem("Customer_id");
  console.log('customer id', customer_id);
  return customer_id;
};