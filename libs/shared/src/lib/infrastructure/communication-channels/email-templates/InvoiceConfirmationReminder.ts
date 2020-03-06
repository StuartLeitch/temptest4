export class InvoiceConfirmationReminderTemplate {
  static build(articleCustomId: string, invoiceButton: string) {
    const subject = `${articleCustomId}: Article Processing Charges - confirmation reminder`;
    const paragraph = `
      We would like to gently remind you to confirm your invoice.<br/>
      <b>What to do next</b><br/>
      Please determine the payer for your invoice, an individual or an institution.<br/>
      If an institution is making the payment, please send the below URL to the payer to generate the invoice and proceed with the payment process.<br/>
      You can confirm the invoice for your article and make payment through the following URL:
      <br /><br />

      ${invoiceButton}

      <ol>
        <li>
          Select the icon "Pay as Institution" or "Pay as Individual"<br/>
          <it>If paying as an institution based in the EU, with a valid EC VAT number, please ensure this is entered in the "EC VAT Reg. No." cell, if no valid EC VAT number is provided, you will be charged VAT.</it>
        </li>
        <li>
          Fill in the requested information, and then press continue
        </li>
        <li>
          Press "Confirm Invoice"
        </li>
      </ol></br>

      You will be able to download the invoice with all the requested data.<br/>
      Please be aware that once the invoice has been generated, payment is due upon receipt.<br/><br/>
      <b>Got a question?</b><br/>
      If you have any questions related to the invoice or confirmation process, just reply to this email and our Customer Service team will be happy to help.<br/>
      --------------------------------<br/>
      Customer Service Team<br/>
      Hindawi Ltd<br/>
    `;
    return {
      subject,
      paragraph
    };
  }
}
