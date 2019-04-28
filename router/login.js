const crypto = require("crypto");

//邮箱登录
// module.exports = (req, res, createWebAPIRequest, request) => {
//   console.log("■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■");
//   console.log("执行登陆");
//   console.log("■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■");
//   const email = req.query.email;
//   const cookie = req.get("Cookie") ? req.get("Cookie") : "";
//   const md5sum = crypto.createHash("md5");
//   md5sum.update(req.query.password);
//   const data = {
//     username: email,
//     password: md5sum.digest("hex"),
//     rememberLogin: "true",
//     clientToken:
//       "1_jVUMqWEPke0/1/Vu56xCmJpo5vP1grjn_SOVVDzOc78w8OKLVZ2JH7IfkjSXqgfmh"
//   };
//   console.log(email, req.query.password);

//   createWebAPIRequest(
//     "music.163.com",
//     "/weapi/login?csrf_token=",
//     "POST",
//     data,
//     cookie,
//     (music_req, cookie) => {
//       // console.log(music_req)
//       cookie =
//         cookie && cookie.map(x => x.replace("Domain=.music.163.com", ""));
//       res.set({
//         "Set-Cookie": cookie
//       });
//       res.send(music_req);
//     },
//     err => res.status(502).send("fetch error")
//   );
// };


//手机登录
module.exports = (req, res, createWebAPIRequest, request) => {

  const phone = req.query.phone;
  const cookie = req.get("Cookie") ? req.get("Cookie") : "";
  const md5sum = crypto.createHash("md5");
  md5sum.update(req.query.password);
  const data = {
    phone: phone,
    password: md5sum.digest("hex"),
    rememberLogin: "true"
  };
  console.log("■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■");
  console.log("执行登陆");
  console.log(phone, req.query.password);
  console.log("■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■");
  createWebAPIRequest(
    "music.163.com",
    "/weapi/login/cellphone",
    "POST",
    data,
    cookie,
    (music_req, cookie = []) => {
      const cookieStr =
        "appver=1.5.9;os=osx; channel=netease;osver=%E7%89%88%E6%9C%AC%2010.13.2%EF%BC%88%E7%89%88%E5%8F%B7%2017C88%EF%BC%89";
      cookieStr.split(";").forEach(item => {
        cookie.push(item + ";Path=/");
      });
      res.set({
        "Set-Cookie": cookie
      });
      res.send(music_req);
    },
    err => res.status(502).send("fetch error")
  );
};
