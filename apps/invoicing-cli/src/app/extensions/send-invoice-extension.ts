import { GluegunToolbox } from 'gluegun'
// import JSONDB from '../lowdb'

// import {
//   // SendInvoiceForAPCFlow,
//   TransactionRepoContract,
//   // TransactionJsonRepo,
//   InvoiceRepoContract
//   // InvoiceJsonRepo
// } from '../../../../../../../shared/lib'

// let transactionRepo: TransactionRepoContract
// let invoiceRepo: InvoiceRepoContract

/**
 * Create the repos and kick it off
 */
module.exports = async (toolbox: GluegunToolbox) => {
  // const db = JSONDB.getDBInstance()

  // transactionRepo = new TransactionJsonRepo(db)
  // invoiceRepo = new InvoiceJsonRepo(db)

  // const sendInvoiceFlow = new SendInvoiceForAPCFlow(
  //   invoiceRepo,
  //   transactionRepo
  //   // articleRepo
  // )

  const sendInvoiceFlow = {}

  // attach the flow to the toolbox
  toolbox.sendInvoiceFlow = sendInvoiceFlow
}
