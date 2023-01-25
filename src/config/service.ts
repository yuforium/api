export default () => ({
	id:   process.env.SERVICE_ID,
	name: process.env.SERVICE_NAME,
	sslToPlainIds: true,
	resourcePaths: {
		user: 'users',
		userActivity: 'users/:username/activities',
		userObject: 'users/:username/posts'
	}
});