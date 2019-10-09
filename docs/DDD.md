# DDD

**DOMAIN-DRIVEN DESIGN** is a development approach to managing software for complex problem domains.

It consists of a collection of
patterns, principles and practices that will
enable teams to focus on what is core to
the success of the business while crafting
software that manages complexity in both
the technical and business spaces.
**DDD*** is technically agnostic.

Complexity in software is the result
of inherent domain complexity
(*essential*) mixing with technical
complexity (*accidental*).

## How software for complex domains can become difficult to manage

1. Initial software incarnation fast to produce.
2. Over time, without care and consideration, software turns into the pattern known as the "**ball of mud**"
3. It works, but no one knows how. Change is risky and difficult to complete. Where technical complexity exists,
the best developers will spend time there and not in problem domain.

## Domain / Entities / Models

A **Domain Model** represents a view, or **an abstraction**, not the reality, of the real problem domain, it exists only to meet
the needs of business use cases. The various expressions of the model - code, diagrams, documentation -
are bound by the same language.

Its usefulness comes from its ability to represent complex logic
and policies in the domain to solve business use cases.

* **Don't stop at your first good idea** : Many models must be rejected in order to ensure you have a useful model for the current use cases of a system.
* **Challenge your model**: With each new business case and scenario your model will constantly evolve with to keep itself useful and valid in the face of new uses cases.
Don’t become too attached as it’s healthy to attack problems in a completely different way to reveal insights.
* **Don't model real life**:  Model only what is relevant to solve use cases in the context of the application being created.

## Employ knowledge crunching techniques to produce effective models

> **Knowledge crunching** is the art of distilling relevant information from the problem domain in
order to build a useful model that can fulfil the needs of business use cases.

Creating a useful model is a collaborative experience; however, business users can also find it tiring and can
deem it unproductive. Business users are busy people. To make your knowledge crunching session fun and interactive,
you can introduce some facilitation games and other forms of requirement gathering to engage your audience.

* "Ignorance is the single greatest impediment to throughput" - Dan North
* "The Critical Complexity of most software projects is in understanding the
domain itself" - Eric Evans
* Knowledge is gained around whiteboards, water coolers, brainstorming, and
prototyping in a collaborative manner, with all members of the team at any time
of the project.
* Domain experts are the subject matter experts of the organization. They are
anyone who can offer insight into the problem domain (users, product owners,
business analysts, other technical teams).
* Your stakeholders will give you the requirements of your application but they
may not be best placed to answer detailed questions of the domain. Utilize
domain experts when modeling core or complex areas of the problem domain.
* Engage with your domain experts on the most important parts of a system. Don’t
simply read out a list of requirements and ask them to comment on each item.
* Plan to change your model; don’t get too attached as a breakthrough in
knowledge crunching may render it obsolete.
* Drive knowledge crunching around the most important uses case of the system.
Ask the domain experts to walk through concrete scenarios of system use cases
to help fill knowledge gaps.
* Ask powerful questions and learn the intent of the business. Don’t simply
implement a set of requirements, instead actively engage with the business; work
with them, not for them.
* Visualize your learning with sketches and event storming techniques. Visualizing
a problem domain can increase collaboration with the business experts and
make knowledge-crunching sessions fun.
* Use BDD to focus on the behavior of the application and focus domains
experts and stakeholders around concrete scenarios. BDD is a great catalyst
for conversations with the domain experts and stakeholders. It has a template
language to capture behavior in a standard and actionable way.
* Experiment in code to prove the usefulness of the model and to give feedback on
the compromises that a model needs to make for technical reasons.
* Look at existing processes and models in the industry to avoid trying to reinvent
the wheel and to speed up the gaining of domain knowledge.
* Find out what you don’t know, identify the team’s knowledge gaps early then
activate deliberate discovery. Eliminate unknown unknowns and increase domain
knowledge early.
* Leverage Eric Evans' Model Exploration Whirlpool when you need guidance on
how to explore models. The activities in the whirlpool are particularly helpful
when you are having communication breakdowns, overly complex designs, or
when the team is entering an area of the problem domain of which they don’t
have much knowledge.

## Ubiquitous Language

> A **Ubiquitous Language** minimizes the cost of translation and binds all expressions to the code
model also known as the true model.

When modeling with stakeholders and domain experts, everyone should make a conscious effort to consistently apply a
shared language rich in domain-specific terminology.
This language must be made explicit and be used when describing the domain model and problem domain.
A shared language also helps collaborative exploration when modelling, which can enable deep insights into the domain.

Software projects fail due to poor communication and the overhead of translation between
domain and technical terminology.

Don't focus on technical details, talk in domain terms.
**Remove** business terms that are not useful to solving specific use cases even if they exist in reality.
**Remove** technical terms that distract from the core domain complexity and are not used by the domain experts.
**Add** business terms that can unlock key insights into the model.
**Add** concepts discovered in code that unlock deep insights into the domain

## How to implement your Model

It’s important to understand that the implementation tactics for building domain models should remain flexible
and open to innovation.

Decompose large objects structures into smaller objects groupings called **aggregates** which
are based around _invariants_ (**business rules**).
An aggregate is a unit of consistency ensuring transactional boundaries are set at the right level of granularity to ensure a usable application
by avoiding blocking at the database level.

## Write software that explicitly expresses the model

````ts
public class Guaranteed30MinuteDeliveryOffer {
  public after(delivery: PizzaDelivered): void {
    if (delivery.timeTaken > thirtyMinutes) {
      sendCouponTo(delivery.customer);
    }
  }
}
````

## Collaborative and constantly evolving modelling

> Before starting to model understand the technical landscape, the relationships with other
teams and other models at play.

1. **Focus on a single business use case** at a time and model the various concrete scenarios for each use case.
2. **Create a useful model** that satisfies the needs of the use case.
Don’t be over ambitious and avoid perfectionism. The goal is not to
model reality, your models should be inspired by aspects of reality.
3. **Reveal hidden insights and simplify the model** by exploring and experimenting with new ideas.
You will understand more about the problem domain the more you play with it.
4. **Don’t stop modelling at the first useful model.** Experiment with different designs
to find a supple model and design breakthrough. Challenge your
assumptions and look at things from a different perspective.
5. **Apply tactical design patterns** to model the rich domain behaviors and to ensure that the model is supple enough to adapt as new requirements surface. **Note**: DDD is not a patterns language, don't fall into the trap of solely focusing on tactical code design patterns.
6. **Isolate the model** from infrastructure concerns and keep technical complexities separate from domain complexities.
Use application services to model use cases and delegate to the domain model to solve.
