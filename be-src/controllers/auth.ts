import { User } from "../models";
import { Auth } from "../models/auth";
import * as crypto from "crypto";
import * as jtw from "jsonwebtoken";

type NewUser = {
  email: string;
  password: string;
  name: string;
};
type UserData = {
  email: string;
  password: string;
};

const SECRET = process.env.SECRET;
function getHash(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

//chekeo si el usuario existe para pasar a login o signin
export async function checkUser(email: string) {
  const user = await User.findOne({
    where: {
      email: email,
    },
  });
  if (user) {
    return true;
  } else {
    return false;
  }
}
//da de alta al user
export async function createUser(newUser: NewUser) {
  const [user, created] = await User.findOrCreate({
    where: {
      email: newUser.email,
    },
    defaults: {
      ...newUser,
    },
  });
  const [auth, authCreated] = await Auth.findOrCreate({
    where: {
      user_id: user.get("id"),
    },
    defaults: {
      email: newUser.email,
      password: getHash(newUser.password),
      user_id: user.get("id"),
    },
  });
  if (user) {
    return user;
  } else {
    throw "error al crear el user";
  }
}
//modifica un usuario existente
//puedo recibir nombre y contraseña o solo nombre, solo contraseña
export async function updateUser(userId, newData) {
  let updated = { message: "error" };
  //si recibe nombre debe modificar el user
  if (newData.name) {
    const user = await User.update(
      { name: newData.name },
      {
        where: {
          id: userId,
        },
      }
    );
    if (user) {
      updated = { message: "user updated" };
    }
  }
  //si recibe contraseña debe modificar el auth
  if (newData.password) {
    const auth = await Auth.update(
      { password: getHash(newData.password) },
      {
        where: {
          user_id: userId,
        },
      }
    );
    if (auth) {
      updated = { message: "user updated" };
    }
  }
  return updated;
}
//funcion que logea al usuario y devuelve el token
export async function getToken(UserData: UserData) {
  const hashedPassword = getHash(UserData.password);
  const auth = await Auth.findOne({
    where: {
      email: UserData.email,
      password: hashedPassword,
    },
  });

  if (auth) {
    const token = jtw.sign({ id: auth.get("user_id") }, SECRET);
    return token;
  } else {
    throw "invalid name or password";
  }
}
