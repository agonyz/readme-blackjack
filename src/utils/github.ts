import { GitHub } from '@actions/github/lib/utils';
import { Context } from '@actions/github/lib/context';

export const closeTicket = async (
  octokit: InstanceType<typeof GitHub>,
  context: Context,
) => {
  await octokit.rest.issues.update({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.issue!.number,
    state: 'closed',
  });
};

export const getActor = () => {
  return process.env.GITHUB_ACTOR ?? 'Player';
};
