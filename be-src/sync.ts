import { User } from "./models";
import { sequelize } from "./models/connect";
sequelize
  .sync({
    alter: true,
  })
  .then((res) => {
    console.log(res);
  });
const user = User.findByPk(1);
