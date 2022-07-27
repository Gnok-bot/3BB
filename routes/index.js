var express = require('express');
var router = express.Router();
const Blogs = require('../models/blogs');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index');
// });

router.get('/:id', function(req, res, next) {
  const id = req.params.id
  Blogs.execute("SELECT * FROM blogs b, usersinfo u WHERE b.id = u.id AND u.emp_id = ?", [id])
  .then((result) => {
    if(result[0].length > 0){
    blogResult = result[0]
    const u_id = result[0][0].id
    text_header = blogResult[0].text_header
    blogResult == ''? bg = 'bg5.jpg' : bg = result[0][0].img_header
    Blogs.execute("SELECT * FROM promotion WHERE id = ?", [u_id]).then((result) => {
      promoResult = result[0]
      Blogs.execute("SELECT * FROM packages WHERE id = ?", [u_id]).then((result) => {
        packResult = result[0]
        Blogs.execute("SELECT * FROM google_tag WHERE id = ?",[u_id]).then((result) =>{
          tagResult = result[0]
          res.render("blogs/index", { data: text_header,bg: bg, blogs: blogResult, promo: promoResult, packages: packResult, tag: tagResult });
        }).catch((err) => {if (err) throw err;})
      }).catch((err) => {if (err) throw err;})
    }).catch((err) => {if (err) throw err;})
  } else{
    res.status(404).send('<h1>Error 404: Page Not Found</h1>')
  }
  }).catch((err) => {if (err) throw err;})
});

module.exports = router;