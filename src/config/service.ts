export default () => ({
	id:   process.env.SERVICE_ID,
	name: process.env.SERVICE_NAME,
	resourcePaths: {
		user: 'users',
		userActivity: 'users/:username/activities',
		userObject: 'users/:username/posts'
	}
});