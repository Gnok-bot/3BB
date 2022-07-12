var express = require('express');
var router = express.Router();
const Blogs = require('../models/blogs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/1',function(req, res, next) {
  const id = 1
  Blogs.execute("SELECT * FROM blogs b, usersinfo u WHERE b.id = u.id AND b.id = ?", [id])
    .then((result) => {
      blogResult = result[0]
      blogResult == ''? bg = 'bg5.jpg' : bg = result[0][0].img_header
      Blogs.execute("SELECT * FROM promotion p WHERE p.id = ?", [id]).then((result) => {
        promoResult = result[0]
        Blogs.execute("SELECT * FROM packages p WHERE p.id = ?", [id]).then((result) => {
          packResult = result[0]
          res.render("blogs/index", { data: "3BB ADS PAGE",bg: bg, blogs: blogResult, promo: promoResult, packages: packResult });
        })
      })
    }).catch((err) => {
      if (err) throw err;
    })
});

router.get('/2', function(req, res, next) {
  const id = 2
  Blogs.execute("SELECT * FROM blogs b, usersinfo u WHERE b.id = u.id AND b.id = ?", [id])
  .then((result) => {
    blogResult = result[0]
    blogResult == ''? bg = 'bg5.jpg' : bg = result[0][0].img_header
    Blogs.execute("SELECT * FROM promotion p WHERE p.id = ?", [id]).then((result) => {
      promoResult = result[0]
      Blogs.execute("SELECT * FROM packages p WHERE p.id = ?", [id]).then((result) => {
        packResult = result[0]
        res.render("blogs/index", { data: "3BB ADS PAGE",bg: bg, blogs: blogResult, promo: promoResult, packages: packResult });
      })
    })
  }).catch((err) => {
    if (err) throw err;
  })
});

module.exports = router;