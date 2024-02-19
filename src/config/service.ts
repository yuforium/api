export default () => ({
  service: {
    id: process.env.SERVICE_ID,
    name: process.env.SERVICE_NAME,
    defaultDomain: process.env.DEFAULT_DOMAIN,
    resourcePaths: {
      user: 'users',
      userActivity: 'users/:username/activities',
      userObject: 'users/:username/posts'
    }
  }
});