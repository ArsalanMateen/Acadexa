"use strict";

const getUniqueErrorMessage = (err) => {
  try {
    let fieldName = "";

    if (err.keyPattern) {
      fieldName = Object.keys(err.keyPattern)[0];
    } else if (err.keyValue) {
      fieldName = Object.keys(err.keyValue)[0];
    } else if (err.message) {
      if (err.message.includes("email")) {
        fieldName = "email";
      } else {
        const matches = err.message.match(/index:\s+([a-zA-Z0-9_]+)_1/);

        if (matches && matches[1]) {
          fieldName = matches[1];
        }
      }
    }

    if (fieldName === "email") {
      return "An account with this email address already exists. Please sign in or use a different email.";
    }

    if (fieldName) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} already exists. Please choose another.`;
    }
  } catch {}

  return "An account with this information already exists. Please sign in or use a different email.";
};

const getErrorMessage = (err) => {
  let message = "";

  if (!err) {
    return "An unexpected error occurred. Please try again.";
  }

  if (err.code === 11000 || err.code === 11001) {
    return getUniqueErrorMessage(err);
  }

  if (err.errors) {
    for (let errName in err.errors) {
      if (err.errors[errName] && err.errors[errName].message) {
        message = err.errors[errName].message;
        break;
      }
    }
  } else if (err.message) {
    message = err.message;
  }

  if (!message || message === "Something went wrong") {
    message = "An unexpected error occurred. Please try again.";
  }

  return message;
};

export default { getErrorMessage };
