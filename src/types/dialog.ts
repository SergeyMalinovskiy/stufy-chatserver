import { UserDTO } from "./userDto";

export interface Dialog {
    isPrivate: boolean,
    roomId: string,
    members: UserDTO['userId'][]
}

export interface RoomCreationResult {
    roomId: string,
    result: 
        'Room: created' | 
        'Room: already exists' |
        'Room: forced created' |
        'Room: with matched members already exists'
}