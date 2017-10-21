const pollKinesis = require('../pollKinesis');

describe('pollKinesis', () => {
  it('passes', () => {
    pollKinesis();
    expect(true).to.eql(true);
  });
});
