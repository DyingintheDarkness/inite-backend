// Get Specific User Instagram Data By Username
import { instagramUser } from "../../models/ig/instagramUser";
import { Router, Request, Response } from "express";
import { uploadMedia } from "../../main";
const { getUserByUsername } = require("instagram-stories");
const router = Router();
router.post("/user/get", async (req: Request, res: Response) => {
  let user: any;
  user = await instagramUser.findOne({ username: req.body.username });
  let biography;
  let avatar;
  if (!user) {
    user = await getUserByUsername({
      username: req.body.username,
      userid: process.env.USER_ID,
      sessionid: process.env.SESSION_ID,
    });
    
    if (!user) {
      return res.status(404).send("User Not Found");
    }
    const currentAvatar = await uploadMedia(
      user.user.profile_pic_url_hd,
      `temp/${user.user.username}`
    );
    const userData = {
      name: user.user.full_name,
      username: user.user.username,
      biography: user.user.biography,
      avatar: currentAvatar,
      isPrivate: user.user.is_private,
      postsCount: user.user.edge_owner_to_timeline_media.count,
      followingCount: user.user.edge_follow.count,
      followedByCount: user.user.edge_followed_by.count,
      userPresent: false,
    };
    return res.send(userData);
  }

  if (!user.recentlyAdded) {
    for (let i = 0; i <= user.biography.length - 1; i++) {
      if (user.biography[i].recent) {
        biography = user.biography[i].text;
        break;
      }
    }
    for (let i = 0; i <= user.avatars.length - 1; i++) {
      if (user.avatars[i].recent) {
        avatar = user.avatars[i].url;
        break;
      }
    }
  } else {
    biography = user.biography[0].text;
    avatar = user.avatars[0].url;
  }

  if (user && user.isBanned) {
    return res.status(204).send("Invalid User");
  }

  return res.send({
    name: user.name,
    username: user.username,
    biography: biography,
    avatar: avatar,
    isPrivate: user.isPrivate,
    postsCount: user.postsCount,
    followingCount: user.followingCount,
    followedByCount: user.followedByCount,
    userPresent: true,
  });
});

export { router };
