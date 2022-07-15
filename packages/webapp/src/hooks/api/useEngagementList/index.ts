/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { ApiResponse } from '../types'
import type { Engagement } from '@cbosuite/schema/dist/client-types'
import type { ClaimEngagementCallback } from './useClaimEngagementCallback'
import { useClaimEngagementCallback } from './useClaimEngagementCallback'
import type { EditEngagementCallback } from './useEditEngagementCallback'
import { useEditEngagementCallback } from './useEditEngagementCallback'
import type { AddEngagementCallback } from './addEngagementCallback'
import { useAddEngagementCallback } from './addEngagementCallback'
import { useEngagementData } from './useEngagementListData'
import { useMemo } from 'react'

interface useEngagementListReturn extends ApiResponse<Engagement[]> {
	addEngagement: AddEngagementCallback
	editEngagement: EditEngagementCallback
	claimEngagement: ClaimEngagementCallback
	engagementList: Engagement[]
	myEngagementList: Engagement[]
}

// FIXME: update to only have ONE input as an object
export function useEngagementList(orgId?: string, userId?: string): useEngagementListReturn {
	const { data, error, loading } = useEngagementData(orgId, userId)
	const { engagementList = [] as Engagement[], myEngagementList = [] as Engagement[] } = data ?? {
		engagementList: [] as Engagement[],
		myEngagementList: [] as Engagement[]
	}

	const addEngagement = useAddEngagementCallback(orgId)
	const editEngagement = useEditEngagementCallback()
	const claimEngagement = useClaimEngagementCallback()

	return useMemo(
		() => ({
			loading,
			error,
			addEngagement,
			editEngagement,
			claimEngagement,
			engagementList,
			myEngagementList
		}),
		[
			loading,
			error,
			addEngagement,
			editEngagement,
			claimEngagement,
			engagementList,
			myEngagementList
		]
	)
}
