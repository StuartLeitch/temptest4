import { UniqueEntityID } from '../../core/domain/UniqueEntityID';

import { WaiverType, Waiver } from '../../modules/waivers/domain/Waiver';
import { InvoiceId } from '../../modules/invoices/domain/InvoiceId';

import { InvoiceItemRepoContract } from '../../modules/invoices/repos';
import { EditorRepoContract } from '../../modules/journals/repos';
import { WaiverRepoContract } from '../../modules/waivers/repos';

import { PoliciesRegister as ReductionsPoliciesRegister } from '../reductions/policies/PoliciesRegister';
import { WaivedCountry100Policy } from '../reductions/policies/WaivedCountry100Policy';
import { WaivedCountry50Policy } from '../reductions/policies/WaivedCountry50Policy';

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

    const maybeActiveWaivers = await this.waiverRepo.getWaivers();

    if (maybeActiveWaivers.isLeft()) {
      return null;
    }

    const activeWaivers = maybeActiveWaivers.value;

    const activeWaiverMap = activeWaivers
      .filter((w) => w.isActive)
      .reduce((acc, curr) => {
        acc[curr.waiverType] = true;
        return acc;
      }, {});

    if (activeWaiverMap[WaiverType.WAIVED_COUNTRY]) {
      const waivedCountry100Policy: WaivedCountry100Policy = new WaivedCountry100Policy();
      reductionsPoliciesRegister.registerPolicy(waivedCountry100Policy);

      const waivedCountryWaiver = reductionsPoliciesRegister.applyPolicy(
        waivedCountry100Policy.getType(),
        [country]
      );

      if (waivedCountryWaiver && waivedCountryWaiver.getReduction()) {
        waiversToApply.push(waivedCountryWaiver.getReduction().waiverType);
      }
    }

    if (activeWaiverMap[WaiverType.WAIVED_COUNTRY_50]) {
      const waivedCountry50Policy: WaivedCountry50Policy = new WaivedCountry50Policy();
      reductionsPoliciesRegister.registerPolicy(waivedCountry50Policy);

      const waivedCountryWaiver = reductionsPoliciesRegister.applyPolicy(
        waivedCountry50Policy.getType(),
        [country]
      );

      if (waivedCountryWaiver && waivedCountryWaiver.getReduction()) {
        waiversToApply.push(waivedCountryWaiver.getReduction().waiverType);
      }
    }

    const maybeEditorRoles = await this.editorRepo.getEditorListRolesByEmails(
      allAuthorsEmails
    );

    if (maybeEditorRoles.isLeft()) {
      return null;
    }

    const editorRoles = maybeEditorRoles.value;

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

    const invoiceIdObject = InvoiceId.create(new UniqueEntityID(invoiceId));

    const maybeApplicableWaivers = await this.waiverRepo.getWaiversByTypes(
      waiversToApply
    );

    if (maybeApplicableWaivers.isLeft()) {
      return null;
    }

    const applicableWaivers = maybeApplicableWaivers.value;

    return this.applyHighestReductionWaiver(invoiceIdObject, applicableWaivers);
  }

  public async applyHighestReductionWaiver(
    invoiceId: InvoiceId,
    applicableWaivers: Waiver[]
  ): Promise<Waiver> {
    if (!applicableWaivers.length) {
      return;
    }

    const maybeInvoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
      invoiceId
    );

    if (maybeInvoiceItems.isLeft()) {
      return null;
    }

    const invoiceItems = maybeInvoiceItems.value;

    if (!invoiceItems || invoiceItems.length === 0) {
      return;
    }

    const item = invoiceItems[0];

    const maybeExistingWaivers = await this.waiverRepo.getWaiversByInvoiceItemId(
      item.invoiceItemId
    );

    if (maybeExistingWaivers.isLeft()) {
      return null;
    }

    const existingWaivers = maybeExistingWaivers.value.waivers;

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

    const resp = await this.waiverRepo.attachWaiverToInvoiceItem(
      highestReductionWaiver.waiverType,
      item.invoiceItemId
    );

    if (resp.isLeft()) {
      return null;
    }

    return resp.value;
  }
}
