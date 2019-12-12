const findUserEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};
// function findUserEmail(obj, emailToSearch) {
//   for (let userId in obj) {
//       if (obj[userId].email === emailToSearch) {
//         return obj[userId];
//     }
//   }
//   return null;
// };

module.exports = { findUserEmail };