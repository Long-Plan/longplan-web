export const enum LocalStorageKey {
	Auth = "auth",
}

export const enum ApiRouteKey {
	SignIn = "/oauth",
	SignOut = "/oauth/signout",
	Me = "/oauth/me",
	Major = "/majors",
	Curriculum = "/curricula",
	CurriculaByMajorID = "/curricula/major",
	Category = "/categories",
	CategoryType = "/categories/types",
	Student = "/students",
	StudentTerm = "/students/term",
	StudentMajor = "/students/major",
	StudentCurriculum = "/students/curriculum",
	StudentCurricula = "/student-curricula",
	StudentCurriculaByStudent = "/student-curricula/student",
	EnrolledCourse = "/enrolled-courses",
	CourseDetail = "/course-details",
}

export const enum ClientRouteKey {
	Home = "/",
	Login = "/login",
	OAuth = "/cmuOAuthCallback",
	Profile = "/profile",
}

export const enum AuthKey {
	UserAuth = "user-auth",
	AdminAuth = "admin-auth",
}
