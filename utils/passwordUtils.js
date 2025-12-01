import bcrypt from "bcrypt";

//function to convert plain password to hashed password
const passwordHasher = (plainPassword) => {
  let saltRounds = 12;
  return bcrypt.hash(plainPassword, saltRounds);
};

//function to compare stored hashed password and entered password
const comparePassword = (plainPassword, storedHash) => {
  return bcrypt.compare(plainPassword, storedHash);
};

export { passwordHasher, comparePassword };
