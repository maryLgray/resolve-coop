/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable jest/expect-expect,jest/no-done-callback */
import config from 'config'
import type { PageObjects } from '../pageobjects'
import { createPageObjects } from '../pageobjects'
import type { Page } from '@playwright/test'
import { test } from '@playwright/test'

const username = config.get<string>('user.login')
const password = config.get<string>('user.password')

test.describe('The user login flow', () => {
	let page: Page
	let po: PageObjects

	test.beforeEach(async ({ browser }) => {
		const ctx = await browser.newContext()
		page = await ctx.newPage()
		po = createPageObjects(page)
		await po.loginPage.open()
	})

	test.afterAll(async () => {
		await page.close()
	})

	test.describe('should log in with valid credentials', () => {
		test('and log out using the header', async () => {
			await po.loginPage.login(username, password)
			await po.dashboardPage.waitForLoad()
			await po.header.logout()
			await po.loginPage.waitForLoad()
		})

		test('and log out via navigation', async () => {
			await po.loginPage.login(username, password)
			await po.dashboardPage.waitForLoad()
			await po.logoutPage.open()
			await po.loginPage.waitForLoad()
		})
	})
})
