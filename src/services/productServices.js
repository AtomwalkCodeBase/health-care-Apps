import AsyncStorage from "@react-native-async-storage/async-storage";
import { addEmpLeave, getEmpLeavedata, addClaim, getEmpClaimdata, getExpenseItemList, getProjectList, getEmpAttendanceData, getEmpHolidayData, empCheckData, processClaim, getClaimApproverList, getemployeeList, getequipmentList, userLoginURL, getbookedList, doctorbooking, setuserpin } from "../services/ConstantServies";
import { authAxios, authAxiosFilePost, authAxiosPost } from "./HttpMethod";

export function getEmpLeave(leave_type, emp_id, year) {
  let data = {};
  if (leave_type) {
    data['leave_type '] = leave_type;
  }
  if (emp_id) {
    data['emp_id'] = emp_id;
  }
  if (year) {
    data['year'] = year;
  }

  // console.log('getUserTasks', task_type, userTaskListURL, data)
  return authAxios(getEmpLeavedata, data)
}

export function postEmpLeave(leave_type) {
  let data = {};
  if (leave_type) {
    data['leave_data'] = leave_type;
  }
  // console.log('Data to be sent:', data);
  return authAxiosPost(addEmpLeave, data)

}

export function postClaim(claim_data) {
  let data = {};
  if (claim_data) {
    data = claim_data;
  }
  // console.log('Data to be sent:', claim_data);
  return authAxiosFilePost(addClaim, claim_data)
}

export function postClaimAction(claim_type) {
  let data = {};
  if (claim_type) {
    data['claim_data'] = claim_type;
  }
  // console.log('Data to be sent:', data);
  return authAxiosPost(processClaim, data)

}

export function getemployelistview() {
  let data = {};
  return authAxios(getemployeeList)
}
export function getequipmentlistview() {
  let data = {};
  return authAxios(getequipmentList)
}
export function getbookedlistview() {
  let data = {};
  return authAxios(getbookedList)
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
    const customerId = await AsyncStorage.getItem("Customer_id");
    let customerIdNumber = parseInt(customerId, 10);

    // Use the passed customer_id if provided, otherwise use the one from AsyncStorage
    const effectiveCustomerId = customer_id || customerIdNumber;

    // Function to convert time to 24-hour format with AM/PM suffix
    const to24HourFormat = (time) => {
      // Remove any existing "am/pm" and trim whitespace
      let cleanTime = time.replace(/(am|pm)/i, "").trim();
      
      // Split into hours and minutes
      const [hoursStr, minutes] = cleanTime.split(":").map((part) => part.trim());
      let hours = parseInt(hoursStr, 10);

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
        // If no AM/PM is provided, assume 24-hour format and determine period
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

    console.log("Start Time:", formattedStartTime);
    console.log("End Time:", formattedEndTime);

    let data = {
      booking_data: {
        customer_id: effectiveCustomerId,
        equipment_id: equipment_id,
        booking_date: booking_date, // e.g., "08-04-2025"
        start_time: formattedStartTime, // e.g., "10:30 am"
        end_time: formattedEndTime, // e.g., "14:45 pm"
        duration: duration, // e.g., 1.0
        call_mode: call_mode, // e.g., "ADD_BOOKING", "UPDATE", "CANCEL"
        status: call_mode, // Set status to match call_mode
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
      data.booking_data.booking_id = booking_id;
    }

    return await authAxiosPost(doctorbooking, data);
  } catch (error) {
    console.error(`Error in doctorBookingView (${call_mode}):`, error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
export function getEmpClaim(res) {
  let data = {
    'call_mode': res
  };

  // console.log(res)
  return authAxios(getEmpClaimdata, data)
}

export function getExpenseItem() {
  return authAxios(getExpenseItemList)
}

export function getExpenseProjectList() {
  return authAxios(getProjectList)
}

export function getEmpAttendance(res) {
  let data = {
    'emp_id': res.emp_id,
    'month': res.month,
    'year': res.year
  };
  // console.log('Final response data',data)
  return authAxios(getEmpAttendanceData, data)
}

export function getEmpHoliday(res) {
  let data = {
    'year': res.year
  };
  // console.log(data,'Final response data')
  return authAxios(getEmpHolidayData, data)
}

export function customerLogin(username, password) {
  let data = {
    'mobile_number': username,
    'pin': password
  };
  return authAxiosPost(userLoginURL, data)
}
export async function setuserpinview(o_pin, n_pin) {
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
    if (response) {  // You might want to check response.status === 200 or similar depending on your API
      await AsyncStorage.setItem("Password", n_pin);
      await AsyncStorage.setItem("userPin", n_pin);
    }
    const response = await authAxiosPost(setuserpin, data);
    // console.log("API Response:", response);
    return response;
  } catch (error) {
    console.error("Error in setuserpinView:", error.response ? error.response.data : error.message);
    throw error;
  }
}