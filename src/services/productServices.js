import AsyncStorage from "@react-native-async-storage/async-storage";
import { addEmpLeave, getEmpLeavedata, addClaim, getEmpClaimdata, getExpenseItemList, getProjectList, getEmpAttendanceData, getEmpHolidayData, empCheckData, processClaim, getClaimApproverList, getemployeeList, getequipmentList, userLoginURL, getbookedList, doctorbooking } from "../services/ConstantServies";
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
export async function doctorBookingView(customer_id, equipment_id, booking_date, start_time, end_time, duration) {
  try {
    const customerId = await AsyncStorage.getItem("Customer_id");
    let customerIdNumber = parseInt(customerId, 10);

    // Use the passed customer_id if provided, otherwise use the one from AsyncStorage
    const effectiveCustomerId = customer_id || customerIdNumber;

    let data = {
      "booking_data": {
        "customer_id": effectiveCustomerId,
        "equipment_id": equipment_id,
        "booking_date": booking_date, // e.g., "08-04-2025"
        "start_time": start_time,     // e.g., "10:30 am"
        "end_time": end_time,         // e.g., "11:30 am"
        "duration": duration,         // e.g., 1.0
        "call_mode": "ADD_BOOKING",
        "remarks": "add booking"
      }
    };

    return await authAxiosPost(doctorbooking, data);
  } catch (error) {
    console.error("Error in doctorBookingView:", error);
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