// src/models/user.ts

import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../instances/sequelize'

export interface UserAddModel {
    id?: number,
    email: string
    password: string
}

export interface UserModel extends Model<UserModel, UserAddModel> {
    id: number
    email: string
    password: string
    createdAt: string
    updatedAt: string
}

export interface UserViewModel {
    id: number
    email: string
}

export const User = sequelize.define<UserModel, UserAddModel>('user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: DataTypes.STRING,
    password: DataTypes.STRING
})