var express = require('express'),
    http = require('http');
    bodyParser = require('body-parser'),
    proxy = require('express-http-proxy'),
    urlHelper = require('url');
const latexService = require('./latexService.js')
// const objectCategoryDefResponse = require('./object-cat-def-mock'); // Import the JSON object


// ENV Variables
const BASE_URL = 'https://dev-middleware.prathamdigital.org';
const API_AUTH_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJPc3NtSUhXaW1NMDN2MUxsVnFvNHBqaS0ydEMwTGhLY0o5dmtwQTlJZV9zIn0.eyJleHAiOjE3ODQ5ODExMDQsImlhdCI6MTc4NDg5NDcwNCwianRpIjoiNzA2MTZhZjMtMmUzYS00MWQ5LWI3NzQtZjRkMDJhNjM5NGZiIiwiaXNzIjoiaHR0cHM6Ly9kZXYtbG1wLnByYXRoYW1kaWdpdGFsLm9yZy9hdXRoL3JlYWxtcy9wcmF0aGFtIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImJmNWNhYjUxLTY0ZDAtNDA2Zi1hMDYyLTQyOWM4YTAyODBjYSIsInR5cCI6IkJlYXJlciIsImF6cCI6InByYXRoYW0iLCJzZXNzaW9uX3N0YXRlIjoiM2I2ZDI2MTgtNzdhZi00OTRhLThhOGItMDBmYjNmYmIzNjc0IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtcHJhdGhhbSJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSBwcmF0aGFtLXJvbGUiLCJzaWQiOiIzYjZkMjYxOC03N2FmLTQ5NGEtOGE4Yi0wMGZiM2ZiYjM2NzQiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJDZW50cmFsIExlYWQgU0NQIiwicHJlZmVycmVkX3VzZXJuYW1lIjoic2NwLWNlbnRyYWwtbGVhZCIsInVzZXJfcm9sZXMiOiJDZW50cmFsIExlYWQiLCJnaXZlbl9uYW1lIjoiQ2VudHJhbCBMZWFkIiwiZmFtaWx5X25hbWUiOiJTQ1AiLCJlbWFpbCI6InNjcF9jbEB5b3BtYWlsLmNvbSJ9.pB_hnpzu_tey8gFhLve4a86vlCF9rGttDFpbyJO6wKDL2AkQssGkcq2K3PvHVYQZwdYs8xYIElMO06_iv9QSjGGX72Usx2KpdJz_Hl9u1QO67xygwv2fdRSmMRF60G68ICRxIEksQhl1Yfz9PeXzrKjN31U_fdUcwqsZZ_0lM-VWGaYC09cPfpL4cFt3Y1lV2ygsP3nisuL3EDZKaC18Rkzdj0y8mg_Ux-LrCCHZbcHkSh-nwV5u6HOqh-XaZPQcFMhl1xVKgCDExSzEJC4Lz8d627gPwqjUlpQpuIYYM5DbYmbbtAWlxaeeooMRarkuaHjSlVRtHghs6MoVZa9CjQ";
const TENANT_ID = "ef99949b-7f3a-4a5f-806a-e67e683e38f3";


var app = express();
app.set('port', 3000);
app.use(express.json())
app.get("/latex/convert", latexService.convert)
app.post("/latex/convert", bodyParser.json({ limit: '1mb' }), latexService.convert);

/*
app.all('/action/object/category/definition/v1/*', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(objectCategoryDefResponse); // Send the imported JSON object
});
*/

app.post('/action/data/v3/telemetry', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send({response: "mock response"}); // Send the imported JSON object
});


app.all(['/api/framework/v1/read/*',
     '/learner/framework/v1/read/*', 
     '/api/channel/v1/read/*',
     '/action/object/category/definition/v1/*',
    ], proxy(BASE_URL, {
    https: true,
    proxyReqPathResolver: function(req) {
        console.log('proxyReqPathResolver ',  urlHelper.parse(req.url).path);
        return urlHelper.parse(req.url).path;
    },
    proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
        console.log('proxyReqOptDecorator 2')
        // you can update headers
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['user-id'] = 'content-editor';
        proxyReqOpts.headers['authorization'] = `Bearer ${API_AUTH_TOKEN}`;
        proxyReqOpts.headers['tenantId'] = TENANT_ID;
        return proxyReqOpts;
    }
}));
app.use(['/action/questionset/v1/*',
    '/action/question/v1/*',
    '/action/collection/v1/*',
    '/action/collection/v1/*',
    // '/action/content/v3/hierarchy/*'
    ], proxy(BASE_URL, {
    https: true,
    limit: '30mb',
    proxyReqPathResolver: function (req) {
        let originalUrl = req.originalUrl.replace('/action/', '/api/')
        console.log('proxyReqPathResolver questionset', originalUrl, require('url').parse(originalUrl).path);
        return require('url').parse(originalUrl).path;
    },
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        console.log('proxyReqOptDecorator 3')
        // you can update headers
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['authorization'] = `Bearer ${API_AUTH_TOKEN}`;
        proxyReqOpts.headers['tenantId'] = TENANT_ID;
         return proxyReqOpts;
    }
}));

app.use(['/action/program/v1/*',
    '/action/question/v1/bulkUpload',
    '/action/question/v1/bulkUploadStatus'
    ], proxy(BASE_URL, {
    https: true,
    limit: '30mb',
    proxyReqPathResolver: function (req) {
        let originalUrl = req.originalUrl.replace('/action/', '/api/')
        console.log('proxyReqPathResolver questionset', originalUrl, require('url').parse(originalUrl).path);
        return require('url').parse(originalUrl).path;
    },
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        console.log('proxyReqOptDecorator 3')
        // you can update headers
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['authorization'] = `Bearer ${API_AUTH_TOKEN}`;
        proxyReqOpts.headers['tenantId'] = TENANT_ID;
         return proxyReqOpts;
    }
}));

app.use(['/api','/assets','/action'], proxy(BASE_URL, {
    https: true,
    limit: '30mb',
    proxyReqPathResolver: function(req) {
        console.log('proxyReqPathResolver ',  urlHelper.parse(req.url).path);
        return urlHelper.parse(req.url).path;
    },
    proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
        console.log('proxyReqOptDecorator 4')
        // you can update headers
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['tenantId'] = TENANT_ID;
        proxyReqOpts.headers['authorization'] = `Bearer ${API_AUTH_TOKEN}`;
        return proxyReqOpts;
    }
}));

app.use(['/action/content/*'], proxy(BASE_URL, {
    https: true,
    proxyReqPathResolver: function (req) {
        let originalUrl = req.originalUrl.replace('/api/', '/api/')
        console.log('proxyReqPathResolver questionset', originalUrl, require('url').parse(originalUrl).path);
        return require('url').parse(originalUrl).path;
    },
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        console.log('proxyReqOptDecorator 1')
        // you can update headers
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['tenantId'] = TENANT_ID;
        proxyReqOpts.headers['authorization'] = `Bearer ${API_AUTH_TOKEN}`;
        return proxyReqOpts;
    }
}));

app.use(['/content/preview/*', '/content-plugins/*', '/assets/public/*'], proxy(BASE_URL, {
    https: true,
    proxyReqPathResolver: function(req) {
        return require('url').parse(`https://${BASE_URL}` + req.originalUrl).path
    },
    proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
        console.log('proxyReqOptDecorator 5')
        // you can update headers 
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['user-id'] = 'content-editor';
        proxyReqOpts.headers['authorization'] = `Bearer ${API_AUTH_TOKEN}`;
        proxyReqOpts.headers['tenantId'] = TENANT_ID;
        return proxyReqOpts;
    }
}));
http.createServer(app).listen(app.get('port'), 3000);