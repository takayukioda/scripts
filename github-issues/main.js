const fs = require('fs');
const yaml = require('js-yaml');
const Octokit = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const identity = (v) => v;

const msleep = (msec) => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, msec);
};


(async () => {
  const filename = process.argv[2] || 'issues.yaml'
  const issues = yaml.safeLoad(fs.readFileSync(filename, 'utf-8'));


  Promise.all(issues.map(async (issue) => {
    try {
      if (!issue || !issue.title) {
        return {}
      }

      return await octokit.issues.create({
        owner: issue.owner || 'takayukioda',
        repo: issue.repo || 'scripts',
        title: issue.title,
        body: issue.body,
        labels: (issue.labels && issue.labels.length > 0) ? issue.labels : undefined,
      });
    } catch (err) {
      console.log(`Failed to create issue: ${issue.title}`);
      console.log(err.message);
      console.log(err.status);
      console.log(`${err.request.method} ${err.request.url}`);
    } finally {
      return {}
    }
  }));
})();

