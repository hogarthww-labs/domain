module.exports = {
  displayName: 'domain-e2e',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/e2edomain-e2e',
  testSequencer: './test-sequencer.js',
  maxWorkers: 1,
  setupFilesAfterEnv: ['./jest.setup.ts'],
};
