export const enum LocalStorageKey {
  Auth = "auth",
}

export const enum ApiRouteKey {
  SignIn = "/oauth",
  SignOut = "/oauth/signout",
  Me = "/oauth/me",
  Student = "/students",
}

export const enum ClientRouteKey {
  Home = "/",
  Plan = "/plan",
  Profile = "/profile",
  ProfileSettings = "/profile/settings",
  Login = "/login",
  OAuth = "/cmuOAuthCallback",
}

export const enum AuthKey {
  UserAuth = "user-auth",
  AdminAuth = "admin-auth",
}