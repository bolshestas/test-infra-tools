const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');

const {
    metricsMiddleware,
    metricsHandler,
} = require('../src/metrics');

test('records an HTTP request metric when response finishes', async () => {
    const req = {
        path: '/test-endpoint',
        method: 'GET',
        baseUrl: '',
        route: {
            path: '/test-endpoint',
        },
    };

    const res = new EventEmitter();
    res.statusCode = 204;

    let nextCalled = false;

    metricsMiddleware(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, true);

    res.emit('finish');

    let metricsOutput = '';

    const metricsRes = {
        set() {},
        end(body) {
            metricsOutput = body;
        },
    };

    await metricsHandler({}, metricsRes);

    assert.match(
        metricsOutput,
        /todo_http_requests_total\{method="GET",route="\/test-endpoint",status_code="204"\} 1/
    );
});
