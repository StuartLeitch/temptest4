import { GluegunToolbox } from 'gluegun'
const { NumberPrompt, Form } = require('enquirer')

module.exports = {
  dashed: true,
  name: 'check-out',
  alias: ['co'],
  description: 'Payment Checkout',
  run: async (toolbox: GluegunToolbox) => {
    const {
      print: {
        // spin,
        // debug,
        info,
        // error,
        colors: { magenta, yellow }
      },
      prompt,
      parameters,
      transactionRepo,
      priceRepo,
      articleRepo
    } = toolbox

    info(yellow('************************'))
    info(yellow('*      Checkout        *'))
    info(yellow('************************'))

    // check if there's a transaction id provided on the command line first
    let transactionId = parameters.first

    // if not, let's prompt the user for one and then assign that to `name`
    if (!transactionId) {
      const result = await prompt.ask({
        type: 'input',
        name: 'transactionId',
        message: 'Which transaction ID?'
      })
      if (result && result.transactionId) transactionId = result.transactionId
    }

    const transaction = await transactionRepo.getTransactionById(transactionId)
    const transactionIsSplit = transaction.isSplit()
    info(magenta(`transaction is split: ${transactionIsSplit}`))
    info(magenta(`associated article ID: ${transaction.articleId}`))

    // get transaction's associated article details
    const article = await articleRepo.findById(transaction.articleId)
    // get article price value
    const price = await priceRepo.findById(article.priceId)
    const cost = price.value.value
    info(magenta(`cost: ${cost}`))

    let payersCount: number = 0
    const payersNumberPrompt = new NumberPrompt({
      type: 'number',
      initial: payersCount,
      message: 'How many payers?'
    })

    payersCount = await payersNumberPrompt.run()

    info(magenta(`payers: ${payersCount}`))

    const equalAmount = Math.round(cost / payersCount)
    info(magenta(`Estimated invoice amount: ${equalAmount}`))

    const choices = Array.from(Array(payersCount), (d, i) => ({
      name: `invoice #${i}`,
      message: `Invoice #${i} amount`,
      initial: String(equalAmount)
    }))

    const invoiceAmountReview = new Form({
      name: 'invoice_review',
      message: 'Review amount for each invoice',
      choices
    })

    const invoiceReview = await invoiceAmountReview.run()
    // info(magenta(`invoices: ${invoiceReview}`))
    console.log('Invoice review:', invoiceReview)
  }
}
