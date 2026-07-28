// import { pinoHttp } from 'pino-http';

// export const httpLogger = pinoHttp({
//   level: 'info',
//   redact: {
//     paths: ['req.headers.authorization', 'req.headers.cookie'],
//     censor: '[Redacted]',
//   },
//   serializers: {
//     req(req) {
//       return { method: req.method, url: req.url };
//     },
//     res(res) {
//       return { statusCode: res.statusCode };
//     },
//   },
//   transport: {
//     target: 'pino-pretty',
//     options: {
//       colorize: true,
//       translateTime: 'HH:MM:ss',
//       ignore: 'pid,hostname,req,res,responseTime',
//       messageFormat:
//         '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
//       hideObject: true,
//     },
//   },
// });
import { pinoHttp } from 'pino-http';

export const httpLogger = pinoHttp({
  level: 'info',
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie'],
    censor: '[Redacted]',
  },
  serializers: {
    req(req) {
      return { method: req.method, url: req.url };
    },
    res(res) {
      return { statusCode: res.statusCode };
    },
  },
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname,req,res,responseTime',
            messageFormat:
              '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
          },
        }
      : undefined,
});
