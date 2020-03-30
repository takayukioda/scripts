const Octokit = require('@octokit/rest');
const { addDays, format, parseISO } = require('date-fns');

const octokit = Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: 'github-tools',
});

const sleep = (msec = 1000) => new Promise((resolve) => {
  setTimeout(resolve, msec)
});

/**
 * Create a list of sprint base milestones.
 *
 * @param {Date} from - Date to start; this date won't be included in milestone.
 * @param {number} initial - Initial index number for milestone
 * @param {number} count - Number of count to create milestone.
 * @param {number} interval - Number of days for each milestone.
 *
 * @returns {Array.<{title: string, due_on: Date}>} List of milestones with title and due.
 */
const createMilestoneList = (from, initial, count, interval) => {
  if (typeof from === "string") {
    from = parseISO(from);
  }

  let due = from;
  const milestones = [];
  
  for (let i = 0; i < count; i++) {
    due = addDays(due, interval);
    milestones.push({
      title: `Sprint ${initial + i}`,
      due_on: format(due, "yyyy-MM-dd'T'HH:mm:ssX"),
    });
  }
  return milestones;
}

const createMilestones = async (from, initial = 1, count = 12, interval = 7) => {
  const list = createMilestoneList(from, initial, count, interval);

  for (count = list.length; count > 0; count--) {
    console.log('Start making a milestone for', list[count - 1]);
    await octokit.issues.createMilestone({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      ...list[count - 1],
    });
    await sleep();
  }
}

(async () => {
  createMilestones('2020-06-19T10:00:00Z', 62);
})();
