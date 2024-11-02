import type User from "@Entities/AccessControl/User";


type CurrentAuthenticatedUser = Pick<
  User,
  "emailAddress" |
  "displayingName" |
  "authorityRole"
>;


export default CurrentAuthenticatedUser;
