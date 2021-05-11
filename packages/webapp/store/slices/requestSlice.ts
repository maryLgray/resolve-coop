/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { createSlice } from '@reduxjs/toolkit'
// TODO: implement intercepters and error handlers https://github.com/axios/axios#interceptors
// import axios, { AxiosResponse } from 'axios'
import { fakeRequests } from './requestsSlice'
import { AppDispatch, RootState } from '~store'
import LoadActionProps from '~types/LoadActionProps'
import IRequest from '~types/Request'

export const slice = createSlice({
	name: 'request',
	initialState: {
		isLoading: false,
		data: undefined
	},
	reducers: {
		set: (state, action) => {
			state.data = action.payload
		},
		setLoading: (state, action) => {
			state.isLoading = action.payload
		}
	}
})

// Export actions
export const { set } = slice.actions

// Private actions
const { setLoading } = slice.actions

interface LoadRequestProps extends LoadActionProps {
	request?: IRequest
}
/**
 * Add async and dynamic actions here
 */
export const loadRequest = ({ id, request }: LoadRequestProps) => async (
	dispatch: AppDispatch
): Promise<void> => {
	dispatch(setLoading(true))
	console.log('loadRequest id', id)

	try {
		// TODO: pull data from server
		// const requestResponse: AxiosResponse = await axios.get(`/api/v1/requests/${rid}`)

		if (request) {
			dispatch(set(request))
		} else if (typeof id === 'string') {
			const fakeRequest = fakeRequests[parseInt(id) - 1]
			dispatch(set(fakeRequest))
		}
	} catch (error) {
		// TODO: handle errors here
		console.log('error', error)
	} finally {
		dispatch(setLoading(false))
	}
}

/**
 * Add getters here
 */
// TODO: Add type for request getter
export const getRequest = (state: RootState): IRequest | Record<string, any> => state.request.data

// Export reducer
export default slice.reducer
