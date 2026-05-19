module.exports = {
  apps: [{
    name: 'metastrip',
    script: 'server/index.js',
    env: {
      PORT: 4001,
      NODE_ENV: 'production'
    }
  }]
}
