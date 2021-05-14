import { UniqueEntityID } from '../../core/domain/UniqueEntityID';

import { WaiverType, Waiver } from '../../modules/waivers/domain/Waiver';
import { InvoiceId } from '../../modules/invoices/domain/InvoiceId';

import { InvoiceItemRepoContract } from '../../modules/invoices/repos';
import { EditorRepoContract } from '../../modules/journals/repos';
import { WaiverRepoContract } from '../../modules/waivers/repos';

import { PoliciesRegister as ReductionsPoliciesRegister } from '../reductions/policies/PoliciesRegister';
import { WaivedCountry100Policy } from '../reductions/policies/WaivedCountry100Policy';

export interface WaiverServiceDTO {
  allAuthorsEmails: string[];
  invoiceId: string;
  journalId: string;
  country: string;
}

export class WaiverService {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private editorRepo: EditorRepoContract,
    private waiverRepo: WaiverRepoContract
  ) {}
  public async applyWaiver({
    allAuthorsEmails,
    invoiceId,
    journalId,
    country,
  }: WaiverServiceDTO): Promise<Waiver> {
    const waiversToApply: WaiverType[] = [];

    const reductionsPoliciesRegister = new ReductionsPoliciesRegister();

    const activeWaivers = await this.waiverRepo.getWaivers();
    const activeWaiverMap = activeWaivers
      .filter((w) => w.isActive)
      .reduce((acc, curr) => {
        acc[curr.waiverType] = true;
        return acc;
      }, {});

    if (activeWaiverMap[WaiverType.WAIVED_COUNTRY_100]) {
      const waivedCountryPolicy: WaivedCountry100Policy = new WaivedCountry100Policy();
      reductionsPoliciesRegister.registerPolicy(waivedCountryPolicy);

      const waivedCountryWaiver = reductionsPoliciesRegister.applyPolicy(
        waivedCountryPolicy.getType(),
        [country]
      );

      if (waivedCountryWaiver && waivedCountryWaiver.getReduction()) {
        waiversToApply.push(waivedCountryWaiver.getReduction().waiverType);
      }
    }

    const editorRoles = await this.editorRepo.getEditorListRolesByEmails(
      allAuthorsEmails
    );

    if (activeWaiverMap[WaiverType.WAIVED_CHIEF_EDITOR]) {
      const isChiefEditor = editorRoles.some((e) => e.isChiefEditor());
      if (isChiefEditor) {
        waiversToApply.push(WaiverType.WAIVED_CHIEF_EDITOR);
      }
    }

    if (activeWaiverMap[WaiverType.WAIVED_EDITOR]) {
      const isCurrentJournalEditor = editorRoles.some(
        (e) => e.journalId.id.toString() === journalId
      );
      if (isCurrentJournalEditor) {
        waiversToApply.push(WaiverType.WAIVED_EDITOR);
      }
    }

    if (activeWaiverMap[WaiverType.EDITOR_DISCOUNT]) {
      if (editorRoles.length > 0) {
        waiversToApply.push(WaiverType.EDITOR_DISCOUNT);
      }
    }

    const invoiceIdObject = InvoiceId.create(
      new UniqueEntityID(invoiceId)
    ).getValue();

    const applicableWaivers = await this.waiverRepo.getWaiversByTypes(
      waiversToApply
    );
    return this.applyHighestReductionWaiver(invoiceIdObject, applicableWaivers);
  }

  public async applyHighestReductionWaiver(
    invoiceId: InvoiceId,
    applicableWaivers: Waiver[]
  ): Promise<Waiver> {
    if (!applicableWaivers.length) {
      return;
    }

    const invoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
      invoiceId
    );

    if (!invoiceItems || invoiceItems.length === 0) {
      return;
    }

    const item = invoiceItems[0];

    const existingWaivers = (
      await this.waiverRepo.getWaiversByInvoiceItemId(item.invoiceItemId)
    ).waivers;

    const highestReductionWaiver = applicableWaivers.sort(
      (a, b) => b.reduction - a.reduction
    )[0];

    if (existingWaivers.length > 0) {
      if (
        existingWaivers[0].props.reduction >
        highestReductionWaiver.props.reduction
      ) {
        return existingWaivers[0];
      } else {
        this.waiverRepo.removeInvoiceItemWaivers(item.invoiceItemId);
      }
    }

    return this.waiverRepo.attachWaiverToInvoiceItem(
      highestReductionWaiver.waiverType,
      item.invoiceItemId
    );
  }
}
