import { GluegunToolbox } from 'gluegun'

module.exports = {
  dashed: true,
  name: 'send-invoice',
  alias: ['si'],
  description: 'Creates an Invoice associated with a Manuscript ID',
  run: async (toolbox: GluegunToolbox) => {
    // retrieve the tools from the toolbox that we will need
    const {
      parameters,
      print: {
        spin,
        debug,
        info,
        error,
        colors: { blue }
      },
      prompt,
      sendInvoiceFlow
    } = toolbox

    // check if there's a name provided on the command line first
    let articleId = parameters.first

    // if not, let's prompt the user for one and then assign that to `name`
    if (!articleId) {
      info(blue('******************'))
      info(blue('*  Send Invoice  *'))
      info(blue('******************'))

      const result = await prompt.ask({
        type: 'input',
        name: 'articleId',
        message: 'Which article ID?'
      })
      if (result && result.articleId) articleId = result.articleId
    }

    // if they didn't provide one, we error out
    if (!articleId) {
      error('No article ID specified!')
      return
    }

    // * create spinner
    const spinner = spin('Retrieve article details')
    spinner.color = 'cyan'
    spinner.start()

    // * now execute the flow
    const result = await sendInvoiceFlow.execute({
      articleId
    })
    const { isSuccess, isFailure, error: flowError } = result

    if (isFailure) {
      spinner.fail(flowError)
      error(flowError)
    }

    // success! We have article info. Print it out on the screen
    if (isSuccess) {
      const resultValue = result.getValue()
      spinner.succeed('Successfully sent the invoice!.')
      debug(resultValue)
    }
  }
}
