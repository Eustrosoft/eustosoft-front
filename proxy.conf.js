/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

/**
 * https://angular.io/guide/build#proxying-to-a-backend-server
 */

// module.exports = [
//   {
//     changeOrigin: true,
//     context: ['/eustrosofthandler_war'],
//     secure: false,
//     target: 'http://fudo.eustrosoft.org:8080/',
//     logLevel: 'error',
//   },
// ];

module.exports = [
  {
    changeOrigin: true,
    context: ['/api'],
    secure: false,
    target: 'https://dev37.qxyz.ru/',
    logLevel: 'debug',
  },
];
