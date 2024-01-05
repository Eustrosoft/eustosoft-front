/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

module.exports = {
  '{apps,libs,tools}/**/*.{ts,tsx}': (files) => {
    return `nx affected --target=typecheck --files=${files.join(',')}`;
  },
  '{apps,libs,tools}/**/*.{js,ts,jsx,tsx,json}': [
    (files) =>
      `nx affected:lint --files=${files.join(',')} --exclude='*,*e2e*'`,
    (files) => `nx format:write --files=${files.join(',')} --exclude='*,*e2e*'`,
  ],
};
