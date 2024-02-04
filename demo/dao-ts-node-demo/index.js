/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Fs, QSystem } from '@eustrosoft-front/dao-ts';

const fs = new Fs();
const qSys = new QSystem();

console.log(fs.whoAmI());

// TODO Fix AxiosError: unable to verify the first certificate.
//  Fix certificates (provide guide how to set up certs on local node)
//  or
//  make stub like in DispatchServiceStub

qSys
  .login()
  .then((v) => {
    console.log('login()', v.data);
  })
  .then(() =>
    qSys.ping().then((v) => {
      console.log('ping()', v.data);
    }),
  );
