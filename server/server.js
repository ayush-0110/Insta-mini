const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const http = require("http").Server(app);
const mongoose = require("mongoose");
const Post = require("./models/posts.js");
const User = require("./models/users.js");
const PORT = 4000;
const multer = require("multer");
const crypto = require("crypto");
const dotenv = require("dotenv");
const { Suprsend } = require("@suprsend/node-sdk");
const { Event } = require("@suprsend/node-sdk");
dotenv.config();

let notifAllowed = true;

const supr_client = new Suprsend(
  process.env.WORKSPACE_KEY,
  process.env.WORKSPACE_SECRET
);

function hmac_rawurlsafe_base64_string(distinct_id, secret) {
  const hash = crypto
    .createHmac("sha256", secret)
    .update(distinct_id)
    .digest("base64url");

  const buff = Buffer.from(hash, "utf-8").toString("base64");

  console.log("The buffer is : " + buff);
  return buff;
}

const corsOptions = {
  origin: "*",
  credentials: true,
};

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.error(err));

app.use("/images", express.static(path.join(__dirname, "images")));
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const masterUser = {
  username: "Admin",
  email: "200104019@hbtu.ac.in",
  phone: "+919651295599",
};

app.get("/subid", (req, res) => {
  const { email } = req.query;
  if (!email) {
    res.status(400).send("Email parameter is missing");
    return;
  }
  let distinct_id = email;
  let subid = hmac_rawurlsafe_base64_string(
    distinct_id,
    process.env.INBOX_SECRET
  );
  res.status(201).send(subid);
});

app.post("/enter", async (req, res) => {
  const { username, email, phone } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { email: email },
      { username: username, email: email, phone: phone },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while saving the user.");
  }
});

app.post("/userpref", (req, res) => {
  const { ischecked } = req.body;

  if (ischecked == false) {
    notifAllowed = false;
  } else {
    notifAllowed = true;
  }
  res.status(200).json({ message: `notifs allowed: ${notifAllowed}` });
});

app.post("/posts/:postId/like", async (req, res) => {
  const userId = req.body.userId;
  const postId = req.params.postId;

  const post = await Post.findById(postId);
  const user1 = await User.findOne({ email: userId });
  const index = post.likes.indexOf(userId);

  if (index > -1) {
    post.likes.splice(index, 1);
    await post.save();
    return res.status(200).json({ message: "Post unliked." });
  }
  post.likes.push(userId);
  await post.save();


  const creator = await User.findOne({ email: post.userId });
  const creatorEmail = creator.email;
  const creatorPhone = creator.phone;

  try {
    const masteruser = supr_client.user.get_instance(masterUser.email);
    const receiveuser = supr_client.user.get_instance(creatorEmail);
    const senduser = supr_client.user.get_instance(userId);

    const event_name = "SENDING_NOTIF";

    let users = [masteruser, receiveuser, senduser];
    for (let user of users) {
      const properties = {
        rec_name: creator.username,
        interactant_name: user1.username,
        verb: "undef",
      };
      let distinct_id;
      if (user === masteruser) {
        user.add_email(masterUser.email);
        user.add_sms(masterUser.phone);
        distinct_id = masterUser.email;
        properties.rec_name = masterUser.username;
        properties.interactant_name = user1.username;
        properties.verb = `${creator.username}'s`;
      } else if (user === receiveuser) {
        user.add_email(creatorEmail);
        user.add_sms(`+${creatorPhone}`);
        distinct_id = creatorEmail;
        properties.rec_name = creator.username;
        properties.interactant_name = user1.username;
        properties.verb = "your";
      } else if (user === senduser && notifAllowed == true) {
        user.add_email(user1.email);
        user.add_sms(`+${user1.phone}`);
        distinct_id = user1.email;
        properties.rec_name = user1.username;
        properties.interactant_name = "You";
        properties.verb = `${creator.username}'s`;
      }

      const response1 = user.save();
      response1.then((res) => console.log("response", res));

      const event = new Event(distinct_id, event_name, properties);
      const response = supr_client.track_event(event);
      response.then((res) => console.log("response send", res));
    }
    res.status(200).send({ message: "Notification sent successfully" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).send({ message: "Error sending notification" });
  }

});

app.get("/posts", (req, res) => {
  Post.find()
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => {
      res.status(500).json({ error: "An error occurred while fetching posts" });
    });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
app.post("/posts", upload.single("uploaded_file"), (req, res) => {
  const { contributor, body, userId } = req.body;
  const image = req.file.filename;

  if (!contributor || !body || !image) {
    return res
      .status(400)
      .json({ error: "Missing contributor, body or image" });
  }

  const newPost = new Post({
    contributor,
    image,
    body,
    userId,
  });

  newPost
    .save()
    .then((savedPost) => {
      res.status(201).json(savedPost);
    })
    .catch((error) => {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while adding the post" });
    });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
