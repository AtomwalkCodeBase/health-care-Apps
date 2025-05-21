import { authAxios, authAxiosGET } from "./HttpMethod";
import { profileInfoURL, companyInfoURL, getDbList, } from "./ConstantServies";

export async function getProfileInfo() {
    // console.log('getProfileInfo')
    const url = await profileInfoURL();
    return authAxios(url)
}

export function getCompanyInfo() {
    return authAxios(companyInfoURL)
}

export function getDBListInfo() {
    let data = {
         'mobile_app_type': 'CRM_C'
      };
    return authAxiosGET(getDbList, data)
}

