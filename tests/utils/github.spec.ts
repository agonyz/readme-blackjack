import { GitHub } from '@actions/github/lib/utils';
import { Context } from '@actions/github/lib/context';
import { closeTicket } from '../../src/utils/github';

// mock GitHub client
jest.mock('@actions/github/lib/utils');
const mockOctokit = {
  rest: {
    issues: {
      update: jest.fn(),
    },
  },
} as unknown as jest.Mocked<InstanceType<typeof GitHub>>;

const owner = 'agonyz';
const repo = 'readme-blackjack';
const issueNumber = 1;

// mock context
const mockContext = {
  repo: {
    owner: owner,
    repo: repo,
  },
  payload: {
    issue: {
      number: issueNumber,
    },
  },
} as unknown as Context;

describe('closeTicket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call octokit.rest.issues.update with correct parameters', async () => {
    await closeTicket(mockOctokit, mockContext);

    expect(mockOctokit.rest.issues.update).toHaveBeenCalledWith({
      owner: owner,
      repo: repo,
      issue_number: issueNumber,
      state: 'closed',
    });
  });
});
