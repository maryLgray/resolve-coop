/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
// TODO: replace useOrganization with this one entirely

import { gql, useQuery } from '@apollo/client'
import { ApiResponse } from './types'
import { useRecoilValue } from 'recoil'
import { userAuthState } from '~store'
import type { AuthenticationResponse, Engagement } from '@greenlight/schema/lib/client-types'

export const EXPORT_ENGAGEMENT_DATA = gql`
	query exportData($orgId: String!) {
		exportData(orgId: $orgId) {
			id
			description
			status
			startDate
			endDate
			orgId
			tags {
				id
				label
			}
			user {
				name {
					first
					middle
					last
				}
			}
			contact {
				name {
					first
					middle
					last
				}
			}
			description
			actions {
				date
				comment
				tags {
					id
					label
				}
				user {
					name {
						first
						middle
						last
					}
				}
				taggedUser {
					name {
						first
						middle
						last
					}
				}
			}
		}
	}
`

export function useReports(): ApiResponse<Engagement[]> {
	const authUser = useRecoilValue<AuthenticationResponse>(userAuthState)
	const orgId = authUser?.user?.roles[0]?.orgId

	const { loading, error, data, refetch } = useQuery(EXPORT_ENGAGEMENT_DATA, {
		variables: { orgId },
		fetchPolicy: 'cache-and-network'
	})

	if (error) {
		console.error('error loading data', error)
	}

	const engagements: Engagement[] = !loading && (data?.exportData as Engagement[])

	return {
		loading,
		error,
		refetch,
		data: engagements
	}
}