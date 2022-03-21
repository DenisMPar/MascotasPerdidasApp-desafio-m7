import { Model, DataTypes } from "sequelize";
import { sequelize } from "./connect";

export class Pet extends Model {}
Pet.init(
  {
    name: DataTypes.STRING,
    pictureUrl: DataTypes.STRING(1000),
    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT,
    condition: DataTypes.STRING,
    zone: DataTypes.STRING,
  },
  { sequelize, modelName: "pet" }
);
