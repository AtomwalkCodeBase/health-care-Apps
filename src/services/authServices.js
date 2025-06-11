import { authAxios, authAxiosGET } from "./HttpMethod";
import { profileInfoURL, companyInfoURL, getDbList, } from "./ConstantServies";

export async function getCompanyInfo() {
    const url = await companyInfoURL(); // Await the async function
    return authAxios(url);
  }

export function getDBListInfo() {
    let data = {
         'mobile_app_type': 'HMS_C'
      };
    return authAxiosGET(getDbList, data)
}