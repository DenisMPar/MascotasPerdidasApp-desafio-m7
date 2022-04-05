import { Pet, User, Report } from "../models";
import { index } from "../lib/algolia";
import { cloudinary } from "../lib/cloudinary";
import * as sgMail from "@sendgrid/mail";
type PetData = {
  name: string;
  pictureUrl: string;
  lat: number;
  lng: number;
  condition: string;
  zone: string;
};

//crea una nueva mascota reportada
export async function reportPet(userId: number, params: PetData) {
  if (!userId) {
    throw "user id es necesario";
  }
  if (!params) {
    throw "faltan datos de la mascota ";
  }
  //subo la imagen a clodinary
  const image = await cloudinary.uploader.upload(params.pictureUrl, {
    resource_type: "image",
    discard_original_filename: true,
    width: 1000,
  });
  //checkeo que el user existe para asociar la mascota a su id
  const user = await User.findByPk(userId);
  if (user) {
    const newPet = await Pet.create({
      ...params,
      pictureUrl: image.secure_url,
      userId: user.get("id"),
    });
    //creo un registro en algolia solo con la ubicacion para poder hacer la geobusqueda
    const algoliaRes = await index.saveObject({
      objectID: newPet.get("id"),
      _geoloc: {
        lat: newPet.get("lat"),
        lng: newPet.get("lng"),
      },
    });
    return { newPet };
  } else {
    throw "user not found";
  }
}

//funcion que prepara un objeto para poder modificar una mascota en algolia
function bodyToIndex(body, id?) {
  const respuesta: any = {};
  if (body.lat && body.lng) {
    respuesta._geoloc = {
      lat: body.lat,
      lng: body.lng,
    };
  }
  if (id) {
    respuesta.objectID = id;
  }
  return respuesta;
}

//modifico una mascota existente
export async function modifyPet(params, petId: number) {
  if (!params) {
    throw "faltan datos de la mascota ";
  }
  //si recibo el dato newPicture, se modifico la imagen de la mascota por lo tanto debo subirla a cloudinary

  if (params.newPicture) {
    const image = await cloudinary.uploader.upload(params.pictureUrl, {
      resource_type: "image",
      discard_original_filename: true,
      width: 1000,
    });
    //creo un nuevo objeto con los parametros recibidos y la nueva url de la imagen en cloudinary
    const petData = {
      ...params,
      pictureUrl: image.secure_url,
    };
    //ahora puedo modifcar la mascota tanto en sequelize como en algolia
    const modifyPet = await Pet.update(petData, {
      where: {
        id: petId,
      },
    });
    const indexItem = bodyToIndex(petData, petId);
    index.partialUpdateObject(indexItem);
    return modifyPet;
  } else {
    //si no recibo el dato new picture, puedo modificar la mascota en algiolia y sequelize
    // directamente con los params recibidos
    const modifyPet = await Pet.update(params, {
      where: {
        id: petId,
      },
    });
    const indexItem = bodyToIndex(params, petId);
    index.partialUpdateObject(indexItem);

    return modifyPet;
  }
}

//devuelve la data de una mascota segun su id
export async function getPet(petId: number) {
  const pet = await Pet.findByPk(petId);
  if (pet) {
    return pet;
  } else {
    throw "pet not found";
  }
}

//elimina los datos de una mascota en la db
export async function deletePet(petId: number) {
  const pet = await Pet.destroy({
    where: {
      id: petId,
    },
  });
  const algoliaPet = index.deleteObject(petId.toString());
  if (pet) {
    return pet;
  } else {
    throw "pet not found";
  }
}

//devuelve todas las mascotas perdidas del usuario
export async function getUserPets(userId: number) {
  const pets = await Pet.findAll({
    where: {
      userId,
      condition: "lost",
    },
  });
  if (pets) {
    return pets;
  } else {
    throw "user has no pets";
  }
}

//envio el mail de reporte con sendgrid
export async function sendPetReport(petId, reportData) {
  //obtengo la mascota y el usuario dueño de la misma
  const petRes = await Pet.findByPk(petId);
  const pet = petRes as any;
  const userRes = await User.findByPk(pet.userId);
  const user = userRes as any;

  const key = process.env.SENDGRID_API_KEY;
  sgMail.setApiKey(key);

  //preparo el mensaje que ira en el correo
  const messagetext = `Hola, tu mascota llamada: ${pet.name}, fue vista por ${reportData.name}! \n
  ¿Donde fue visto?: ${reportData.message}\n
  Comunicate con esta persona al numero: ${reportData.phone}
  `;
  //configuro los parametros de sendgrid
  const msg = {
    to: user.email,
    from: "mascotas.app.perdidas@gmail.com",
    subject: "Mascota reportada",
    text: messagetext,
  };
  const emailRes = await sgMail.send(msg).catch((error) => {
    console.error(error);
  });
  if (emailRes) {
    return { message: "email sent" };
  }
}

//funcion que busca mascotas alrededor de una ubicacion
export async function searchPetsAround(location) {
  const lat = location.lat;
  const lng = location.lng;

  const results = await index.search("", {
    attributesToHighlight: [],
    aroundLatLng: `${lat}, ${lng}`,
    aroundRadius: 10000,
  });
  const hits = results.hits;

  let pets = [];
  for (const hit of hits) {
    //utilizo el object id de algolia para buscar los datos de la mascota en sequelize
    const pet = await Pet.findByPk(hit.objectID);
    if (pet) {
      pets.push(pet);
    }
  }
  return pets;
}
