export const enum LocalStorageKey {
	Auth = "auth",
}

export const enum ApiRouteKey {
	SignIn = "/oauth",
	SignOut = "/oauth/signout",
	Me = "/oauth/me",
	Student = "/students",
	StudentMajor = "/students/major",
	StudentTerm = "/students/term",
	Curricula = "/curricula",
	CurriculaMajor = "/curricula/major",
	EnrolledCourses = "/enrolled-courses",
	CourseDetails = "/course-details",
	CurriculaCourses = "/curricula/courses",
	StudentCurricula = "/student_curricula",
	Majors = "/majors",
	Categories = "/categories",
	CategoriesTypes = "/categories/types",
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
