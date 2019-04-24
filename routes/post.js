const express = require('express');
const multer = require('multer');
const path = require('path');
const {Post , Hashtag} = require('../models');
const router = express.Router();

const upload = multer({
  storage:multer.diskStorage({
    destination(req, file, cb){
      cb(null, 'uploads/')
    },
    filename(req, file, cb){
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname,ext)+new Date().valueOf() + ext);
    }
  }),
  limit:{fileSize: 5 * 1024 * 1024},
})

router.post('/img', upload.single('img'), ( req, res) =>{
  console.log(req.body, req.file);
  res.json({url:`/img/${req.file.filename}`});
});

const upload2 =multer();
router.post('/', upload2.none(),async (req, res, next)=>{
  try{
    const post = await Post.create({
      content : req.body.content,
      img : req.body.url,
      userId :req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s]*/g);
    if(hashtags){
      await Promise.all(hashtags.map(tag=>{
        Hashtag.findOrCreate({
          where:{
            title:tag.slice(1).toLowerCase()
          },
        })
      }))
    }
    res.redirect('/');
  }catch(error){
    console.log(error);
    next(error);
  }
});

module.exports = router;
