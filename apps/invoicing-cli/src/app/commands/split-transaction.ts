import { GluegunToolbox } from 'gluegun'

import {
  UniqueEntityID,
  GetTransactionUsecase,
  Roles,
  Transaction,
  Payer,
  PayerName,
  PayerType,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  PoliciesRegister,
  UKVATTreatmentArticleProcessingChargesPolicy,
  PaymentFactory,
  PaymentModel,
  PaymentStrategy,
  CreditCardPayment,
  CreditCard,
  BraintreeGateway
} from '@hindawi/shared'
import { makeDb, destroyDb } from '@hindawi/server/testUtils/db'
// import { InvoiceKnexRepo as InvoiceRepo } from '@hindawi/server/repos/knex/InvoiceRepo'
import { TransactionKnexRepo as TransactionRepo } from '@hindawi/server/repos/knex/TransactionRepo'
import { CatalogKnexRepo as CatalogRepo } from '@hindawi/server/repos/knex/CatalogRepo'

const AMOUNTS = {}

module.exports = {
  dashed: true,
  name: 'split-transaction',
  alias: ['st'],
  description:
    'Launches the "Split Transaction" wizard for a given Transaction ID',
  run: async (toolbox: GluegunToolbox) => {
    // retrieve the tools from the toolbox that we will need
    const {
      parameters,
      print: {
        spin,
        // debug,
        success,
        info,
        table,
        newline,
        error,
        colors: { muted, red, blue, magenta }
      },
      prompt
      //   createTransactionFlow
    } = toolbox

    info(blue('************************'))
    info(blue('*  Split Transaction   *'))
    info(blue('************************'))
    const transactionId = parameters.first

    const db = await makeDb({ filename: './dev.sqlite3' })
    const transactionRepo = new TransactionRepo(db)
    const catalogRepo = new CatalogRepo(db)
    const getTransactionUsecase = new GetTransactionUsecase(transactionRepo)
    const policiesRegister = new PoliciesRegister()
    const APCPolicy: UKVATTreatmentArticleProcessingChargesPolicy = new UKVATTreatmentArticleProcessingChargesPolicy()
    policiesRegister.registerPolicy(APCPolicy)

    // * create spinner
    const spinner = spin()
    spinner.color = 'cyan'

    const result = await getTransactionUsecase.execute(
      {
        transactionId
      },
      {
        roles: [Roles.ADMIN]
      }
    )

    let transaction: Transaction
    if (result.isSuccess) {
      transaction = result.getValue()
      spinner.succeed('Successfully retrieved Transaction value.')
    } else {
      const { error: usecaseError } = result
      spinner.fail(usecaseError.toString())
      error(usecaseError)
    }

    spinner.stopAndPersist()

    const catalogItem = await catalogRepo.getPriceByType()
    newline()
    const text1 = magenta('Transaction net value is:')
    const text2 = red(`${catalogItem}`)
    info(`${text1} ${text2}`)
    newline()

    const { payersCount } = await prompt.ask([
      {
        type: 'input',
        name: 'payersCount',
        message: 'How many payers will split the transaction?',
        initial: 1
      }
    ])

    const payerInput = i => {
      newline()
      info(muted(`Please add Payer #${i} details:`))
      return prompt.ask([
        {
          type: 'input',
          name: 'name',
          hint: ' (start typing)',
          // initial: 'payer name',
          message: 'Payer Name'
        },
        {
          type: 'select',
          name: 'country',
          message: 'Payer is from:',
          choices: ['UK', 'RO']
        },
        {
          type: 'confirm',
          name: 'individualConfirmed',
          message: 'Is individual?'
        }
      ])
    }

    const payersInputs = Array.from({ length: payersCount }, (_, i) =>
      payerInput.bind(null, i + 1)
    )

    const payersData = []
    for (let pi of payersInputs) {
      const { name, country, individualConfirmed } = await Reflect.apply(
        pi,
        null,
        []
      )

      // const payerId = `test-payer-${name}`
      const payerEntity = Payer.create(
        {
          name: PayerName.create(name).getValue(),
          surname: PayerName.create(name).getValue(),
          type: PayerType.create('FooBar').getValue()
        },
        new UniqueEntityID()
      ).getValue()

      // const invoiceId = 'test-invoice1'
      const invoiceEntity = Invoice.create(
        {
          status: InvoiceStatus.DRAFT,
          payerId: payerEntity.payerId
        },
        new UniqueEntityID()
      ).getValue()

      const invoiceItem = InvoiceItem.create(
        {
          invoiceId: invoiceEntity.invoiceId
        },
        new UniqueEntityID()
      ).getValue()

      invoiceItem.price = Math.round(catalogItem / payersCount)

      const calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
        country,
        !individualConfirmed,
        individualConfirmed ? false : true
      ])
      const VAT = calculateVAT.getVAT()

      invoiceEntity.addInvoiceItem(invoiceItem)
      const totalAmount = invoiceEntity.addTax(VAT)
      AMOUNTS[invoiceEntity.id.toString()] = totalAmount

      transaction.addInvoice(invoiceEntity)

      payersData.push({
        transactionID: transaction.id.toString(),
        invoiceID: invoiceEntity.id.toString(),
        invoiceStatus: InvoiceStatus[invoiceEntity.status],
        name,
        country,
        individualConfirmed,
        netAmount: invoiceItem.price,
        totalAmount
      })
    }

    newline()

    buildTable(payersData, table)

    newline()
    const { sendInvoicesConfirmation } = await prompt.ask([
      {
        type: 'confirm',
        name: 'sendInvoicesConfirmation',
        message: 'Do you wish to send invoices to their payers?'
      }
    ])

    if (sendInvoicesConfirmation) {
      newline()
      // send invoices to the payers
      transaction.invoices.forEach((invoice: Invoice) => {
        invoice.markAsActive()

        payersData.forEach(row => {
          if (row.invoiceID === invoice.id.toString()) {
            row.invoiceStatus = InvoiceStatus[invoice.status]
          }
        })
      })

      buildTable(payersData, table)
    }

    newline()
    const { payInvoicesConfirmation, selectedInvoice } = await prompt.ask([
      {
        type: 'confirm',
        name: 'payInvoicesConfirmation',
        message: 'Do you wish pay for an invoice?'
      },
      {
        type: 'select',
        name: 'selectedInvoice',
        message: 'Select invoice to pay:',
        choices: payersData.map(row => row.invoiceID)
      }
    ])

    if (payInvoicesConfirmation) {
      newline()
      const invoice = transaction.invoices.find(
        (invoice: Invoice) => invoice.id.toString() === selectedInvoice
      )

      let creditCard = new CreditCard()
      const paymentFactory: PaymentFactory = new PaymentFactory()
      paymentFactory.registerPayment(creditCard)
      const paymentMethod: PaymentModel = paymentFactory.create(
        'CreditCardPayment'
      )
      const paymentStrategy: PaymentStrategy = new PaymentStrategy([
        ['CreditCard', new CreditCardPayment(BraintreeGateway)]
      ])

      const payment: any = await paymentStrategy.makePayment(
        paymentMethod,
        AMOUNTS[invoice.id.toString()]
      )

      if (payment.success) {
        invoice.markAsPaid()
        payersData.forEach(row => {
          if (row.invoiceID === invoice.id.toString()) {
            row.invoiceStatus = InvoiceStatus[invoice.status]
          }
        })

        buildTable(payersData, table)

        newline()
        success(
          'Invoice paid! CreditCard Payment ID: ' + payment.transaction.id
        )
      } else {
        error(payment.message)
      }
    }

    // info(muted('To pay the issued invoices, execute these phenom commands:'))
    // // payersData.shift()

    // payersData.forEach(row => {
    //   const payInvoiceCmd = `$ phenom pi ${row.invoiceID}`
    //   info(payInvoiceCmd)
    // })

    await destroyDb(db)
  }
}

function buildTable(data, tableRenderer) {
  const tableColumns = [
    'Transaction ID',
    'Invoice ID',
    'Invoice Status',
    'Payer Name',
    'Country',
    'Type',
    'Net Amount',
    'Total Amount'
  ]

  const tableData = data.map(
    ({
      transactionID,
      invoiceID,
      invoiceStatus,
      name,
      country,
      individualConfirmed,
      netAmount,
      totalAmount
    }) => [
      transactionID,
      invoiceID,
      invoiceStatus,
      name,
      country,
      individualConfirmed ? 'Individual' : 'Organisation',
      netAmount,
      parseFloat(String(totalAmount)).toFixed(2)
    ]
  )
  tableData.unshift(tableColumns)
  tableRenderer(tableData, {
    format: 'lean'
  })
}
