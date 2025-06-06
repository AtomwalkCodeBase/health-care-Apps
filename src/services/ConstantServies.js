import AsyncStorage from '@react-native-async-storage/async-storage';

  const getDbName = async () => {
 let dbName = await AsyncStorage.getItem('dbName');
 return dbName;
}
const db_name = getDbName();
// const localhost = "https://www.atomwalk.com"
const localhost = "https://www.atomwalk.com"

const newlocalhost="https://crm.atomwalk.com"

const apiURL = "/api";
// const db_name = "PMA_00001";

 const endpoint = `${localhost}${apiURL}`;
 const  newendpoint=`${newlocalhost}${apiURL}`;

// export const productListURL = `${endpoint}/products/${db_name}/`;
// export const productDetailURL = id => `${endpoint}/products/${db_name}/${id}/`;
// export const addToCartURL = `${endpoint}/add_to_cart/${db_name}/`;
// export const orderSummaryURL = `${endpoint}/order_summary/${db_name}/`;
// export const orderListURL = `${endpoint}/customer_orders/${db_name}/`;
// export const orderItemDeleteURL = `${endpoint}/order_item/remove_item/${db_name}/`;
// export const orderItemUpdateQuantityURL = `${endpoint}/order_item/update_quantity/${db_name}/`;
// export const addCouponURL = `${endpoint}/add-coupon/${db_name}/`;
// export const countryListURL = `${endpoint}/countries/`;
// export const userIDURL = `${endpoint}/user_id/`;
// export const customerIDURL = `${endpoint}/user_customer_id/${db_name}/`;
export const customerIDURL = async () => {
 const db_name = await getDbName();
  return `${endpoint}/user_customer_id/${db_name}/`;
}

// export const addressListURL = addressType =>
  // `${endpoint}/addresses/${db_name}/?address_type=${addressType}`;
// export const addressCreateURL = `${endpoint}/address/create/${db_name}/`;
// export const addressUpdateURL = id => `${endpoint}/address/update/${db_name}/${id}/`;
// export const addressDeleteURL = id => `${endpoint}/address/delete/${db_name}/${id}/`;

// export const userSignUpURL = `${endpoint}/customer_sign_up/${db_name}/`;
// export const userLoginURL = `${endpoint}/customer_user_login/${db_name}/`;
// export const loginURL = `${localhost}/rest-auth/login/`;
// export const resetPasswordURL = `${endpoint}/reset_password/${db_name}/`;
// export const resetPasswordConfirmURL = `${endpoint}/reset_password_confirm/`;
// export const changePasswordURL = `${endpoint}/change_password/`;
// export const checkoutURL = `${endpoint}/order_checkout/${db_name}/`;
// export const userTaskListURL = `${endpoint}/user_task/${db_name}/`;
// export const addLeadURL = `${endpoint}/add_lead/${db_name}/`;
// export const getCustomerListURL = `${endpoint}/customer_list/${db_name}/`;
export const getCustomerListURL = async () => {
 const db_name = await getDbName();
  return `${endpoint}/customer_list/${db_name}/`;
}

// export const getCustomerDetailListURL = `${endpoint}/customer_detail_list/${db_name}/`;
export const getCustomerDetailListURL = async () => {
 const db_name = await getDbName();
  return `${newendpoint}/customer_detail_list/${db_name}/`;
}

export const getemployeeList = async () => {
 const db_name = await getDbName();
  return `${endpoint}/get_employee_list/${db_name}/`;
}

// export const updateTaskURL = `${endpoint}/update_task/${db_name}/`;
export const updateTaskURL = async () => {
 const db_name = await getDbName();
  return `${endpoint}/update_task/${db_name}/`;
}

// export const getequipmentList = `${endpoint}/get_facility_list/${db_name}/`;
export const getequipmentList = async () => {
 const db_name = await getDbName();
  return `${endpoint}/get_facility_list/${db_name}/`;
}


// export const getbookedList = `${endpoint}/get_facility_booking_list/${db_name}/`;
export const getbookedList = async () => {
 const db_name = await getDbName();
  return `${endpoint}/get_facility_booking_list/${db_name}/`;
}

// export const doctorbooking = `${endpoint}/process_booking_data/${db_name}/`;
export const doctorbooking = async () => {
 const db_name = await getDbName();
  return `${endpoint}/process_booking_data/${db_name}/`;
}

// export const setuserpin = `${endpoint}/set_user_pin/${db_name}/`;

// export const userTaskList = `${endpoint}/user_task/${db_name}/`;
export const userTaskList = async () => {
 const db_name = await getDbName();
  return `${endpoint}/user_task/${db_name}/`;
}

// export const getTaskCategoryURL = `${endpoint}/get_task_category/${db_name}/`;
  export const getTaskCategoryURL = async () => {
 const db_name = await getDbName();
  return `${endpoint}/get_task_category/${db_name}/`;
}

  export const userLoginURL = async () => {
 const db_name = await getDbName();
  return `${endpoint}/customer_user_login/${db_name}/`;
}

export const setuserpin =  async () => {
 const db_name = await getDbName();
 return `${endpoint}/set_user_pin/${db_name}/`;
} 

export const profileInfoURL = async () => {
  const db_name = await getDbName();
 return  `${endpoint}/profile_info/${db_name}/`;
}

export const doctypelistURL = async () => {
  const db_name = await getDbName();
 return  `${newendpoint}/get_document_type_list/${db_name}/`;
}

export const customerdoclistURL = async () => {
  const db_name = await getDbName();
 return  `${newendpoint}/get_customer_document_list/${db_name}/`;
}

export const getDbList = `${endpoint}/get_applicable_site/`;