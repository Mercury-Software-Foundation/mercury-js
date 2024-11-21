import Mercury from '@mercury-js/core';

const platVersion: TPlatform = { version: '1.0.0' };
export function platform(MercuryCls: typeof Mercury): string {
  const mercury = new MercuryCls();
  return 'platform ' + platVersion.version + ' ' + mercury.run();
}
