/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable jest/expect-expect */
import type { Config } from '../config'
import DashboardPage from '../pageobjects/DashboardPage'
import LoginPage from '../pageobjects/LoginPage'
import LogoutPage from '../pageobjects/LogoutPage'
import NewClientPanel from '../pageobjects/NewClientPanel'
import NewRequestPanel from '../pageobjects/NewRequestPanel'

declare const config: Config

describe('The Dashboard Page', () => {
	before(async () => {
		await LogoutPage.open()
		await LoginPage.waitForLoad()
		await LoginPage.login(config.user.login, config.user.password)
		await DashboardPage.waitForLoad()
	})
	after(async () => {
		await browser.execute(() => localStorage.clear())
	})

	describe('request creation', () => {
		it('can open the new request panel by clicking "New Request"', async () => {
			await DashboardPage.clickNewRequest()
			await NewRequestPanel.waitForLoad()
			const isSubmitEnabled = await NewRequestPanel.isSubmitEnabled()
			expect(isSubmitEnabled).toBe(false)

			await NewRequestPanel.closePanel()
		})
	})

	describe('client creation', () => {
		it('can open the new client panel by clicking "New Client"', async () => {
			await DashboardPage.clickNewClient()
			await NewClientPanel.waitForLoad()
			const isSubmitEnabled = await NewClientPanel.isSubmitEnabled()
			expect(isSubmitEnabled).toBe(false)

			await NewClientPanel.closePanel()
		})
	})
})