import { Model, DataTypes } from "sequelize";
import { sequelize } from "./connect";

export class User extends Model {}
User.init(
  {
    email: DataTypes.STRING,
    name: DataTypes.STRING,
  },
  { sequelize, modelName: "user" }
);
