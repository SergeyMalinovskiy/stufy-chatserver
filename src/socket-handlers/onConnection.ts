import { AxiosResponse } from "axios";
import { Server, Socket } from "socket.io";
import { createMessage, MessageDTO, MessageType } from "../api/messages";
import { getAllRooms, getRoomById } from "../api/rooms";
import { checkUser } from "../api/user";
import { GLOBAL_ROOM } from "../constants/room";
import { IncomingOrderDTO } from "../models/order";
import { ChatManager } from "../types/ChatManager.class";
import { Dialog, RoomCreationResult } from "../types/dialog";
import { UserDTO } from "../types/userDto";

const validateUser = (user: UserDTO): boolean => {
    return user.userId && user.dialogId && user.token
}

const chatManager = ChatManager.getInstance();

/**
 * ############################################################################################
 */
const onConnection = async (client: Socket, io: Server) => {
    
    const { handshake: { auth: authData } } = client;

    const auth = authData as { userId: number, token: string }

    const response: AxiosResponse<any, any> = await checkUser(auth.token);

    if(!response || response.status !== 200) {
        
        console.log(`Client ${client.id} aborted by auth failed!`);
        client.emit(
            'disconnect:force', 
            { 
                status: 401, 
                reason: 'Failed auth data!', 
                message: 'You have been disconnected by the decision of the server!' 
            }
        )
        client.disconnect();
    }

    console.log(`Client ${client.id} connected!`);

    chatManager.addClient(client.id, auth.userId);

    client.on('rooms:join', (roomId: string) => {
        console.log('Join attempt!')
        if(!client) return;
        console.log(client)
        if(!roomId) return
        console.log(`Joined to "Room_${roomId}"`)
        chatManager.setClientRoom(client.id, roomId);
        client.join(String(roomId));

        console.log(chatManager.getClientActiveRoom(client.id))
    })

    client.on('rooms:leave', () => {
        const clientCurrentRoom = chatManager.getClientActiveRoom(client.id);
        console.log(`Leaved from "Room_${clientCurrentRoom}"`)
        if(clientCurrentRoom) {
            chatManager.deleteClientRoom(client.id, clientCurrentRoom);
            client.leave(String(clientCurrentRoom));
        }
    })

    client.on('message:send', async (msg: MessageDTO) => {
        
        const clientCurrentRoom = chatManager.getClientActiveRoom(client.id);
        console.log('CLIENT_ROOM', clientCurrentRoom)
        const result = await createMessage(msg, clientCurrentRoom);

        if(result.status !== 201) {
            io.to(String(clientCurrentRoom)).emit('message:send:failed', msg)
            return;
        }

        const responseMessage = result.data as {
            sender_id: number,
            sender_type: string,
            recipient_id: number,
            recipient_type: string,
            chat_id: string,
            text: string,
            message_type: number,
            updated_at: string,
            created_at: string,
            id: number
        }

        const newMessage: MessageDTO & { id: number } = {
            sender: responseMessage.sender_id,
            sender_type: responseMessage.sender_type,
            for: responseMessage.recipient_id,
            recipient_type: responseMessage.recipient_type,
            dialogId: Number(responseMessage.chat_id),
            text: responseMessage.text,
            type: responseMessage.message_type,
            id: responseMessage.id,
            isSystem: false,
            departureTime: responseMessage.created_at,
            attachments: [],
            isReaded: true,
            replyBy: msg.replyBy
        }

        io.to(String(clientCurrentRoom)).emit('message:received', newMessage)

        //console.log(r);
    })

    client.on('message:proposal', async (orderProposals: IncomingOrderDTO) => {
        if(!orderProposals) return;

        const clientCurrentRoom = chatManager.getClientActiveRoom(client.id);
        const roomClients = chatManager.getRoomClients(clientCurrentRoom);

        const matchedCompanion = roomClients.find(el => el.userId !== client.id);

        /**
         * Проверка комнаты на присутствие только лишь 2х пользователей
         */
        if((roomClients.length && roomClients.length > 2) || !matchedCompanion) {
            await client.send('message:notify', { text: 'Не получилось отправить предложение!', type: MessageType.Error });
            return;
        }

        /*
        const msg: MessageDTO = {
            sender: orderProposals.customer,
            isReaded: true,
            text: `
                Вам были предложены условия заказа:
                Сроки: ${orderProposals.targetCompletionDate.toString()}
                Сроки гарантии: ${orderProposals.garantyCompletionDate.toString()}
                Цена: ${orderProposals.price}
            `,
            departureTime: Date.now(),
            replyBy: -1,
            attachments: [],
            isSystem: true,
            type: MessageType.Proposal,
            for: matchedCompanion.externalId,
            dialogId: Number(matchedCompanion.roomId)
        }

        const createdMessage = await createMessage(msg, matchedCompanion.roomId)

        console.log(createdMessage);
        if(createdMessage) io.to(matchedCompanion.userId).emit('message:notify:recieved', createdMessage);*/
    })

    client.on('disconnect', () => {
        chatManager.deleteClient(client.id);
        console.log(`Client ${client.id} disconnected!`);
    })

    
}

export default onConnection;