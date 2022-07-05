const e = require('express');
const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
const { body, validationResult } = require('express-validator')
const router = express.Router();
const Blogs = require('../models/blogs');
const app = require('../app');
const { execute } = require('../models/blogs');
const fs = require('fs-extra');
const path = require('path')


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

/* GET users listing. */
router.get('/', ifNotLoggedIn, function (req, res, next) {
  Blogs.execute("SELECT username FROM users WHERE id = ?", [req.session.id])
    .then(([rows]) => {
      res.redirect('/admin/blogs')
    })
});
router.get('/adduser', ifNotLoggedIn, (req, res) => {
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
    const { username, password } = req.body

    if (validation_result.isEmpty()) {
      bcrypt.hash(password, 12).then((hash_pass) => {
        Blogs.execute("INSERT INTO users (username,password) VALUES (?,?)", [username, hash_pass])
          .then(result => {
            res.send(`สร้างบัญชีเรียบร้อยแล้ว <a href="/admin/blogs">Home</a>`)
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

      res.render('login', {
        register_error: allErr,
        old_data: req.body
      })
    }
  }
)

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
    // console.log(validation_result);
    if (validation_result.isEmpty()) {
      Blogs.execute("SELECT * FROM users WHERE username = ?", [username])
        .then(([rows]) => {
          bcrypt.compare(password, rows[0].password).then(compare_result => {
            if (compare_result == true) {
              req.session.isLoggedIn = true;
              req.session.id = rows[0].id;
              res.redirect('/admin/blogs');
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

//logout
router.get('/logout', (req, res) => {
  req.session = null
  res.redirect('/')
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
          res.render("blogs/index", { data: "3BB ระบบหลังบ้าน", bg: bg, blogs: blogResult, promo: promoResult, packages: packResult, isLoggedIn: "admin" });
        })
      })
      // 
    }).catch((err) => {
      if (err) throw err;
    })
});

//profile page
router.get('/profile', ifNotLoggedIn, function (req, res, next) {
  const id = req.session.id
  Blogs.execute('SELECT * FROM usersinfo WHERE id=? LIMIT 1', [id])
    .then((blog) => {
      res.render("blogs/profile", { blogs: blog[0] });
    }).catch((err) => {
      if (err) throw err;
    })

});

router.get('/profile/add/', ifNotLoggedIn, function (req, res, next) {
  res.render("blogs/addProfile");
});

router.get('/add', ifNotLoggedIn, function (req, res, next) {
  res.render("blogs/addForm", { data: "3BB เพิ่มข้อมูล" });
});

// ADD Profile INFO 
router.post('/profileadd', upload.single('line_qrcode'), (req, res, next) => {
  const id = req.session.id
  const line_qrcode = req.file.filename
  const { emp_id, firstName, lastName, email, telNum, line_url, area, province, address } = req.body
  Blogs.execute("INSERT INTO usersinfo (id,emp_id,firstName,lastName,email,telNum,line_url,line_qrcode,area,province,address) \
  VALUES (?,?,?,?,?,?,?,?,?,?,?)", [id, emp_id, firstName, lastName, email, telNum, line_url, line_qrcode, area, province, address]
  )
    .then(
      res.redirect('/admin/profile'))
    .catch((err) => {
      if (err) throw err;
    })
})

// Render EditProfile Page
router.get('/profile/edit?:id', ifNotLoggedIn, function (req, res, next) {
  const id = req.session.id
  Blogs.execute('SELECT * FROM usersinfo WHERE id=? ', [id])
    .then((blog) => {
      res.render("blogs/editProfile", { blogs: blog[0] });
    }).catch((err) => {
      if (err) throw err;
    })

});

router.post('/profile/update', upload.single('line_qrcode'), (req, res, next) => {
  const id = req.session.id
  const { emp_id, firstName, lastName, email, telNum, line_url, area, province, address } = req.body
  if (req.file != null) {
    line_qrcode = req.file.filename
    const path = './public/images/' + req.session.id + '/qrcode/' + req.body.line_qrcodePrev
    fs.remove(path, (err) => {
      if (err) throw err;
    })
  } else {
    line_qrcode = req.body.line_qrcodePrev
  }
  Blogs.execute("UPDATE usersinfo SET emp_id = ?, firstName = ?, lastName = ?, email = ?, telNum = ?, line_url = ?, line_qrcode = ?, area = ?, province = ?, address = ? \
    WHERE id = ?", [emp_id, firstName, lastName, email, telNum, line_url, line_qrcode, area, province, address, id])
    .then(
      res.redirect('/admin/profile')
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
    console.log(cardinfo);
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
        fs.remove(path, (err) => {
          if (err) throw err;
        })
      }
    }
  } else {
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
  console.log(req.body);
  console.log(req.files);
  Blogs.execute("DELETE FROM packages WHERE id = ?", [id])
  const index = req.body.package.length
  for (i = 1; i <= index; i++) {
    packageName = req.body.package[i - 1].name
    packagePrice = req.body.package[i - 1].price
    packageDesc = req.body.package[i - 1].desc

    if (typeof req.files['packageImg' + i] !== 'undefined') {
      if (req.files === 'packageImg' + i != null) {
        // console.log('new image'+i,req.files['packageImg'+i][0].filename);
        packageImg = req.files['packageImg' + i][0].filename
        if (req.body.package[i - 1].packageImgPrev != null) {
          const path = './public/images/' + req.session.id + '/packages/' + req.body.package[i - 1].packageImgPrev
          fs.remove(path, (err) => {
            if (err) throw err;
          })
        }
      } else { if (err) throw err; }
    } else {
      // console.log("Prev Pic with no new img",i,"= ",req.body.package[i-1].packageImgPrev); 
      packageImg = req.body.package[i - 1].packageImgPrev
    }
    // console.log('image upload: ',packageImg);
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
  // console.log(req.params);
  // console.log(req);
  Blogs.execute('SELECT packageImg FROM packages WHERE packageNo = ? AND id= ?', [packageNo, id])
    .then((img) => {
      var imgName = img[0][0].packageImg
      // console.log(imgName);
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

module.exports = router;
