import { User } from "./users";
import { Pet } from "./pets";
import { Report } from "./report";

User.hasMany(Pet);
Pet.belongsTo(User);
Pet.hasMany(Report);
Report.belongsTo(Pet);

export { User, Pet, Report };
