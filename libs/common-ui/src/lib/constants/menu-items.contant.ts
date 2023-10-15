/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { HeaderMenuItems } from '../interfaces/header-menu-items.interface';

export const menuItems: HeaderMenuItems = {
  dropdowns: [
    {
      title: 'Личный кабинет',
      links: [
        { text: 'Карточки QR', href: 'https://dev37.qxyz.ru/lk/?subsys=QR' },
        { text: 'QR-Генератор', href: 'https://dev37.qxyz.ru/gen/' },
        {
          text: 'CMS Управление Файлами',
          href: 'https://dev37.qxyz.ru/apps/cmsv1/explorer/',
        },
        {
          text: 'QTIS Администрирование Системы',
          href: 'https://dev37.qxyz.ru/lk/qtis.jsp',
        },
      ],
    },
    {
      title: 'QR.qxyz',
      links: [
        { text: 'Локальный сервис портала', href: 'https://dev37.qxyz.ru/qr/' },
        { text: 'Внешний сервис', href: 'http://qr.qxyz.ru/' },
        { text: 'QR-Генератор', href: 'https://dev37.qxyz.ru/gen/' },
        { text: 'Диапазоны', href: 'https://dev37.qxyz.ru/ranges/' },
        { text: 'Участники системы', href: 'https://dev37.qxyz.ru/members/' },
        {
          text: 'Образец QR карточки',
          href: 'https://dev37.qxyz.ru/examples/qr/',
        },
      ],
    },
  ],
  rest: [
    { text: 'Карта', href: 'https://dev37.qxyz.ru/sitemap/' },
    { text: 'Справка', href: 'https://dev37.qxyz.ru/help/' },
  ],
};
