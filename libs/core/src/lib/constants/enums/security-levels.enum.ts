/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

export enum SecurityLevels {
  SYSTEM = '15', // (0F) Системный
  PUBLIC = '31', // (1F) Публичный
  PUBLIC_PLUS = '47', // (2F) Публичный+ (ограниченный)
  CORPORATE = '63', // (3F) Корпоративный (ДСП)
  PRE_SECRET = '64', // (40) Пред-Секретно (ДСП+)
  CONFIDENTIAL = '79', // (4F) Секретно (С)
  SECRET = '95', // (5F) Сов-секретно (СС)
  TOP_SECRET = '111', // (6F) Сов-секретно ОВ (СС-ОВ)
  GOD_USE_ONLY = '127', // (7F) - Только для мертвых (ТДМ)
}
