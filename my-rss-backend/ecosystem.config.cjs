module.exports = {
    apps: [{
        name: "my-rss-backend",
        script: "./dist/server.js",
        env: {
            NODE_ENV: "production",
        },
        max_memory_restart: '200M',
        merge_logs: true,
    }]
}