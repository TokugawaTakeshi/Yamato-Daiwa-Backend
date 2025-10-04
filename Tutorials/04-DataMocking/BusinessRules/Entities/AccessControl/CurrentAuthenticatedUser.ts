import type User from "./User";


type CurrentAuthenticatedUser = Pick<
  User,
  "emailAddress" |
  "displayingName" |
  "authorityRole"
>;


export default CurrentAuthenticatedUser;
