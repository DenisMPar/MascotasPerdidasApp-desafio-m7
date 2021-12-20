import * as cors from "cors";
import * as express from "express";
import * as jtw from "jsonwebtoken";
import * as path from "path";
import {
  checkUser,
  createUser,
  getToken,
  updateUser,
} from "./controllers/auth";
import { getUserProfile } from "./controllers/users-controller";
import {
  deletePet,
  getPet,
  getUserPets,
  modifyPet,
  reportPet,
  searchPetsAround,
  sendPetReport,
} from "./controllers/pets-controllers";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(
  express.json({
    limit: "50mb",
  })
);

const SECRET = process.env.SECRET;
const frontEndPath = path.resolve(__dirname, "../dist");

//check user email
app.post("/check", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({
      message: "el request debe incluir un email",
    });
  }
  const userExist = await checkUser(email);
  res.json({
    user: userExist,
  });
});

//sign up
app.post("/auth", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({
      message: "faltan datos en el body",
    });
  } else {
    const user = await createUser({ email, password, name }).catch((err) => {
      res.status(400).json({
        message: err,
      });
    });
    res.json(user);
  }
});

//sign in

app.post("/auth/token", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      message: "faltan datos en el body",
    });
  } else {
    const user = {};
    const token = await getToken({ email, password }).catch((err) => {
      res.status(400).json({
        message: err,
      });
    });

    res.json({ token });
  }
});
//authorization middleware
function authMiddleware(req, res, next) {
  const authHeader = req.get("authorization");
  if (authHeader) {
    try {
      const token = req.headers.authorization.split(" ")[1];

      const data = jtw.verify(token, SECRET);

      req._user = data;
      next();
    } catch (error) {
      res.status(401).json({
        error: "not authorized",
      });
    }
  } else {
    res.status(401).json({
      error: "auth header not found",
    });
  }
}
//get user data
app.get("/me", authMiddleware, async (req, res) => {
  const userProfile = await getUserProfile(req._user.id).catch((err) => {
    res.status(400).json({
      message: err,
    });
  });

  res.json(userProfile);
});
//modify user data
app.put("/me", authMiddleware, async (req, res) => {
  const userUpdated = await updateUser(req._user.id, req.body).catch((err) => {
    res.status(400).json({
      message: err,
    });
  });
  res.json(userUpdated);
});
//report new pet
app.post("/pets", authMiddleware, async (req, res) => {
  const { name, pictureUrl, lat, lng, condition, zone } = req.body;
  if (!name || !pictureUrl || !lat || !lng || !condition || !zone) {
    res.status(400).json({
      message: "faltan datos en el body",
    });
  } else {
    const pet = await reportPet(req._user.id, {
      name,
      pictureUrl,
      lat,
      lng,
      condition,
      zone,
    }).catch((err) => {
      res.status(400).json({
        message: err,
      });
    });
    res.json(pet);
  }
});
//modify pet by id
app.put("/pets/:id", authMiddleware, async (req, res) => {
  const pet = await modifyPet(req.body, req.params.id).catch((err) => {
    res.status(400).json({
      message: err,
    });
  });
  res.json(pet);
});
//get pet data by id
app.get("/pets/:id", authMiddleware, async (req, res) => {
  const pet = await getPet(req.params.id).catch((err) => {
    res.status(400).json({
      message: err,
    });
  });
  res.json(pet);
});
//delete pet data by id
app.delete("/pets/:id", authMiddleware, async (req, res) => {
  const pet = await deletePet(req.params.id).catch((err) => {
    res.status(400).json({
      message: err,
    });
  });
  res.json(pet);
});
//get all user pets
app.get("/me/pets", authMiddleware, async (req, res) => {
  const pets = await getUserPets(req._user.id).catch((err) => {
    res.status(400).json({
      message: err,
    });
  });

  res.json(pets);
});
//send pet report
app.post("/pets/report", async (req, res) => {
  const { name, phone, message, petId } = req.body;
  if (!name || !phone || !message) {
    res.status(400).json({
      message: "faltan datos en el body",
    });
  } else {
    const report = await sendPetReport(petId, { name, phone, message }).catch(
      (err) => {
        res.status(400).json({
          message: err,
        });
      }
    );

    res.json(report);
  }
});
//get all pets around
app.get("/pets-around", async (req, res) => {
  const lat = req.query.lat;
  const lng = req.query.lng;
  const location = {
    lat,
    lng,
  };

  const results = await searchPetsAround(location);

  res.json(results);
});

app.use(express.static(frontEndPath));
app.get("*", (req, res) => {
  res.sendFile(frontEndPath + "/index.html");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
