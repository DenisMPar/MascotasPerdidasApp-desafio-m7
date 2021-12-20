import { User } from "../models";

//funcion que devuelve toda la data del user
export async function getUserProfile(userId: number) {
  const user = await User.findOne({
    where: {
      id: userId,
    },
  });

  if (user) {
    return user;
  } else {
    throw "user not found";
  }
}
