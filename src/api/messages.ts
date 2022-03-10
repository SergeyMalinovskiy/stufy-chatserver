import axios from "axios";
import API from "../constants/api";

export enum MessageType {
    Proposal= '_OrderProposal',
    Warning = '_WARNING',
    Info    = '_INFO',
    Error   = '_Error'
}

export interface MessageDTO {
    sender: number,
    isReaded: boolean,
    text: string,
    departureTime: any,
    replyBy: number,
    attachments: {
        url: string   
    }[],
    isSystem: boolean,
    type: MessageType
}

export function createMessage(rawMessage: MessageDTO, roomId: string) {
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