import axios from "axios";
import API from "../constants/api";

export enum MessageType {
    Default     = 1,
    Error       = 2,
    Warning     = 3,
    Info        = 4,
    Proposal    = 5
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
    for?: number,
    type: MessageType,
    dialogId?: number,
    sender_type: string,
    recipient_type: string,
}

export function createMessage(rawMessage: MessageDTO, roomId: string, isSystem?: boolean, type?: MessageType) {
    const msgPayload = {
        sender_id: rawMessage.sender,
        sender_type: rawMessage.sender_type,
        recipient_id: rawMessage.for,
        recipient_type: rawMessage.recipient_type,
        departure_time: Date.now(),
        chat_id: roomId,
        text: rawMessage.text,
        message_type: type ? type : MessageType.Default,
        is_system: isSystem
    }
    const axr = axios.post(
        `${API.PROD}/messages`,
        {
            ...msgPayload
        }
    ).then(r => r)
    .catch(err => err)

    return axr;
}