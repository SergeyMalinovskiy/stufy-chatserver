import axios from "axios";
import API from "../constants/api";

export interface MessageDTO {
    sender: number,
    isReaded: boolean,
    text: string,
    departureTime: any,
    replyBy: number,
    attachments: {
        url: string   
    }[],
    isSystem: boolean
}

export function createMessage(rawMessage: MessageDTO, roomId: number) {
    const axr = axios.post(
        `${API.HOST}/messages`,
        {
            ...rawMessage,
            departureTime: Date.now(),
            dialogId: roomId
        }
    ).then(r => r.data)
    .catch(err => null)

    return axr;
}