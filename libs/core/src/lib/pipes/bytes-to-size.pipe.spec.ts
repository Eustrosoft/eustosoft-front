import { BytesToSizePipe } from './bytes-to-size.pipe';

describe('BytesToSizePipe', () => {
  it('create an instance', () => {
    const pipe = new BytesToSizePipe();
    expect(pipe).toBeTruthy();
  });
});
