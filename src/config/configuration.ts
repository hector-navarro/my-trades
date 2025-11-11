export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/trading_diary',
    name: process.env.MONGODB_DB ?? 'trading_diary'
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'secret',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES ?? '900s',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES ?? '7d'
  }
});
