/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import { ServiceAnswerResolvers } from '@cbosuite/schema/dist/provider-types'
import { createGQLContact } from '~dto'
import { AppContext } from '~types'

export const ServiceAnswer: ServiceAnswerResolvers<AppContext> = {
	contacts: (_, args, ctx) => {
		const contactIds = _.contacts as any[] as string[]
		return Promise.all(
			contactIds.map(async (contactId) => {
				const contact = await ctx.collections.contacts.itemById(contactId)
				if (!contact.item) {
					throw new Error(`Contact ${contactId} not found`)
				}
				return createGQLContact(contact.item)
			})
		)
	}
}