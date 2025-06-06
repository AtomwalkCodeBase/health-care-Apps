import AsyncStorage from "@react-native-async-storage/async-storage";
import { addEmpLeave, getEmpLeavedata, addClaim, getEmpClaimdata, getExpenseItemList, getProjectList, getEmpAttendanceData, getEmpHolidayData, empCheckData, processClaim, getClaimApproverList, getemployeeList, getequipmentList, userLoginURL, getbookedList, doctorbooking, setuserpin, userTaskList, getTaskCategoryURL, updateTaskURL, doctypelistURL, customerdoclistURL, getCustomerDetailListURL } from "../services/ConstantServies";
import { authAxios, authAxiosFilePost, authAxiosPost, authAxiosPosts } from "./HttpMethod";

export async function getemployelistview() {
  const url = await getemployeeList(); 
  // let data = payload;
  return authAxios(url);
}

export async function getequipmentlistview() {
  const url = await getequipmentList(); 
  // let data = payload;
  return authAxios(url);
}

export async function getbookedlistview() {
  const url = await getbookedList(); 
  // let data = payload;
  return authAxios(url);
}

export async function doctorBookingView(
  customer_id,
  equipment_id,
  booking_date,
  start_time,
  end_time,
  duration,
  call_mode = "ADD_BOOKING",
  booking_id = null
) {
  try {
    // Validate input parameters
    if (!customer_id) throw new Error("Customer ID is missing");
    if (!equipment_id) throw new Error("Equipment/Doctor ID is missing");
    if (!booking_date) throw new Error("Booking date is missing");
    if (!start_time) throw new Error("Start time is missing");
    if (!end_time) throw new Error("End time is missing");
    if (!duration) throw new Error("Duration is missing");

    // Function to convert time to 24-hour format with AM/PM suffix
    const to24HourFormat = (time) => {
      if (!time) throw new Error("Time is undefined or null");
      // Remove any existing "am/pm" and trim whitespace
      let cleanTime = time.replace(/(am|pm)/i, "").trim();
      
      // Split into hours and minutes
      const [hoursStr, minutes] = cleanTime.split(":").map((part) => part.trim());
      let hours = parseInt(hoursStr, 10);

      if (isNaN(hours) || isNaN(parseInt(minutes))) {
        throw new Error(`Invalid time format: ${time}`);
      }

      // Determine if the time is AM or PM
      const isPm = /pm/i.test(time);
      const isAm = /am/i.test(time);

      // Convert to 24-hour format
      let period = "am";
      if (isPm && hours !== 12) {
        hours += 12; // Convert PM hours (except 12 PM)
        period = "pm";
      } else if (isAm && hours === 12) {
        hours = 0; // Convert 12 AM to 00
        period = "am";
      } else if (isPm && hours === 12) {
        period = "pm"; // 12 PM stays 12
      } else if (isAm && hours !== 12) {
        period = "am"; // AM hours stay as is
      } else if (!isAm && !isPm) {
        // If no AM/PM, assume 24-hour format
        if (hours < 0 || hours > 23) {
          throw new Error(`Invalid hour in time: ${time}`);
        }
        if (hours >= 12) {
          period = "pm"; // 12:00–23:59 is PM
        } else {
          period = "am"; // 00:00–11:59 is AM
        }
      }

      // Format the time as HH:MM with AM/PM suffix
      return `${hours.toString().padStart(2, "0")}:${minutes.padStart(2, "0")} ${period}`;
    };

    // Convert start_time and end_time to 24-hour format with AM/PM
    const formattedStartTime = to24HourFormat(start_time);
    const formattedEndTime = to24HourFormat(end_time);

    // console.log("Start Time:", formattedStartTime);
    // console.log("End Time:", formattedEndTime);

    let data = {
      booking_data: {
        customer_id: parseInt(customer_id),
        equipment_id: parseInt(equipment_id),
        booking_date: booking_date,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        duration: duration.toString(),
        call_mode: call_mode,
        status: call_mode,
        remarks: call_mode === "ADD_BOOKING" ? "add booking" : 
                 call_mode === "UPDATE" ? "update booking" : 
                 "cancel booking",
      },
    };

    // Include booking_id for UPDATE and CANCEL
    if (call_mode === "UPDATE" || call_mode === "CANCEL") {
      if (!booking_id) {
        throw new Error("Booking ID is required for update or cancel operations");
      }
      data.booking_data.booking_id = booking_id.toString();
    }

    // Get the API URL
    let apiUrl;
    try {
      apiUrl = await doctorbooking();
      if (!apiUrl || typeof apiUrl !== 'string' || apiUrl.includes('undefined')) {
        console.warn("doctorbooking returned invalid URL:", apiUrl);
        // Fallback to default dbName
        apiUrl = FALLBACK_BOOKING_URL;
        // Optionally, attempt to reset dbName
        const storedDbName = await AsyncStorage.getItem('dbName');
        if (!storedDbName) {
          await AsyncStorage.setItem('dbName', FALLBACK_DB_NAME);
          // console.log("Reset dbName to fallback:", FALLBACK_DB_NAME);
        }
      }
    } catch (error) {
      console.warn("Failed to get doctorbooking URL:", error);
      apiUrl = FALLBACK_BOOKING_URL;
      // Reset dbName to fallback
      await AsyncStorage.setItem('dbName', FALLBACK_DB_NAME);
      // console.log("Reset dbName to fallback due to error:", FALLBACK_DB_NAME);
    }

    // console.log("Calling authAxiosPost with URL:", apiUrl);
    // console.log("Request data:", data);

    const response = await authAxiosPost(apiUrl, data);

    // Check for non-JSON response
    if (typeof response === 'string' && response.startsWith('<')) {
      throw new Error("Invalid response format: Server returned HTML instead of JSON");
    }

    return response;
  } catch (error) {
    console.error(`Error in doctorBookingView (${call_mode}):`, error);
    throw error;
  }
}

export async function getTaskCategory(payload) {
  const url = await getTaskCategoryURL(); 
  let data = payload;
  return authAxios(url, data);
}

export async function getusertasklistview(task_type, customer_id) {
  try {
    let data = {};
    if (task_type) {
      data['task_type'] = task_type;
    }
    if (customer_id) {
      data['customer_id'] = customer_id;
    }
      const url = await userTaskList(); 
    return authAxios(url, data);
  } catch (error) {
    console.error("Error in getusertasklistview:", error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function customerLogin(payload) {
  const url = await userLoginURL(); 
  let data = payload;
  return authAxiosPosts(url, data);
}

export async function updateTask(task_data, is_completed='N') {
    // console.log('updateTask', task_data, is_completed, assign_user)
    let data = {};
    data['task_data'] = task_data
    data['is_completed'] = is_completed; 
    // data['assign_user'] = assign_user; 
    // console.log("On call data===",data)
    const url = await updateTaskURL();
    
    return authAxiosPost(url, data);
}

export async function setUserPinView(o_pin, n_pin) {
  const url = await setuserpin();
  try {
    const customerId = await AsyncStorage.getItem("Customer_id");
    let customerIdNumber = parseInt(customerId, 10);

    if (isNaN(customerIdNumber)) {
      throw new Error("Invalid Customer ID: " + customerId);
    }

    const effectiveCustomerId = customerIdNumber;

    let data = {
      u_id: effectiveCustomerId,
      o_pin: o_pin,
      n_pin: n_pin,
      user_type: "CUSTOMER",
    };

    // console.log("Sending request to API with data:", data);
    const response = await authAxiosPost(url, data);
    // console.log("API Response:", response);
    return response;
  } catch (error) {
    console.error("Error in setUserPinView:", error.response ? error.response.data : error.message);
    throw error;
  }
} 

export async function getDocTypeListView(payload) {
  const url = await doctypelistURL(); 
  let data = payload;
  return authAxios(url, data);
}

export async function getCustomerDocListView(customerId) {
let data={}
  if(customerId){
    data['customer_id']=customerId;
  }
  const url = await customerdoclistURL(); 
  return authAxios(url, data);
}

export async function getCustomerDetailList(customerId) {
  let data={}
  if(customerId){
    data['customer_id']=customerId;
  }
  const url = await getCustomerDetailListURL();
  return authAxios(url,data);
}