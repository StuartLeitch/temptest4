# Code Review

## Motivation

We perform code reviews (`CR`s) in order to improve code quality and benefit from positive effects on team and company culture.

For example:

* **Committers are motivated** by the notion of a set of reviewers who will look over the change request: the committer tends to clean up loose ends, consolidate TODOs, and generally improve the commit. Recognition of coding expertise through peers is a source of pride for many programmers.
* **Sharing knowledge** helps development teams in several ways:
  * A CR explicitly communicates added/altered/removed functionality to team members who can subsequently build on the work done.
  * The committer may use a technique or algorithm that reviewers can learn from. More generally, code reviews help raise the quality bar across the organization.
  * Reviewers may possess knowledge about programming techniques or the code base that can help improve or consolidate the change; for example, someone else may be concurrently working on a similar feature or fix.
  * Positive interaction and communication strengthens social bonds between team members.
* **Consistency** in a code base makes code easier to read and understand, helps prevent bugs, and facilitates collaboration between regular and migratory developer species.
* **Legibility** of code fragments is hard to judge for the author whose brain child it is, and easy to judge for a reviewer who does not have the full context. Legible code is more reusable, bug-free, and future-proof.
* **Accidental errors** (e.g., typos) as well as **structural errors** (e.g., dead code, logic or algorithm bugs, performance or architecture concerns) are often much easier to spot for critical reviewers with an outside perspective. Studies have found that even short and informal code reviews have significant impact on code quality and bug frequency.
* **Compliance** and regulatory environments often demand reviews. CRs are a great way to avoid common security traps. If your feature or environment has significant security requirements it will benefit from (and probably require) review by your local security curmudgeons (OWASP’s guide is a good example of the process).

## Why, what, and when to do code reviews

### What to review

_Code reviews are classless: being the most senior person on the team does not imply that your code does not need review_.

Even if, in the rare case, code is flawless, the review provides an opportunity for mentorship and collaboration, and, minimally, diversifies the understanding of code in the code base.

### When to review

Code reviews should happen after automated checks (tests, style, other CI) have completed successfully, but before the code merges to the repository's mainline branch.

## Preparing code for review

It is the author’s responsibility to submit CRs that are easy to review in order not to waste reviewers' time and motivation:

* **Scope and size**. Changes should have a narrow, well-defined, self-contained scope that they cover exhaustively. For example, a change may implement a new feature or fix a bug. Shorter changes are preferred over longer ones. If a CR makes substantive changes to more than ~5 files, or took longer than 1–2 days to write, or would take more than 20 minutes to review, consider splitting it into multiple self-contained CRs. For example, a developer can submit one change that defines the API for a new feature in terms of interfaces and documentation, and a second change that adds implementations for those interfaces.
* Only submit **complete**, **self-reviewed** (by diff), and **self-tested** CRs. In order to save reviewers' time, test the submitted changes (i.e., run the test suite) and make sure they pass all builds as well as all tests and code quality checks, both locally and on the CI servers, before assigning reviewers.
* **Refactoring changes** should not alter behavior; conversely, a behavior-changing changes should avoid refactoring and code formatting changes. There are multiple good reasons for this:
  * Refactoring changes often touch many lines and files and will consequently be reviewed with less attention. Unintended behavior changes can leak into the code base without anyone noticing.
  * Large refactoring changes break cherry-picking, rebasing, and other source control magic. It is very onerous to undo a behavior change that was introduced as part of a repository-wide refactoring commit.
  * Expensive human review time should be spent on the program logic rather than style, syntax, or formatting debates. We prefer settling those with automated tooling like CheckStyle, TSLint, Baseline, Prettier, etc.

## Commit messages

The following is an example of a good commit message following a widely quoted standard:

```text
Capitalized, short (80 chars or less) summary

More detailed explanatory text, if necessary. Wrap it to about 120 characters or so. In some contexts, the first line is treated as the subject of an email and the rest of the text as the body. The blank line separating the summary from the body is critical (unless you omit the body entirely); tools like rebase can get confused if you run the two together.

Write your commit message in the imperative: "Fix bug" and not "Fixed bug" or "Fixes bug."
This convention matches up with commit messages generated by commands like `git merge` and `git revert`.

Further paragraphs come after blank lines.

- Bullet points are okay, too
```

## Finding reviewers

It is customary for the committer to propose one or two reviewers who are familiar with the code base. Often, one of the reviewers is the project lead or a senior engineer.

Project owners should consider subscribing to their projects in order to get notified of new CRs.

Code reviews among more than three parties are often unproductive or even counter-productive since different reviewers may propose contradictory changes. This may indicate fundamental disagreement on the correct implementation and should be resolved outside a code review in a higher-bandwidth forum, for example in person or in a video conference with all involved parties.

## Performing code reviews

## Code review examples
