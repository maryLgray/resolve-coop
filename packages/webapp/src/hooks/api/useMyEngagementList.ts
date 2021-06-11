/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { useLazyQuery, gql, useMutation } from '@apollo/client'
import { ApiResponse } from './types'
import type {
	AuthenticationResponse,
	Engagement,
	EngagementInput
} from '@greenlight/schema/lib/client-types'
import { EngagementFields } from './fragments'
import { get } from 'lodash'
import { useRecoilState } from 'recoil'
import { myEngagementListState, userAuthState } from '~store'
import { useEffect } from 'react'
import sortByDate from '~utils/sortByDate'

export const GET_ENGAGEMENTS = gql`
	${EngagementFields}

	query engagements(
		$orgId: String!
		$offset: Int
		$limit: Int
		$userId: String
		$exclude_userId: Boolean
	) {
		engagements(
			orgId: $orgId
			offset: $offset
			limit: $limit
			userId: $userId
			exclude_userId: $exclude_userId
		) {
			...EngagementFields
		}
	}
`

export const CREATE_ENGAGEMENT = gql`
	${EngagementFields}

	mutation createEngagement($body: EngagementInput!) {
		createEngagement(body: $body) {
			message
			engagement {
				...EngagementFields
			}
		}
	}
`

interface useMyEngagementListReturn extends ApiResponse<Engagement[]> {
	addEngagement: (form: any) => Promise<void>
	myEngagementList: Engagement[]
}

// FIXME: update to only have ONE input as an object
export function useMyEngagementList(orgId: string, userId?: string): useMyEngagementListReturn {
	const [authUser] = useRecoilState<AuthenticationResponse | null>(userAuthState)
	const [myEngagementList, setMyEngagmentList] = useRecoilState<Engagement[] | null>(
		myEngagementListState
	)
	const [loadEnagements, { loading, error, data, refetch, fetchMore }] = useLazyQuery(
		GET_ENGAGEMENTS,
		{
			variables: { orgId, offset: 0, limit: 800, userId, exclude_userId: false },
			fetchPolicy: 'cache-and-network'
		}
	)
	const [createEngagement] = useMutation(CREATE_ENGAGEMENT)

	if (error) {
		console.error('error loading data', error)
	}

	useEffect(() => {
		loadEnagements()
	}, [loadEnagements])

	useEffect(() => {
		if (data?.engagements) {
			setMyEngagmentList(data.engagements)
		} else {
			setMyEngagmentList([])
		}
	}, [data, setMyEngagmentList])

	const engagementData: Engagement[] = !loading && (data?.engagements as Engagement[])

	const addEngagement = async (engagementInput: EngagementInput) => {
		const orgId = get(authUser, 'user.roles[0].orgId')

		// Add org to engagement based on user
		const nextEngagement = {
			...engagementInput,
			orgId
		}

		// Execute mutator
		await createEngagement({
			variables: {
				body: nextEngagement
			},
			update(cache, { data }) {
				// Check failure condition
				if (!data?.createEngagement?.engagement)
					throw new Error('Create engagement failed without error')

				// Update local list
				const nextMyEngagementList: Engagement[] = [
					...myEngagementList,
					data.createEngagement.engagement
				].sort((a, b) => sortByDate({ date: a.startDate }, { date: b.startDate }))

				// Set recoil variable
				setMyEngagmentList(nextMyEngagementList)
			}
		})
	}

	return {
		loading,
		error,
		refetch,
		fetchMore,
		addEngagement,
		myEngagementList,
		data: engagementData
	}
}