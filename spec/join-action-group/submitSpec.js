/*
  global describe, beforeEach, afterEach, it, expect
*/
'use strict'

let Model = require('../../src/js/JoinActionGroup')

var sinon = require('sinon')
var ajax = require('../../src/js/ajax')
var api = require('../../src/js/api-endpoints')
var browser = require('../../src/js/browser')
var querystring = require('../../src/js/getUrlParam')
import { getGroupData } from './getGroupData'

describe('Join Action Group - Submit', () => {
  var browserLoadingStub
  var browserLoadedStub
  var browserScrollToStub
  var ajaxPostStub
  var setActiveSectionSpy
  var sut

  beforeEach(() => {
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')
    browserScrollToStub = sinon.stub(browser, 'scrollTo')
    sinon.stub(browser, 'pushHistory')
    sinon.stub(browser, 'setOnHistoryPop')
    sinon.stub(querystring, 'hashbang').returns('')

    let groupData = getGroupData()

    sinon.stub(ajax, 'get')
      .withArgs(api.actionGroups)
      .returns({
        then: (success, error) => {
          success({
            'status': 'ok',
            'data': groupData
          })
        }
      })

    let expectedPayloadData = {
      firstName: 'first name',
      lastName: 'last name',
      email: 'test@email.com',
      organisation: 'organisation',
      isOptedIn: true,
      message: 'my message'
    }
    ajaxPostStub = sinon.stub(ajax, 'post')
      .withArgs(api.actionGroups + '/' + groupData[1].id + '/joining-enquiries', expectedPayloadData)
      .returns({
        then: (success, error) => {
          success({
            'statusCode': 201
          })
        }
      })

    sut = new Model()
    sut.formModel().firstName('first name')
    sut.formModel().lastName('last name')
    sut.formModel().email('test@email.com')
    sut.formModel().pledge('my message')
    sut.formModel().organisation('organisation')
    sut.formModel().isOptedIn(true)
    sut.actionGroups()[1].selectActionGroup()

    browserLoadingStub.reset()
    browserLoadedStub.reset()
    setActiveSectionSpy = sinon.stub(sut, 'setActiveSection')

    sut.submitPledge()
  })

  afterEach(() => {
    browser.loading.restore()
    browser.loaded.restore()
    browser.scrollTo.restore()
    browser.pushHistory.restore()
    browser.setOnHistoryPop.restore()
    querystring.hashbang.restore()
    ajax.post.restore()
    ajax.get.restore()
  })

  it('- Should notify user it is loading', () => {
    expect(browserLoadingStub.calledOnce).toBeTruthy()
  })

  it('- Should set Section 3 as active', () => {
    expect(setActiveSectionSpy.getCall(0).args[0]).toEqual(3)
  })

  it('- Should post pledge to API', () => {
    expect(ajaxPostStub.calledOnce).toBeTruthy()
  })

  it('- Should notify user it has loaded', () => {
    expect(browserLoadedStub.calledAfter(ajaxPostStub)).toBeTruthy()
  })

  it('- Should set Section 4 as active', () => {
    expect(setActiveSectionSpy.getCall(1).args[0]).toEqual(4)
  })

  it('- Should set scroll to top of section', () => {
    expect(browserScrollToStub.withArgs('js-pledge').calledOnce).toBeFalsy()
  })
})
