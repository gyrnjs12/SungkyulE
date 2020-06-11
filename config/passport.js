// config/passport.js
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; 
var User = require('../models/User');

passport.serializeUser(function(user, done) {   // 로그인시 DB에서 발견한 user를 세션에 저장하는 법 설정
  done(null, user.id);  // id만 저장 첫번째 파라미터는 err를 나타냄 없을땐 null
});
passport.deserializeUser(function(id, done) {   // request 시 세션에서 어떻게 user 객체를 만들지 정함
  User.findOne({_id:id}, function(err, user) {
    done(err, user);
  });
});

// local strategy // 3
passport.use('local-login',
  new LocalStrategy({
      usernameField : 'stdid',
      passwordField : 'password', 
      passReqToCallback : true
    },
    function(req, username, password, done) { // 로그인시 호출 되는 함수 파라미터는 입력 한 아이디, 비번
      User.findOne({stdid:username})    // DB에서 아이디랑 비번찾기
        .select({password:1})
        .exec(function(err, user) {
          if (err) return done(err);

          if (user && user.authenticate(password)){ // 해쉬 비번 비교
            console.log("로그인 성공:", username);
            req.flash('succId',username);
            return done(null, user);
          }
          else {
            req.flash('stdid', username);
            req.flash('errors', {login:'학번이나 비밀번호가 틀렸습니다.'});
            return done(null, false);
          }
        });
    }
  )
);

module.exports = passport;

/*
로그인 버튼이 클릭되면 routes/home.js의 [post] /login route의 코드가 실행됩니다.
다음으로 config/passport.js의 local-strategy의 코드가 실행됩니다.
로그인이 성공하면 config/passport.js의 serialize코드가 실행됩니다.
마지막으로 routes/home.js의 [post] /login route의 successRedirect의 route으로 redirect가 됩니다.
로그인이 된 이후에는 모든 request가 config/passport.js의 deserialize코드를 거치게 됩니다.
*/