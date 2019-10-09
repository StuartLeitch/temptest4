# Monorepo

## Definition

> Definitions vary but speaking very broadly, a **monorepo** is a project structure that allows you to easily share packages of code within a project and that is sitting in a single repository holding the code of multiple projects which may or may not be related in some way. You develop multiple projects in the same repository. The projects can depend on each other, so they can share code. Very important, when you make a change, you do not rebuild or retest every project in the monorepo. Instead, you only rebuild and retest the projects that can be affected by your change.

Working with multiple applications and libraries is difficult. However,the projects managed in a Monorepo can be dependents of each other (like `React` and the `react-dom` package) or they can be completely unrelated (like the Google search algorithm and `Angular`) respectively only related because both are Google projects.

Monorepos are not in the least incompatible with modular software development practices — quite the opposite — managing code in a single repository can simplify the development process of modular software projects, like micro services based infrastructures, tremendously.

Monolithic source control does not necessarily result in monolithic software. Building modular software using a Monorepo approach is possible.

From Google to Facebook, Uber, Twitter and more, a good amount of large software companies handle this challenge by taking a **monorepo approach**. And they have been doing so for years.

## Types

There are **two** basic types of Monorepos:

* huge repositories containing all the code maintained by a company. One example would be an organization managing the code for their website, their iOS and Android apps and the API which is powering both, in one large repository. Sometimes known as **collocated multirepos**.
* project specific Monorepos like _**Babel**_, _**React**_ or _**Jest**_. Managing the projects core functionality and optional components in one single repository makes it a lot easier to maintain the code and keep everything in sync.

## Drawbacks

* May seem counterintuitive at first
* Onboarding new developers can become harder because they are immediately confronted with a huge codebase instead of discovering smaller codebases one by one.
* Very large scale Monorepos have to deal with technical limitations of certain source control systems.
* Integration of a Monorepo into an existing build process is a difficult process. Building and testing the entire codebase can take a long time when working with a giant Monorepo.

## Benefits

* Splitting up large projects into separate modules can be very useful for code sharing. Code can be easily shared and reused over multiple projects, which can be a problem too if it’s done poorly, but usually it's a good thing to reuse as much code as possible.
* There is **one source of truth**: every employee in a company or every contributor of an open source project is always on the same page. Changes are always reflected throughout the entire repository. It also promotes `unified versioning`.
* Collaboration across teams is easier — bugs which affect different projects, can be fixed by one person or team instead of having to wait on multiple other teams to fix the same bug in their codebase. The monorepo changes the way you interact with other teams such that everything is always integrated.  **If you don't have a monorepo, you're not really doing continuous integration, you’re doing frequent integration at best**.
* Everything at that current commit works together. Changes can be verified across all affected parts of the organization.
* Easy to split code into composable modules, each and every one of them can also be full-stack applications using React, Angular, and NodeJS. These modules can later reuse common infrastructure.
* Easier dependency management between modules in a controlled and explicit way
* One toolchain setup, using _modern tools_ like _**Cypress**_, _**Jest**_, _**Prettier**_, _**TypeScript**_ and others
* Code editors and IDEs are "workspace" aware
* Consistent and effective developer experience and practices, pioneered at Google, Facebook and Microsoft

## Monorepo vs multirepo

If the codebase is not to be found inside a **monorepo**, then most probably the whole codebase is actually a **multirepo**, or sometimes called a **polyrepo**, creating a coordination and visibility problem. It tends to map cleanly to the way we think of teams (especially the way individual contributors think of them): we have responsibility over this component. We work in relative isolation. The boundaries are fixed on my team and the component(s) we work on.

A multirepo, defined as a cumulation of _multiple_ repositories, means _multiple_ of:

* **Dependencies**: if a dependency releases a new major version, you have to manually apply that to all repositories and run the tests.
* Test configuration
* Pull request templates
* Pull requests / labels
* ESLint
* Prettier
* TypeScript configuration
* Deployment and release scripts

There is a lot of overhead associated with maintaining a large amount of small packages in separate repositories. Using a Monorepo approach can help with reducing the amount of repeated boilerplate code that has to be written for things like building and testing your codebase.

Making large scale refactorings across all related packages can be done very quickly if every package is maintained in one single repository, can be done with one commit or one pull request.

By contrast changing an API which affects all packages spread across multiple repositories, means making a separate commit in everyone of those affected repositories, having to touch multiple repositories for doing basically the same change over and over again.

A multirepo solution promotes and enables a constant state of technical debt. There are lots of migrations going on, modules that depend on older versions of other modules, and many, many deprecation policies which may or may not be enforceable.

As recap, **the default behavior of a multirepo is isolation** — that’s the whole point.
**The default behavior of a monorepo is shared responsibility and visibility** — that’s the whole point.

## Challenges

### Trunk-based development

Monorepos and long-lived feature branches do not play together nicely. Chances are we will have to adopt some form of [trunk-based development](https://trunkbaseddevelopment.com/). Transitioning to this style of development can be challenging for some teams, partially because they have to adopt new practices such as feature toggles.
I believe that trunk-based development results in better quality code and higher velocity, regardless of the size of the repo, but it is still something we must take into account.

### Not all services work with it

Since monorepos are not mainstream yet, some services do not work well with them. They might expect a single deployment artifact or a coverage report per repo. Having said that, you can work around most issues.

### Large-scale changes

Monorepos make some large-scale changes a lot simpler: you can refactor ten apps made out of a hundred libs, verify that they all work before committing the change.
But they force you to think through large-scale changes more and make some of them more difficult. For instance, if you change a shared library, you will affect all the applications that depend on it. If it is a breaking change, and it cannot be automated, you will have to make the change in a backward-compatible way. You will have to create two versions of the parameter/method/class/package and help folks move from the old version to the new one.

<!--
## Developer Experience

I see consistency as an integral part of successfully delivering software. Too often have I joined or worked with software teams that had little to no consistency. Unless you consider `Copy & paste` command to be pretty consistent.
It applies to all aspects of development: Code style, comments, tools, onboarding, creation of new services. It also extends to product management, defining and tracking tasks, and generally company processes.

In general, it’s all about code and along the journey we want to do certain things to or with the code. Such as:
* KISS; tools like ESLint can help with that.
* Keep consistent formatting. Prettier is your must-have tool here.
* Run tests.
* Bundle reusable code into packages and deploy them to NPM.
* Build services that leverage the aforementioned packages.
* Give stakeholders a chance to review code in some more or less safe environment, often referred to as “staging”.
* Take that reviewed code and deploy it to where it really matters: 🥁 … the production environment 🎉
-->

## Tools

There are tools which make it easier to manage Monorepos containing multiple packages. Splitting up large codebases into separate independently versioned packages is extremely useful for code sharing. However, making changes across many repositories is messy and difficult to track, and testing across repositories gets complicated really fast.

To solve these (and many other) problems, some projects will organize their codebases into multi-package repositories. Projects like _**Babel**_, _**React**_, _**Angular**_, _**Ember**_, _**Meteor**_, _**Jest**_, and many others develop all of their packages within a single repository

Our code is mainly written in Javascript, which brought me to look at [Lerna](https://lerna.js.org). Lerna is great at managing inter-dependencies and running npm scripts or even arbitrary commands across all packages or subsets thereof.

Other similar tools are:

* [NX](https://nx.dev/react) is a set of extensible dev tools for monorepos, which helps you develop like Google, Facebook, and Microsoft. It has first-class support for many frontend and backend technologies, so its documentation comes in multiple flavours.
* [Bazel](https://bazel.build/) is Google’s monorepo-oriented build system. More on Bazel: [awesome-bazel](https://github.com/jin/awesome-bazel)
* [Yarn](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/) is a JavaScript dependency management tool that supports monorepos through workspaces.

### Lerna

> **Lerna is a tool that optimizes the workflow around managing multi-package repositories with git and npm.**

Lerna can be used to manage Monorepos containing multiple npm packages.

The main idea behind Lerna is that your project has a packages folder, which contains all of your isolated code parts. And besides packages, you have a main app, which for example can live in the src folder. Almost all operations in Lerna work via a simple rule—you iterate through all of your packages, and do some actions over them, e.g., increase package version, update dependency of all packages, build all packages, etc.

With Lerna, you have two options on how to use your packages:

* Without pushing them to remote (NPM)
* Pushing your packages to remote

While using the first approach, you are able to use local references for your packages and basically don’t really care about symlinks to resolve them.

### Basic Setup

As the initial setup can be as simple as:

```sh
monorepo_root_folder
├── packages/
├── lerna.json
└── package.json
```

where `/packages` is a placeholder for our shared packages, or modules.

later it can became more similar to:

```sh
<workspace name>/
├── docs/
├── docker/
├── packages/
│    ├── apps/
│    │   ├── payment-client/
│    │   │   ├── jest.config.js
│    │   │   ├── package.json
│    │   │   ├── public/
│    │   │   ├── src/
│    │   │   │   └── app/
│    │   │   │       ├── bin/
│    │   │   │       ├── docs/
│    │   │   │       ├── src/
│    │   │   │       ├── tsconfig.json
│    │   │   │       └── tslint.json
│    │   │   ├── tsconfig.json
│    │   │   ├── README.md
│    │   │   └── tslint.json
│    │   └── payment-server/
│    ├── components/
│    │       ├── jest.config.js
│    │       ├── package.json
│    │       ├── tsconfig.json
│    │       ├── src/
│    │       │   ├── react/
│    │       │   │   ├── component-a
│    │       │   │   │   ├── component-a.spec.tsx
│    │       │   │   │   ├── component-a.tsx
│    │       │   │   │   ├── index.ts
│    │       │   │   │   ├── component-a.css
│    │       │   │   │   └── component-a.stories.ts
│    │       │   │   └── component-b
│    │       │   ├── angular/
│    │       │   ├── vue/
│    │       │   └── solid/
│    │       ├── setupTests.ts
│    │       └── index.ts
│    └── shared/
│            ├── jest.config.js
│            ├── package.json
│            ├── tsconfig.json
│            ├── lib/
│            │   ├── core/
│            │   ├── payments/
│            │   └── ...
│            └── specs/
│                ├── e2e/
│                ├── features/
│                ├── step-definitions/
│                └── unit/
├── tools/
├── .editorconfig
├── .eslintrc
├── .prettierc
├── babel.config.js
├── jest.config.js
├── lerna.json
├── package.json
├── tsconfig.json
└── tslint.json
```

### Basic Lerna workflow

After you’ve configured Lerna and after adding at least one package, you can run `lerna bootstrap`.
The Lerna bootstrap command looks at all your packages in the package directory and resolves their dependencies. If you have cross dependencies like one of your packages depends on another one of your packages, Lerna bootstrap takes care of that and creates a symlink to the dependency in the packages `node_modules` directory.

Finally, after finishing the work on your packages and you’re ready to create a new release, you can run `lerna publish`,
which publishes all updated packages to npm.

## TypeScript

We will use TypeScript in our project so we can treat it as a shared dependency.
As Lerna is intended to work with JavaScript and not TypeScript, we will have to adjust the initial configuration for the monorepo.
Setting it up for **TypeScript** is more involved because we have to **transpile** our code before publishing and this affects navigating the source code in an IDE via **Go to definition**, for example.

### Configuration

As we are using TypeScript for all packages, we will have one common `tsconfig.json` defined in the root of our repo. Our `tsconfig.json` will look like:

```json
{
 "compilerOptions": {
   "module": "commonjs",
   "declaration": true,
   "noImplicitAny": false,
   "removeComments": true,
   "noLib": false,
   "emitDecoratorMetadata": true,
   "experimentalDecorators": true,
   "target": "es6",
   "sourceMap": true,
   "lib": [
     "es6"
   ]
 },
 "exclude": [
   "node_modules",
   "**/*.spec.ts"
 ]
}
```

Each individual package will have its own `tsconfig.json` whose extended root, individual `tsconfig.json` will look like:

```json
{
 "extends": "../../tsconfig.json",
 "compilerOptions": {
   "outDir": "./lib"
 },
 "include": [
   "./src"
 ]
}
```

### Path aliases

`tsconfig.json` is the config that will be picked up by an IDE by default and maps absolute package names back to their source code in the monorepo:

```json
{
  "extends": "./tsconfig.build.json",

  "compilerOptions": {
    "baseUrl": "./packages",
    "paths": {
      "@hindawi/foo": ["foo/src"],
      "@hindawi/bar": ["bar/src"],
      "@hindawi/*": ["*/src"]
    }
  }
}
```

## Continuous Integration

If you make a change, what should you build and test?
Ideally, anything that depends on the code you just changed.

A naive build system does the same work every time you run it. If you ask it to build and test, it will build all the code in the repository and run all the tests. And it does this each time you make a change.

However, the daily resource demand for naive CI is theoretically quadratic **`O(C × T)`**:

* **`C`** is the number of changes committed by all engineers per day
* **`T`** is the cumulative resource requirement of all the tests

A monorepo increases these factors a lot. On your team, `C` is close to constant (you don’t grow headcount that fast) but it’s linear or exponential in a big company. `T` increases slowly on your project, (and you have an incentive to keep your tests fast) but across the whole company, you might be running many other teams’ tests that are more resource-intensive. We might need a custom build tool that can be asked “what depends on this code” in a way that scales: it only requires analyzing the static build configuration across the monorepo.

Even though popular CI solutions (e.g., Azure, Circle, and Jenkins) are flexible enough to be used with, it is still something we might need some time to figure out.

## Links

[Awesome Monorepo](https://github.com/korfuri/awesome-monorepo)
