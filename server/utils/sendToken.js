// create token and saving that in cookies
const sendToken = (user, statusCode, res, message, billingAccount = null) => {
  const token = user.getJwtToken();

  // Options for cookies
  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    // httpOnly: true, 
    // sameSite: "none",
    // secure: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
    message,
    billingAccount // Include billingAccount in the response
  });
};

module.exports = sendToken;
