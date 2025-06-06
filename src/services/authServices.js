import { authAxios, authAxiosGET } from "./HttpMethod";
import { profileInfoURL, companyInfoURL, getDbList, } from "./ConstantServies";

export function getCompanyInfo() {
    return authAxios(companyInfoURL)
}

export function getDBListInfo() {
    let data = {
         'mobile_app_type': 'HMS_C'
      };
    return authAxiosGET(getDbList, data)
}