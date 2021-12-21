import map from "lodash/map";

const API_BASE_URL = "https://mascotas-perdidas-m7.herokuapp.com";

type Report = {
  petId: number;
  name: string;
  phone: number;
  message: string;
};
const state = {
  data: {
    authtoken: "",
  },
  listeners: [],

  getState() {
    return this.data;
  },
  setState(newState) {
    this.data = newState;
    for (const cb of this.listeners) {
      cb();
    }
    if (newState.authtoken) {
      localStorage.setItem("authtoken", JSON.stringify(newState.authtoken));
    }
    if (newState.logOut) {
      localStorage.removeItem("authtoken");
    }
  },

  subscribe(callback: (any) => any) {
    this.listeners.push(callback);
  },
  //checkeo si user existe
  async checkUserEmail(email) {
    const res = await fetch(API_BASE_URL + "/check", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    const resJson = await res.json();
    return resJson;
  },
  //sign up
  async signUpUser(userData) {
    const currentState = this.getState();

    const res = await fetch(API_BASE_URL + "/auth", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: currentState.userEmail,
        name: userData.name,
        password: userData.password,
      }),
    }).catch((err) => {
      return err;
    });

    const resJson = await res.json();
    return resJson;
  },
  //sign in
  async signInUser(password) {
    const currentState = this.getState();

    const res = await fetch(API_BASE_URL + "/auth/token", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: currentState.userEmail,
        password,
      }),
    }).catch((err) => {
      return err;
    });

    const resJson = await res.json();

    if (resJson.message == "invalid name or password") {
      return false;
    } else {
      currentState.authtoken = resJson;
      state.setState(currentState);
      return true;
    }
  },
  //logout
  logOutUser() {
    const currentState = this.getState();
    currentState.authtoken = "";
    currentState.userEmail = "";
    currentState.logOut = true;
    state.setState(currentState);
  },

  async getUserData() {
    const currentState = state.getState();
    const res = await fetch(API_BASE_URL + "/me", {
      headers: {
        "content-type": "application/json",
        authorization: `bearer ${currentState.authtoken.token}`,
      },
    });

    const resJson = await res.json();
    return resJson;
  },
  //guardo las coordenadas del user en el state y pido al backend las mascotas cercanas
  async setUserCoordinates(coordinates) {
    const currentState = this.getState();
    currentState.userLocation = coordinates;

    const res = await fetch(
      API_BASE_URL +
        "/pets-around?lat=" +
        coordinates.lat +
        "&lng=" +
        coordinates.lng,
      {
        headers: {
          "content-type": "application/json",
          authorization: `bearer ${currentState.authtoken.token}`,
        },
      }
    ).catch((err) => {
      return err;
    });
    const resJson = await res.json();
    //guardo los resultados en el state
    currentState.petsAround = resJson;
    state.setState(currentState);
  },
  //guardo la zona y las coordenadas de una mascota
  setPetCoordinates(data, zone) {
    const coordinates = {
      lat: data[1],
      lng: data[0],
    };

    const currentState = state.getState();
    currentState.coordinates = coordinates;
    currentState.petZone = zone;
    //en caso que exista petData en el state duplico los datos
    //esto sirve cuando quiero editar los datos de una mascota
    //ya que tanto para reportar como para editar una mascota, se usa esta misma funcion en el componente map
    if (currentState.petData) {
      currentState.petData.lat = data[1];
      currentState.petData.lng = data[0];
      currentState.petData.zone = zone;
    }
    state.setState(currentState);
  },
  //da de alta una nueva mascota
  async reportPet(petData) {
    const currentState = this.getState();

    const res = await fetch(API_BASE_URL + "/pets", {
      method: "post",
      headers: {
        "content-type": "application/json",
        authorization: `bearer ${currentState.authtoken.token}`,
      },
      body: JSON.stringify(petData),
    }).catch((err) => {
      return err;
    });

    const resJson = await res.json();

    return resJson;
  },
  //obtiene los datos de una mascota y los guarda en el state
  async getPetData(petId) {
    const currentState = this.getState();

    const res = await fetch(API_BASE_URL + "/pets/" + petId, {
      headers: {
        "content-type": "application/json",
        authorization: `bearer ${currentState.authtoken.token}`,
      },
    }).catch((err) => {
      return err;
    });

    const resJson = await res.json();
    const petData = {
      id: resJson.id,
      name: resJson.name,
      pictureUrl: resJson.pictureUrl,
      lat: resJson.lat,
      lng: resJson.lng,
      condition: resJson.condition,
      userId: resJson.userId,
      zone: resJson.zone,
    };
    currentState.petData = petData;
    state.setState(currentState);
  },
  //obtiene todas las mascotas de un usuario
  async getUserPets() {
    const currentState = this.getState();
    const res = await fetch(API_BASE_URL + "/me/pets/", {
      headers: {
        "content-type": "application/json",
        authorization: `bearer ${currentState.authtoken.token}`,
      },
    }).catch((err) => {
      return err;
    });

    const resJson = await res.json();

    const mappedRes = map(resJson);
    if (mappedRes) {
      currentState.userPets = mappedRes;
      state.setState(currentState);
    }
  },
  //edita los datos de una mascota
  async editUserPet(params) {
    const currentState = this.getState();
    const res = await fetch(API_BASE_URL + "/pets/" + params.id, {
      method: "put",
      headers: {
        "content-type": "application/json",
        authorization: `bearer ${currentState.authtoken.token}`,
      },
      body: JSON.stringify(params),
    }).catch((err) => {
      return err;
    });

    const resJson = await res.json();
    return resJson;
  },
  //elimina una mascota de la database
  async deleteUserPet(petID: number) {
    const currentState = this.getState();
    const res = await fetch(API_BASE_URL + "/pets/" + petID, {
      method: "delete",
      headers: {
        "content-type": "application/json",
        authorization: `bearer ${currentState.authtoken.token}`,
      },
    }).catch((err) => {
      return err;
    });

    const resJson = await res.json();
    return resJson;
  },
  //envia el mensaje de reporte cuando una mascota fue vista
  async sendReportMessage(params: Report) {
    const res = await fetch(API_BASE_URL + "/pets/report", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(params),
    }).catch((err) => {
      return err;
    });
    const resJson = await res.json();
    return resJson;
  },
  //modifica los datos de un usuario
  async modifyUser(params) {
    const currentState = this.getState();
    const res = await fetch(API_BASE_URL + "/me", {
      method: "put",
      headers: {
        "content-type": "application/json",
        authorization: `bearer ${currentState.authtoken.token}`,
      },
      body: JSON.stringify(params),
    }).catch((err) => {
      return err;
    });
    const resJson = await res.json();
    return resJson;
  },
};

export { state };
