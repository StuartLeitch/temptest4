import { PoliciesRegister as ReductionsPoliciesRegister } from '../reductions/policies/PoliciesRegister';
import { WaivedCountryPolicy } from '../reductions/policies/WaivedCountryPolicy';
import { WaiverRepoContract } from '../../modules/waivers/repos';
import { Waiver, WaiverType } from '../../modules/waivers/domain/Waiver';
import { InvoiceId } from '../../modules/invoices/domain/InvoiceId';
import { UniqueEntityID } from '../../core/domain/UniqueEntityID';
import { SanctionedCountryPolicy } from '../reductions/policies/SanctionedCountryPolicy';
import { EditorRepoContract } from '../../modules/journals/repos';

interface WaiverServiceDTO {
  country: string;
  invoiceId: string;
  journalId: string;
  authorEmail: string;
}

export class WaiverService {
  constructor(
    private waiverRepo: WaiverRepoContract,
    private editorRepo: EditorRepoContract
  ) {}
  public async applyWaivers({
    country,
    invoiceId,
    authorEmail,
    journalId,
  }: WaiverServiceDTO): Promise<Waiver[]> {
    const waiversToApply: WaiverType[] = [];

    const reductionsPoliciesRegister = new ReductionsPoliciesRegister();

    const activeWaivers = await this.waiverRepo.getWaivers();
    const activeWaiverMap = activeWaivers
      .filter((w) => w.isActive)
      .reduce((acc, curr) => {
        acc[curr.waiverType] = true;
        return acc;
      }, {});

    if (activeWaiverMap[WaiverType.WAIVED_COUNTRY]) {
      const waivedCountryPolicy: WaivedCountryPolicy = new WaivedCountryPolicy();
      reductionsPoliciesRegister.registerPolicy(waivedCountryPolicy);

      const waivedCountryWaiver = reductionsPoliciesRegister.applyPolicy(
        waivedCountryPolicy.getType(),
        [country]
      );

      if (waivedCountryWaiver && waivedCountryWaiver.getReduction()) {
        waiversToApply.push(waivedCountryWaiver.getReduction().waiverType);
      }
    }

    if (activeWaiverMap[WaiverType.SANCTIONED_COUNTRY]) {
      const sanctionedCountryPolicy: SanctionedCountryPolicy = new SanctionedCountryPolicy();
      reductionsPoliciesRegister.registerPolicy(sanctionedCountryPolicy);

      const sanctionedCountryWaiver = reductionsPoliciesRegister.applyPolicy(
        sanctionedCountryPolicy.getType(),
        [country]
      );

      if (sanctionedCountryWaiver && sanctionedCountryWaiver.getReduction()) {
        waiversToApply.push(sanctionedCountryWaiver.getReduction().waiverType);
      }
    }

    const editorRoles = await this.editorRepo.getEditorRolesByEmail(
      authorEmail
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
    console.log('Applied waivers', ...waiversToApply, 'to invoice', invoiceId);
    return this.waiverRepo.attachWaiversToInvoice(
      waiversToApply,
      InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
    );
  }
}
