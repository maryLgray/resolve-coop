/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { gql, useMutation } from '@apollo/client'
import type { AuthenticationResponse } from '@greenlight/schema/lib/client-types'
import { useRecoilState } from 'recoil'
import { userAuthState } from '~store'

const AUTHENTICATE_USER = gql`
	mutation authenticate($username: String!, $password: String!) {
		authenticate(username: $username, password: $password) {
			message
			accessToken
			user {
				id
				name {
					first
					middle
					last
				}
				roles {
					orgId
					roleType
				}
			}
		}
	}
`

const RESET_USER_PASSWORD = gql`
	mutation resetUserPassword($userId: String!) {
		resetUserPassword(id: $userId) {
			user {
				id
				userName
				name {
					first
					middle
					last
				}
				roles {
					orgId
					roleType
				}
				email
				phone
			}
			message
		}
	}
`

export type BasicAuthCallback = (username: string, password: string) => void
export type LogoutCallback = () => void
export type ResetPasswordCallback = (
	userId: string
) => Promise<{ status: string; message?: string }>

export function useAuthUser(): {
	login: BasicAuthCallback
	logout: LogoutCallback
	resetPassword: ResetPasswordCallback
	authUser: AuthenticationResponse
	currentUserId: string
} {
	const [authenticate] = useMutation(AUTHENTICATE_USER)
	const [resetUserPassword] = useMutation(RESET_USER_PASSWORD)
	const [authUser, setUserAuth] = useRecoilState<AuthenticationResponse | null>(userAuthState)

	const login = async (username: string, password: string) => {
		try {
			const resp = await authenticate({ variables: { username, password } })
			setUserAuth(resp.data.authenticate)
		} catch (error) {
			// TODO: handle error: 404, 500, etc..
			console.log('error', error)
		}
	}

	const logout = () => {
		setUserAuth(null)
	}

	const resetPassword = async (userId: string) => {
		const result = {
			status: 'failed',
			message: null
		}

		const resp = await resetUserPassword({ variables: { userId } })

		if (resp.data.resetUserPassword.message.toLowerCase() === 'success') {
			result.status = 'success'
		}

		result.message = resp.data.resetUserPassword.message
		return result
	}

	return {
		login,
		logout,
		resetPassword,
		authUser,
		currentUserId: authUser?.user?.id
	}
}
