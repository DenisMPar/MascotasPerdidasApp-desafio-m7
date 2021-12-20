import { Model, DataTypes } from "sequelize";
import { sequelize } from "./connect";

export class Report extends Model {}
Report.init(
  {
    name: DataTypes.STRING,
    phone: DataTypes.INTEGER,
    message: DataTypes.STRING,
  },
  { sequelize, modelName: "report" }
);
