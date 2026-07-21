const client = require('prom-client');

const register = new client.Registry();

client.collectDefaultMetrics({
    register,
    prefix: 'todo_',
});

const httpRequestsTotal = new client.Counter({
    name: 'todo_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

const httpRequestDurationSeconds = new client.Histogram({
    name: 'todo_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.001, 0.002, 0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    registers: [register],
});

function metricsMiddleware(req, res, next) {
    if (req.path === '/metrics') {
        next();
        return;
    }

    const endTimer = httpRequestDurationSeconds.startTimer();

    res.on('finish', () => {
        const route = req.route?.path
            ? `${req.baseUrl || ''}${req.route.path}`
            : 'unmatched';

        const labels = {
            method: req.method,
            route,
            status_code: String(res.statusCode),
        };

        httpRequestsTotal.inc(labels);
        endTimer(labels);
    });

    next();
}

async function metricsHandler(req, res) {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
}

module.exports = {
    metricsMiddleware,
    metricsHandler,
};
