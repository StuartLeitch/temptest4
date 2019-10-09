# When and where to determine the ID of an Entity

There are different answers, no best answer. Well, there are two best answers, but they apply to two different situations.

## Auto-incrementing IDs, by the Database

Traditionally, all you need for an entity to have an `ID` is to designate one integer column in the database as the primary key, and mark it as "`auto-incrementing`". So, once a new entity gets persisted as a record in the database (using your favorite ORM), it will get an `ID`. That is, the entity has no identity until it has been persisted.

Even though this happens everywhere, and almost always; it's a bit weird, because:

* The application logic now relies on some external system to determine the identity of an entity we create.
* The entity will have no identity at first, meaning it can be created with an invalid (incomplete) state. This is not a desirable quality for an entity (for almost no object I'd say).

When I'm working with entities, I always like to generate domain events (plain objects), which contain relevant values or value objects.

For example, when I create a `Meetup` entity (in fact, when I "_schedule it_"), I want to record an event about that. But at that point, I have no `ID` yet, so I actually can't even record that event.

```ts
class Meetup {
  public static schedule(name: Name, /* ... */): Meetup {
    const meetup = new this();

    meetup.recordThat(
        new MeetupScheduled(
            // we don't know the ID yet!
        )
    );

    // ...

    return meetup;
  }
}
```

The only thing I can do is record the event later, outside the `Meetup` entity, when we finally have the `ID`. But that would be a bit sad, since we'd have to move the construction of the event object out of the entity, breaking up the entity's originally excellent encapsulation.

## Determining uniqueness

The only way to solve this problem is to determine a new identity upfront. That way, the entity can be complete from the start, and it can record any event it likes, which likely includes the entity's `ID` itself. One way to do this is to use a `UUID` generator to generate a universally unique identifier.

A first step would be to generate the `ID` inside the entity's constructor:

```ts
import Uuid from 'uuid';

class Meetup {
  private meetupId;

  public static schedule(name: Name, /* ... */): Meetup {
    const meetup = new this();

    meetup.meetupId = MeetupId.fromString(Uuid.uuid4().toString());

    // ...

    return meetup;
  }
}
```

However, the dependency rule (based on the one posed by Robert C. Martin in The Clean Architecture) states that you should only depend on things that are in the same or in a _deeper layer_. That means, domain code can only depend on itself, application code can only depend on domain code and its own code, and infrastructure code can depend on anything. According to the dependency rule it's not allowed for domain code to depend on infrastructure code. This should already make sense, but the rule formalizes our intuitions here.

As you can understand from the code above, the process of generating the `UUID` does not belong inside the domain layer, but the infrastructure. So the `ID` generation process itself should happen outside of the entity.

Besides, even though it's technically possible to generate a `UUID` inside an entity, it's something that conceptually isn't right. The idea behind an `ID` is that it's **unique** for the kind of thing it identifies. The entity is only aware of itself, and ***can never reach across its own object boundaries to find out if an ID it has generated is actually unique***. That's why, at least conceptually, generating an identity should not happen inside the entity, only outside of it.

So a better approach would be to generate the `ID` before creating the new entity, and to pass it in as a constructor argument:

```ts
import Uuid from 'uuid';

class Meetup {
  private meetupId;

  public static schedule(name: Name, /* ... */, meetupId: MeetupId): Meetup {
    const meetup = new this();

    meetup.meetupId = meetupId;

    // ...

    return meetup;
  }
}

const meetupId = MeetupId.fromString(Uuid.uuid4().toString());
const meetup = Meetup.schedule(..., $meetupId);
```

## Generate the ID in the application service

When you have a separate application layer (with application services, e.g. command handlers), you can generate the `ID` there. For example:

```ts
import Uuid from 'uuid';

import Meetup from 'domain/Meetup';
import MeetupId from 'domain/MeetupId';
import MeetupRepository from 'repos/MeetupRepository';
import ScheduleMeetup from 'commands/ScheduleMeetup';

class ScheduleMeetupHandler {
  public function constructor(private meetupRepository: MeetupRepository) {
    this.meetupRepository = meetupRepository;
  }

  public handle(command: ScheduleMeetup): Meetup
  {
    const meetupId = MeetupId.fromString(Uuid.uuid4().toString());
    const meetup = Meetup.schedule(
      // ...
      meetupId,
    );

    this.meetupRepository.add(meetup);

    return meetup;
  }
}
```

## Let the repository generate the next identity

However, at this point we still have the issue of generating the `UUID` being an infrastructure concern. It should move out of the application layer too. This is where you can use a handy suggestion I learned from Vaughn Vernon's book "Implementing Domain-Driven Design": let the repository "hand out" a new identity whenever you need it.

```ts
import Meetup from 'domain/Meetup';
import MeetupId from 'domain/MeetupId';

interface MeetupRepository {
  public add(meetup: Meetup): void;
  public nextIdentity(): MeetupId;
}
```

We already have an implementation for this interface in the infrastructure layer, making the actual database calls, etc. so we can just conveniently implement the `ID` generation in that class:

```ts
import MeetupId from 'domain/MeetupId';

class MeetupSqlRepository implements MeetupRepository {
    // ...

    public nextIdentity(): MeetupId {
        return MeetupId.fromString(Uuid.uuid4().toString());
    }
}
```

The code in the application service will look like this:

```ts
const meetupId = this.meetupRepository.nextIdentity();
const meetup = Meetup.schedule(
  // ...
  $meetupId,
);
```

The advantages of letting the repository generate the next identity are:

* There's a natural, conceptual relation: repositories manage the _entities_ and their _identities_.
* You can easily change the way an ID is being generated because the process is now properly encapsulated. No scattered calls to `Uuid.uuid4()`, but only calls to `Repository.nextIdentity()`.
* You can in fact still use an incremental ID if you like. You can use the database after all if it natively supports sequences. Or you can implement your own sequence. Maybe using Redis, but a regular relational database could be used too of course, e.g.

```ts
class MeetupSqlRepository implements MeetupRepository {
  // ...
  public nextIdentity(): MeetupId {
    return MeetupId.fromInteger(
      this.redis.incr('meetupId')
    );
  }
}
```

The only issue with using sequences is that there's no guarantee that every number in the sequence will actually be used (after all, we may request the next identity in the sequence, but not use it). But if that's not an issue, and you don't want to use `UUIDs`, this is a perfect solution for you. By the way, using Redis for this is just an example, you could also create a sequence like this with a good old relational database.

## Use a value object for identities

Please note that encapsulating the identity generation process also means you need to encapsulate the identity itself. You already saw how I use a value object for the meetup identity. I do this for every entity identity.

An example of a value object that, in this case, wraps a UUID string:

```ts
class MeetupId {
  private constructor(private id: string) {
    // Implement here a guard against invalid values
    $this->id = $id;
  }

  public static fromString(id: string): MeetupId {
      return new this(id);
  }
}
```

Advantages of using a value object for IDs:

* It hides the underlying data type of the ID.
* This means you can switch to a different internal type, without doing shotgun surgery on the code base.
* I think it's nicer to type against a particular ID class instead of just a string.

Feel free to de-duplicate some code in those ID value objects (e.g. of they are all UUID strings, I suggest introducing a trait for the methods you always have).

## Generate the identity in the controller

We've now discussed the first of the "best" solutions: **generating identity in the application service, but let the repository do the real work**.

An alternative to this is to generate the identity in the controller (still letting the repository do the real work):

```ts
public scheduleMeetupAction(): Response {
  const command = new ScheduleMeetup();
  command.id = this.repository.nextIdentity();
  // ...

  this.scheduleMeetupHandler.handle(command);

  return this->redirect('/meetup/' . command.id);
}
```

This introduces an extra dependency in the controller, i.e. the repository, but you gain from this that you don't need the return value of the command handler. This could be something you just want (or maybe you can't even get anything from the command handler, because it hasn't been designed that way). Or maybe you need it because you handle the command asynchronously (i.e. you push it to some job queue). In that case it's very convenient to be able to use the `ID` already, before the command is handled, so you can keep track of its status. You can even send it back to the client and tell them the `ID` which they can later use to retrieve the result of handling the command (read "Returning From Command Buses" by Ross Tuck for a more detailed treatment of this discussion).
