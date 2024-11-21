const checkAuthorization = (role) => {
  return async (req, res, next) => {
    try {
      if (role.includes(req.loggedUser.role)) {
        next();
      } else {
        return res.json({ msg: "You are not authorize for this route!" });
      }
    } catch (error) {
      res.json({ "Error in Authorization": error.message });
    }
  };
};

module.exports = checkAuthorization;