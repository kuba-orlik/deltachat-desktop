import { ClientFunction, Selector } from 'testcafe'
// import { waitForReact, ReactSelector } from 'testcafe-react-selectors'

const getPageTitle = ClientFunction(() => document.title)
const headlineSelector = Selector('h2')
const getHeadline = () => headlineSelector().innerText

const scriptContent = `
window.addEventListener('DOMContentLoaded', function () {
  // document.body.style.backgroundColor = 'green';
  console.log('Client script loaded. Page title is: ' + document.title);  
});
`

fixture('Electron test2').page('../../static/test.html').clientScripts({ content: scriptContent })

test('shows correct page title', async t => {
  await t.expect(getPageTitle()).eql('Deltachat e2e tests')
})

test('shows correct headline', async t => {
  await t.expect(getHeadline()).eql('Testcafe')
})

// fixture `Electron test`.page('../../static/test.html')
//   .beforeEach(async () => {
//     await waitForReact()
//   }).clientScripts({ content: scriptContent })

// test('finds react element', async t => {
//   // await t.typeText(nameField, 'test@foo.de')
//   const reactComponent = ReactSelector('AdvancedButton')
//   const reactComponentState = await reactComponent.getReact()
//   await t.debug().click(reactComponentState)
// })
