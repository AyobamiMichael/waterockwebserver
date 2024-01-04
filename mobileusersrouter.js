const express = require('express');
const MobileUser = require('./mobileusersmodel')

const router = express.Router();

router.post('/signup', (req, res) => {

    MobileUser.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      console.log(err);
      res.json(err)
    } else {

      if (user == null) {
        const user = MobileUser({
          email: req.body.email,
          password: req.body.password
        })
        user.save()
          .then((err) => {
            if (err) {
              console.log(err)
              res.json(err)
            } else {
              console.log(user);
              res.json(user);
            }

          })
      } else {

        res.json({
          message: 'email not found'
        })
      }

    }
  })

})

router.post('/signin', (req, res) => {
    MobileUser.findOne({ email: req.body.email, password: req.body.password }, (err, user) => {
    if (err) {
      console.log(err);
      res.json(err)
    } else {
      res.json(user)
    }
  })

})

module.exports = router