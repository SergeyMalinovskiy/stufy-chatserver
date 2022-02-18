import { Sequelize } from 'sequelize'

const db = 'expressapp'
const username = 'root'
const password = 'root'

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.cwd()+'/.db/local.sqlite'
});

sequelize.authenticate()