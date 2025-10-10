/**
 * Function to validate signup form
 * @param {*} username
 * @param {*} email
 * @param {*} password
 * @param {*} confirmPassword
 * @returns
 */
const signupFormValidation = (username, email, password, confirmPassword) => {
  if (!(username && email && password && confirmPassword)) {
    return "No Empty values";
  }

  if (!/^[A-Za-z]+$/.test(username)) {
    return "Invalid username";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Invalid email format";
  }

  if (
    !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(
      password
    )
  ) {
    return "Invalid password";
  }

  if (password != confirmPassword) {
    return "Password Does not match";
  }
};

module.exports = signupFormValidation;
