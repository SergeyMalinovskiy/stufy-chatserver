import axios from "axios";
import API from "../constants/api";

export function checkUser(token: string) {
    const axr = axios.get(
        `${API.PROD}/auth/executor/me?token=${token}`,
    ).then(r => r)
    .catch(err => err)

    return axr;
}
