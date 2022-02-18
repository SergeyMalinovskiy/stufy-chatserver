import { Model, DataTypes } from "sequelize";
import { sequelize } from "../instances/sequelize";

enum ConnectionEvent {
    Connected = 'connection_type:connected',
    Disconnected = 'connection_type:disconnected',
}

export interface ConnectionLogAddModel {
    id?: number,
    who: string,
    roomId: string,
    when: Date,
    eventType: ConnectionEvent
}

export interface ConnectionLogModel extends Model<ConnectionLogModel, ConnectionLogAddModel> {
    id: number,
    who: string,
    when: Date,
    eventType: ConnectionEvent
    roomId: string,
    createdAt: Date
}

export const ConnectionLog = sequelize.define<ConnectionLogModel, ConnectionLogAddModel>('connection_log', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    who: DataTypes.STRING,
    when: DataTypes.DATE,
    eventType: DataTypes.STRING,
    roomId: DataTypes.STRING
})