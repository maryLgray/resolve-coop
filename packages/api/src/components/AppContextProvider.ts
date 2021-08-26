/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Authenticator } from './Authenticator'
import { Configuration } from './Configuration'
import { Notifications } from './Notifications'
import { DatabaseConnector } from './DatabaseConnector'
import { Localization } from './Localization'
import {
	ContactCollection,
	OrganizationCollection,
	UserCollection,
	UserTokenCollection,
	EngagementCollection,
	ServiceCollection
} from '~db'
import { PubSub } from 'apollo-server'
import { AsyncProvider, BuiltAppContext } from '~types'
import nodemailer from 'nodemailer'

export class AppContextProvider implements AsyncProvider<BuiltAppContext> {
	#config: Configuration

	public constructor(config: Configuration) {
		this.#config = config
	}

	public async get(): Promise<BuiltAppContext> {
		const config = this.#config
		const conn = new DatabaseConnector(config)
		await conn.connect()
		const userCollection = new UserCollection(conn.usersCollection)
		const userTokenCollection = new UserTokenCollection(conn.userTokensCollection)
		const orgCollection = new OrganizationCollection(conn.orgsCollection)
		const localization = new Localization()
		const notify = new Notifications()
		const mailer = nodemailer.createTransport(this.#config.smtpDetails, {
			from: this.#config.defaultFromAddress
		})
		const authenticator = new Authenticator(
			userCollection,
			userTokenCollection,
			config.jwtTokenSecret,
			mailer
		)
		const contactCollection = new ContactCollection(conn.contactsCollection)
		const engagementCollection = new EngagementCollection(conn.engagementsCollection)
		const serviceCollection = new ServiceCollection(conn.servicesCollection)

		return {
			config,
			notify,
			pubsub: new PubSub(),
			collections: {
				users: userCollection,
				orgs: orgCollection,
				contacts: contactCollection,
				userTokens: userTokenCollection,
				engagements: engagementCollection,
				services: serviceCollection
			},
			components: {
				mailer,
				authenticator,
				dbConnector: conn,
				localization
			}
		}
	}
}
