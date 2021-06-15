module.exports = function checkpassword(pwd) {
  const password = pwd;

  const num = password.search(/[0-9]/g);
  const eng = password.search(/[a-z]/gi);
  const spe = password.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);

  if (password.length < 8 || password.length > 20) {
    return 1;
  }

  if (password.search(/₩s/) != -1) {
    return 2;
  }
  if (num < 0 || eng < 0 || spe < 0) {
    return 3;
  }

  return 0;
};
