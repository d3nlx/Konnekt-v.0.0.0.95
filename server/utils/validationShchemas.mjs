export const createUserValidationSchema = {
  name: {
    notEmpty: {
      errorMessage: "name cannot be empty",
    },
  },
  phonenumber: {
    notEmpty: true,
  },
  displayName: {
    notEmpty: true,
  },
  password: {
    notEmpty: true,
  },
};