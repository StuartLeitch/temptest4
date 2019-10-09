import { HandleContract } from './../../../../../../../shared/lib/core/domain/events/contracts/Handle'
import { DomainEvents } from './../../../../../../../shared/lib/core/domain/events/DomainEvents'
import { ManuscriptSubmittedEvent } from './../../../../../../../shared/lib/transactions/domain/events/manuscriptSubmittedEvent'

export class AfterManuscriptSubmittedEvent
  implements HandleContract<ManuscriptSubmittedEvent> {
  constructor() {
    this.setupSubscriptions()
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.onManuscriptSubmittedEvent.bind(this),
      ManuscriptSubmittedEvent.name
    )
  }

  private async onManuscriptSubmittedEvent(
    event: ManuscriptSubmittedEvent
  ): Promise<any> {
    // Get metadata
  }
}
