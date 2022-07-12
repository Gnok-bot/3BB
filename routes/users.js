const e = require('express');
const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
const { body, validationResult } = require('express-validator')
const Blogs = require('../models/blogs');
const app = require('../app');
const { execute } = require('../models/blogs');
const fs = require('fs-extra');
const path = require('path')
const nodemailer = require('nodemailer')
const randtoken = require('rand-token')
const dotenv = require('dotenv')
dotenv.config()

const router = express.Router();

//image storages
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "img_logo") {
      cb(null, './public/images/' + req.session.id + '/headers')
    } else if (file.fieldname === "img") {
      cb(null, './public/images/' + req.session.id + '/banners')
    } else if (file.fieldname === "promotionImg") {
      cb(null, './public/images/' + req.session.id + '/promos')
    } else if (file.fieldname === "packageImg") {
      cb(null, './public/images/' + req.session.id + '/packages')
    } else if (file.fieldname === "line_qrcode") {
      cb(null, './public/images/' + req.session.id + '/qrcode')
    } else if (file.fieldname === "packageImg1") {
      cb(null, './public/images/' + req.session.id + '/packages')
    } else if (file.fieldname === "packageImg2") {
      cb(null, './public/images/' + req.session.id + '/packages')
    } else if (file.fieldname === "packageImg3") {
      cb(null, './public/images/' + req.session.id + '/packages')
    } else if (file.fieldname === "packageImg4") {
      cb(null, './public/images/' + req.session.id + '/packages')
    } else if (file.fieldname === "packageImg5") {
      cb(null, './public/images/' + req.session.id + '/packages')
    } else if (file.fieldname === "packageImg6") {
      cb(null, './public/images/' + req.session.id + '/packages')
    } else if (file.fieldname === "packageImg7") {
      cb(null, './public/images/' + req.session.id + '/packages')
    } else if (file.fieldname === "packageImg8") {
      cb(null, './public/images/' + req.session.id + '/packages')
    }


  },
  filename: function (req, file, cb) {
    if (file.fieldname === "img_logo") {
      cb(null, Date.now() + ".jpg")
    } else if (file.fieldname === "img") {
      cb(null, Date.now() + ".jpg")
    } else if (file.fieldname === "promotionImg") {
      cb(null, Date.now() + ".jpg")
    } else if (file.fieldname === "packageImg") {
      cb(null, Date.now() + ".jpg")
    } else if (file.fieldname === "line_qrcode") {
      cb(null, Date.now() + ".jpg")
    } else if (file.fieldname === "packageImg1") {
      cb(null, Date.now() + ".jpg")
    } else if (file.fieldname === "packageImg2") {
      cb(null, Date.now() + ".jpg")
    } else if (file.fieldname === "packageImg3") {
      cb(null, Date.now() + ".jpg")
    } else if (file.fieldname === "packageImg4") {
      cb(null, Date.now() + ".jpg")
    } else if (file.fieldname === "packageImg5") {
      cb(null, Date.now() + ".jpg")
    } else if (file.fieldname === "packageImg6") {
      cb(null, Date.now() + ".jpg")
    } else if (file.fieldname === "packageImg7") {
      cb(null, Date.now() + ".jpg")
    } else if (file.fieldname === "packageImg8") {
      cb(null, Date.now() + ".jpg")
    }
  }
})

const upload = multer({
  storage: storage
})


router.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2', 'key3'],
  maxAge: 3600 * 1000 // 1hr  
}))

//Declaring custom Middleware
const ifNotLoggedIn = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.render('login')
  }
  next();
}

const ifLoggedIn = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.render('/admin/blogs')
  }
  next();
}

const ifNotAdmin = (req,res,next) => {
  const id = req.session.id
  Blogs.execute('SELECT role FROM users WHERE id = ?',[id]).then((result)=>{
    // console.log(result[0][0].role);
    if( result[0][0].role != 'Admin'){
    return res.redirect('/admin')
  }
  next();
  })
}

/* GET users listing. */
router.get('/', ifNotLoggedIn, function (req, res, next) {
  Blogs.execute("SELECT username FROM users WHERE id = ?", [req.session.id])
    .then(([rows]) => {
      res.redirect('/admin/blogs')
    })
});
router.get('/adduser', ifNotAdmin,(req, res) => {
  res.render('register')
})

router.post('/adduser', ifNotLoggedIn, [
  body('username', 'ชื่อผู้ใช้งานไม่ถูกต้อง').custom((value) => {
    return Blogs.execute("SELECT username FROM users WHERE username = ?", [value])
      .then(([rows]) => {
        if (rows.length > 0) {
          return Promise.reject("ชื่อผู้ใช้งานนี้อยู่ในระบบแล้ว")
        }
        return true;
      })
  }),
  body('password', 'รหัสผ่านควรมีมากกว่า 6 ตัวขึ้นไป').trim().isLength({ min: 6 })
],
  (req, res, next) => {
    const validation_result = validationResult(req);
    const { username, password, role } = req.body
    if (validation_result.isEmpty()) {
      bcrypt.hash(password, 12).then((hash_pass) => {
        Blogs.execute("INSERT INTO users (username,password,role) VALUES (?,?,?)", [username, hash_pass, role])
          .then(result => {
            res.render('succeed')
            Blogs.execute("SELECT id FROM users WHERE username = ?",[username])
            .then((result)=>{
              fs.ensureDir('./public/images/' + result[0][0].id + '/banners', err => {console.log(err)})
              fs.ensureDir('./public/images/' + result[0][0].id + '/headers', err => {console.log(err)})
              fs.ensureDir('./public/images/' + result[0][0].id + '/packages', err => {console.log(err)})
              fs.ensureDir('./public/images/' + result[0][0].id + '/promos', err => {console.log(err)})
              fs.ensureDir('./public/images/' + result[0][0].id + '/qrcode', err => {console.log(err)})
            })
          }).catch(err => {
            if (err) throw err;
          })
      }).catch(err => {
        if (err) throw err;
      })
    } else {
      let allErr = validation_result.errors.map((error) => {
        return error.msg;
      })
      const id = req.session.id
      Blogs.execute('SELECT * FROM users').then((results)=>{
        results = results[0]
        Blogs.execute('SELECT role FROM users WHERE id = ?',[id]).then((result)=>{
          res.render("blogs/userconfig",{role: result[0], 
            results: results,
            register_error: allErr,
            old_data: req.body
          });
        }).catch((err)=>{if (err) throw err})
      }).catch((err)=>{if (err) throw err})
    }
  }
)

router.get('/succeed', (req,res)=>{
  res.render('succeed')
})

//login page
router.post('/login', ifLoggedIn, [
  body('username').custom((value) => {
    return Blogs.execute("SELECT username FROM users WHERE username = ?", [value])
      .then(([rows]) => {
        if (rows.length == 1) {
          return true;
        }
        return Promise.reject('ชื่อผู้ใช้งานไม่ถูกต้อง')
      })
  }),
  body('password', 'กรุณาใส่รหัสผ่าน').trim().not().isEmpty(),
  (req, res) => {
    const validation_result = validationResult(req)
    const { username, password } = req.body
    if (validation_result.isEmpty()) {
      Blogs.execute("SELECT * FROM users WHERE username = ?", [username])
        .then(([rows]) => {
            bcrypt.compare(password, rows[0].password).then(compare_result => {
            if (compare_result == true) {
              req.session.isLoggedIn = true;
              req.session.id = rows[0].id;
              const action = 'Log in'
              var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
              Blogs.execute('INSERT INTO logs (ip_address,username,action) VALUES (?,?,?)',[ip,username,action]).then(
                res.redirect('/admin/blogs')
              ).catch((err)=>{if (err) throw err})
            } else {
              res.render('login', {
                login_errors: ['รหัสผ่านไม่ถูกต้อง']
              })
            }
          }).catch(err => {
            if (err) throw err;
          })
        }).catch(err => {
          if (err) throw err;
        })
    } else {
      let allErr = validation_result.errors.map((error) => {
        return error.msg
      })
      res.render('login', {
        login_errors: allErr
      })
    }
  }
])

router.get('/forgot', (req,res)=>{
  res.render('forgot')
})

//send email
function sendEmail(email, token) {
 
  var email = email;
  var token = token;

var transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: { user: "gnoktester@gmail.com", 
          pass: "ochuewascdsojvne" }, 
  });

  var mailOptions = {
      from: 'gnoktester@outlook.com',
      to: 'gnoktester@gmail.com',
      subject: 'Reset Password Link',
      html: '<p>You requested for reset password, kindly use this <a href="http://localhost:3000/reset-password?token=' + token + '">link</a> to reset your password</p>'

  };
  transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      console.log(err)
    else
      console.log(info);
 });
}

// send reset password link in email
router.post('/reset-password', (req,res)=>{
  var email = req.body.email
  Blogs.execute('SELECT * FROM usersinfo WHERE email= ?',[email]).then((result,err)=>{
    if(err) throw err;
    if(typeof result[0][0] != 'undefined'){
      if(result[0][0].email.length > 0){
        var token = randtoken.generate(20);
        var sent = sendEmail(email, token);
        if(sent != '0'){
          Blogs.execute('SELECT id FROM usersinfo WHERE email = ?',[email]).then(
            (result)=>{
              console.log(result[0][0].id);
              id = result[0][0].id;
              Blogs.execute('UPDATE users SET token = ? WHERE id = ?', [token,id]).then()
              .catch((err)=>{
                if (err) throw err;
              })
            }
          )
          .catch((err)=>{
            if (err) throw err;
          })
          console.log('success') 
        } else {
          console.log('error something wrong') 
        }
      } else {'error something wrong'}
    }else {
      console.log('The Email is not registered with us') 
    }
    // res.redirect('/forgot');
  }).catch((err)=>{
    if (err) throw err;
  })
})

//logout
router.get('/logout', (req, res) => {
  req.session = null
  res.redirect('/')
})

// System Log
router.get('/log', ifNotLoggedIn, ifNotAdmin, (req, res, next) => {
  const id = req.session.id
  Blogs.execute('SELECT * FROM logs').then((results)=>{
    results = results[0]
    Blogs.execute('SELECT role FROM users WHERE id = ?',[id]).then((result)=>{
      res.render("blogs/log",{role: result[0], results: results});
    }).catch((err)=>{if (err) throw err})
  }).catch((err)=>{if (err) throw err})
})

// User Config
router.get('/user-config', ifNotLoggedIn, ifNotAdmin, (req, res, next) => {
  const id = req.session.id
  Blogs.execute('SELECT * FROM users').then((results)=>{
    results = results[0]
    Blogs.execute('SELECT role FROM users WHERE id = ?',[id]).then((result)=>{
      res.render("blogs/userconfig",{role: result[0], results: results});
    }).catch((err)=>{if (err) throw err})
  }).catch((err)=>{if (err) throw err})
})

// Blog page
router.get('/blogs', ifNotLoggedIn, function (req, res, next) {
  const id = req.session.id
  Blogs.execute("SELECT * FROM blogs b, usersinfo u WHERE b.id = u.id AND b.id = ?", [id])
    .then((result) => {
      blogResult = result[0]
      if(blogResult == ''){
        bg = 'bg5.jpg'
      } else{
        bg = result[0][0].img_header
      }
      Blogs.execute("SELECT * FROM promotion p WHERE p.id = ?", [id]).then((result) => {
        promoResult = result[0]
        Blogs.execute("SELECT * FROM packages p WHERE p.id = ?", [id]).then((result) => {
          packResult = result[0]
          Blogs.execute("SELECT role FROM users WHERE id = ?",[id]).then((result)=>{
            role = result[0]
            res.render("blogs/index", { data: "3BB ระบบหลังบ้าน", bg: bg, blogs: blogResult, promo: promoResult, packages: packResult, role:role, isLoggedIn: "admin" });
          })
        })
      })
      // 
    }).catch((err) => {
      if (err) throw err;
    })
});

router.get('/googletag', ifNotLoggedIn, function (req, res, next) {
  const id = req.session.id  
  Blogs.execute('SELECT * FROM google_tag WHERE id = ?',[id]).then((results)=>{
    results = results[0]
    Blogs.execute('SELECT role FROM users WHERE id = ?',[id]).then((result)=>{
      res.render("blogs/googletag",{role: result[0], results: results});
    }).catch((err)=>{if (err) throw err})
  }).catch((err)=>{if (err) throw err})
});

router.get('/add-googletag', ifNotLoggedIn, function (req, res, next) {
  const id = req.session.id
  Blogs.execute('SELECT role FROM users WHERE id = ?',[id]).then((result)=>{
    res.render("blogs/addGoogletag",{role:result[0]});
  }).catch((err)=>{if (err) throw err})
});

router.post('/add-googletag', ifNotLoggedIn, (req, res) =>{
  const id = req.session.id
  const google_manager = req.body.google_manager
  const google_analytic = req.body.google_analytic
  const google_verification = req.body.google_verification

  Blogs.execute('DELETE FROM google_tag WHERE id = ?',[id]).then(
    Blogs.execute('INSERT INTO google_tag (id,google_manager,google_analytic,google_verification) VALUE (?,?,?,?)',[id,google_manager,google_analytic,google_verification])
    .then(res.redirect("/admin/googletag"))
    .catch((err)=>{ if (err) throw err})
  ).catch((err)=>{ if (err) throw err})
})

router.get('/add', ifNotLoggedIn, function (req, res, next) {
  res.render("blogs/addForm", { data: "3BB เพิ่มข้อมูล" });
});

//profile page
router.get('/profile', ifNotLoggedIn, function (req, res, next) {
  const id = req.session.id
  Blogs.execute('SELECT * FROM usersinfo WHERE id=? LIMIT 1', [id])
    .then((blog) => {
      blogResult = blog[0]
      Blogs.execute('SELECT role FROM users WHERE id = ?',[id]).then((result)=>{
        res.render("blogs/profile",{role:result[0], blogs:blogResult});
      }).catch((err)=>{ if (err) throw err })
    }).catch((err) => { if (err) throw err; })

});

router.get('/profile/add/', ifNotLoggedIn, function (req, res, next) {
  const id = req.session.id
  Blogs.execute('SELECT role FROM users WHERE id = ?',[id]).then((result)=>{
    res.render("blogs/addProfile",{role:result[0]});
  }).catch((err)=>{if (err) throw err})
});

// ADD Profile INFO 
router.post('/profileadd', upload.single('line_qrcode'), (req, res, next) => {
  const id = req.session.id
  const line_qrcode = (req.file != null) ? req.file.filename : ''
  const { emp_id, firstName, lastName, email, telNum, line_url, fb_url, area, province, address } = req.body
  Blogs.execute("INSERT INTO usersinfo (id,emp_id,firstName,lastName,email,telNum,line_url,line_qrcode,fb_url,area,province,address) \
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", [id, emp_id, firstName, lastName, email, telNum, line_url, line_qrcode, fb_url, area, province, address])
    .then(
      Blogs.execute("UPDATE users SET firstName = ?, lastName = ? WHERE id= ?",[firstName,lastName,id]).then(
        res.redirect('/admin/profile'))
      ).catch((err)=>{
        if (err) throw err;
      })
    .catch((err) => {
      if (err) throw err;
    })
})

// Render EditProfile Page
router.get('/profile/edit?:id', ifNotLoggedIn, function (req, res, next) {
  const id = req.session.id
  Blogs.execute('SELECT * FROM usersinfo WHERE id=? ', [id])
    .then((blog) => {
      blogResult = blog[0]
      Blogs.execute('SELECT role FROM users WHERE id = ?',[id]).then((result)=>{
        res.render("blogs/editProfile",{role: result[0], blogs: blogResult});
      }).catch((err)=>{ if (err) throw err })
    }).catch((err) => { if (err) throw err })
});

router.post('/profile/update', upload.single('line_qrcode'), (req, res, next) => {
  const id = req.session.id
  const { emp_id, firstName, lastName, email, telNum, line_url, fb_url, area, province, address } = req.body
  if (req.file != null) {
    line_qrcode = req.file.filename
    const path = './public/images/' + req.session.id + '/qrcode/' + req.body.line_qrcodePrev
    fs.remove(path, (err) => {
      if (err) throw err;
    })
  } else {
    line_qrcode = req.body.line_qrcodePrev
  }
  Blogs.execute("UPDATE usersinfo SET emp_id = ?, firstName = ?, lastName = ?, email = ?, telNum = ?, line_url = ?, line_qrcode = ?, fb_url = ?, area = ?, province = ?, address = ? \
    WHERE id = ?", [emp_id, firstName, lastName, email, telNum, line_url, line_qrcode, fb_url, area, province, address, id])
    .then(
      Blogs.execute("UPDATE users SET firstName = ?, lastName = ? WHERE id= ?",[firstName,lastName,id]).then(
        res.redirect('/admin/profile')
      ).catch((err) => {
        if (err) throw err;
      })
    ).catch((err) => {
      if (err) throw err;
    })
})


router.get('/delete/:id', ifNotLoggedIn, function (req, res, next) {
  // DELETE DATA
  const id = req.session.id
  Blogs.execute("DELETE blogs,promotion,packages \
    FROM blogs INNER JOIN promotion ON blogs.id = promotion.id \
    INNER JOIN packages ON blogs.id = packages.id \
    WHERE blogs.id=?", [id])
    .then(
      fs.emptyDir('./public/images/' + req.session.id + '/banners', err => {if (err) return console.error(err)}),
      fs.emptyDir('./public/images/' + req.session.id + '/headers', err => {if (err) return console.error(err)}),
      fs.emptyDir('./public/images/' + req.session.id + '/packages', err => {if (err) return console.error(err)}),
      fs.emptyDir('./public/images/' + req.session.id + '/promos', err => {if (err) return console.error(err)}),
      res.redirect('/admin/blogs'))
    .catch((err) => {
      if (err) throw err;
    })
});

//EDIT PAGE
router.get('/edit/:id', ifNotLoggedIn, function (req, res, next) {
  const id = req.session.id
  Blogs.execute("SELECT * FROM blogs b,promotion p WHERE b.id = p.id AND b.id=?", [id])
    .then((blog) => {
      blogResult = blog[0]
      Blogs.execute("SELECT * FROM packages p WHERE p.id = ?", [id]).then((result) => {
        packResult = result[0]
        res.render("blogs/editForm", { data: "แก้ไข blog", blog: blogResult, packages: packResult });
      })
    }).catch((err) => {
      if (err) throw err;
    })
});

//ADD Data
const imgUpload = upload.fields([{ name: 'img_logo', maxCount: 1 }, { name: 'promotionImg', maxCount: 1 },
{ name: 'packageImg', maxCount: 8 }, { name: 'img', maxCount: 8 }])
router.post('/add', imgUpload, function (req, res, next) {
  id = req.session.id
  title = req.body.title,
    subtitle = req.body.subtitle,
    img_logo = req.files['img_logo'][0].filename
    if(req.body.cardinfo != null){
      cardinfo = req.body.cardinfo
    } else cardinfo = ''
  //Banner Img
  req.files['img'] != null ? (
    img_banner1 = req.files['img'][0].filename,
    img_banner2 = req.files['img'][1].filename,
    img_banner3 = req.files['img'][2].filename)
    : (img_banner1 = '', img_banner2 = '', img_banner3 = '')

  //Promotion props
  promoDesc = req.body.promoDesc,
    promoImg = req.files['promotionImg'][0].filename

  if(req.body.option == 'option1'){
    img_header = 'bg3.jpg'
  }else if(req.body.option == 'option2'){
    img_header = 'bg4.jpg'
  }else if(req.body.option == 'option3'){
    img_header = 'bg6.jpg'
  }
  // Package props
  const index = req.body.packageName.length;
  for (i = 0; i < index; i++) {
    packageName = req.body.packageName[i]
    packagePrice = req.body.packagePrice[i] 
    packageDesc = req.body.packageDesc[i]
    packageImg = req.files['packageImg'][i].filename

    Blogs.execute("INSERT INTO packages (id,packageNo,packageName,packagePrice,packageDesc,packageImg) \
      VALUES (?,?,?,?,?,?)" , [id, (i + 1), packageName, packagePrice, packageDesc, packageImg])
      .then().catch((err) => {
        if (err) throw err;
      })
  }
  // INSERT DATA INTO TABLE BLOGS
  Blogs.execute("INSERT INTO blogs (id, title, subtitle, img_header, img_logo, img_banner1, img_banner2, img_banner3, cardinfo) values \
    (?,?,?,?,?,?,?,?,?)", [id, title, subtitle, img_header, img_logo, img_banner1, img_banner2, img_banner3, cardinfo])
    .then().catch((err) => {
      if (err) throw err;
    })
  // INSERT DATA INTO TABLE PROMOTION
  Blogs.execute("INSERT INTO promotion (id, promoDesc, promoImg) VALUES (?,?,?)", [id, promoDesc, promoImg])
    .then().catch((err) => {
      if (err) throw err;
    })
    .then(res.redirect("/")).catch((err) => {
      if (err) throw err;
    })
});

//UPDATE DATA
const imgUpdate = upload.fields([{ name: 'img_logo', maxCount: 1 }, { name: 'promotionImg', maxCount: 1 },
{ name: 'packageImg1', maxCount: 1 }, { name: 'packageImg2', maxCount: 1 }, { name: 'packageImg3', maxCount: 1 },
{ name: 'packageImg4', maxCount: 1 }, { name: 'packageImg5', maxCount: 1 }, { name: 'packageImg6', maxCount: 1 },
{ name: 'packageImg7', maxCount: 1 }, { name: 'packageImg8', maxCount: 1 }, { name: 'img', maxCount: 8 }])

router.post('/update', imgUpdate, function (req, res, next) {
  // console.log(req.body);
  id = req.session.id
  title = req.body.title,
    subtitle = req.body.subtitle
  if (req.files['img_logo'] != null) {
    img_logo = req.files['img_logo'][0].filename
    const path = './public/images/' + req.session.id + '/headers/' + req.body.img_logoPrev
    fs.remove(path, (err) => {
      if (err) throw err;
    })
  } else {
    img_logo = req.body.img_logoPrev
  }
  //Header Img
  if(req.body.option){
    if(req.body.option == 'option1'){
      img_header = 'bg3.jpg'
    }else if(req.body.option == 'option2'){
      img_header = 'bg4.jpg'
    }else if(req.body.option == 'option3'){
      img_header = 'bg6.jpg'
    }
  }else{
    img_header = req.body.img_headerPrev
  }

  //Banner Img 
  if (req.files['img'] != null) {
    (
      img_banner1 = req.files['img'][0].filename,
      img_banner2 = req.files['img'][1].filename,
      img_banner3 = req.files['img'][2].filename
    )
    if (req.body.img_banner[0] != '') {
      for (i = 0; i <= 2; i++) {
        const path = './public/images/' + req.session.id + '/banners/' + req.body.img_banner[i]
        fs.unlink(path, (err) => {
          if (err) throw err;
        })
      }
    }
  } else if(req.body.img != 'on'){
    img_banner1 = req.body.img_banner[0]
    img_banner2 = req.body.img_banner[1]
    img_banner3 = req.body.img_banner[2]
  } else {
    for (i = 0; i <= 2; i++) {
      const path = './public/images/' + req.session.id + '/banners/' + req.body.img_banner[i]
      fs.unlink(path, (err) => {
        if (err) throw err;
      })
    }
    (img_banner1 = '', img_banner2 = '', img_banner3 = '')
  }

  if(req.body.cardinfo != null){
    cardinfo = req.body.cardinfo
  } else cardinfo = ''

  Blogs.execute("UPDATE blogs SET title = ?, subtitle = ?,img_header = ?, img_logo = ?, img_banner1 = ?, img_banner2 = ?, img_banner3 = ?, \
    cardinfo = ? WHERE id = ?", [title, subtitle, img_header, img_logo, img_banner1, img_banner2, img_banner3, cardinfo, id])
    .then().catch((err) => {
      if (err) throw err;
    })

  //Promotion props
  req.body.promoDesc != '' ? promoDesc = req.body.promoDesc : promoDesc = req.body.promoDescPrev
  if (req.files['promotionImg'] != null) {
    promoImg = req.files['promotionImg'][0].filename
    const path = './public/images/' + req.session.id + '/promos/' + req.body.promoImgPrev;
    fs.remove(path, (err) => {
      if (err) throw err;
    })
  } else {
    promoImg = req.body.promoImgPrev;
  }
  Blogs.execute("UPDATE promotion SET promoDesc = ?, promoImg = ? WHERE id = ?", [promoDesc, promoImg, id])
    .then().catch((err) => {
      if (err) throw err;
    })
  //Packages props
  // console.log(req.body);
  // console.log(req.files);
  Blogs.execute("DELETE FROM packages WHERE id = ?", [id])
  const index = req.body.package.length
  for (i = 1; i <= index; i++) {
    packageName = req.body.package[i - 1].name
    packagePrice = req.body.package[i - 1].price
    packageDesc = req.body.package[i - 1].desc

    if (typeof req.files['packageImg' + i] !== 'undefined') {
      if (req.files === 'packageImg' + i != null) {
        packageImg = req.files['packageImg' + i][0].filename
        if (req.body.package[i - 1].packageImgPrev != null) {
          const path = './public/images/' + req.session.id + '/packages/' + req.body.package[i - 1].packageImgPrev
          fs.remove(path, (err) => {
            if (err) throw err;
          })
        }
      } else { if (err) throw err; }
    } else {
      packageImg = req.body.package[i - 1].packageImgPrev
    }
    Blogs.execute("INSERT INTO packages (id,packageNo,packageName,packagePrice,packageDesc,packageImg) \
      VALUES (?,?,?,?,?,?)" , [id, i, packageName, packagePrice, packageDesc, packageImg])
      .then(
      ).catch((err) => {
        if (err) throw err;
      })
  }
  res.redirect('/admin/blogs');
});

router.get('/delete-pk/:packageNo', ifNotLoggedIn, function (req, res, next) {
  // DELETE DATA
  const id = req.session.id
  packageNo = req.params.packageNo;
  Blogs.execute('SELECT packageImg FROM packages WHERE packageNo = ? AND id= ?', [packageNo, id])
    .then((img) => {
      var imgName = img[0][0].packageImg
      const path = './public/images/' + req.session.id + '/packages/' + imgName
      fs.remove(path, (err) => {
        if (err) throw err;
      })
    }) 
  Blogs.execute('DELETE FROM packages WHERE packageNo = ? AND id= ?', [packageNo, id])
    .then(res.redirect("/admin/edit/" + id))
});

router.get('/footer', ifNotLoggedIn, function (req, res, next) {
  const id = req.session.id
  Blogs.execute('SELECT * FROM usersinfo WHERE id=?', [id])
    .then((blog) => {
      res.render("blogs/footer", { blogs: blog[0] });
    }).catch((err) => {
      if (err) throw err;
    })
});

router.get('/navbar', ifNotLoggedIn, (req,res)=>{
  const id = req.session.id
  Blogs.execute('SELECT role FROM users WHERE id=?',[id]).then((result)=>{
    res.render("navbar",{role :result[0]})
  }).catch((err)=>{if (err) throw err})
})

module.exports = router;
