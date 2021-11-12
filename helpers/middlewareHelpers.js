const middlewareHelperGenerator = (userDB, fetchUserInformation) => {
	const cookieCheck = (req, res, next) => {
		// const { user_id } = req.cookies;
		const { user_id } = req.session;
		const safeList = ['/', '/login','/register'];
		const isSafe = safeList.includes(req.path);
		// Fetch user information based on the value of the cookie
		const { data, error } = fetchUserInformation(userDB, user_id);

		if (error && !isSafe) {
			console.log(error);
			return res.redirect('/');
		}

		return next();
	};

	return { cookieCheck };
};

module.exports = middlewareHelperGenerator;