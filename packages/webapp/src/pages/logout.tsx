/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { useRouter } from 'next/router'
import LoginLayout from '~layouts/LoginLayout'
import { memo, useEffect } from 'react'
import getServerSideTranslations from '~utils/getServerSideTranslations'
import { useAuthUser } from '~hooks/api/useAuth'

export const getStaticProps = getServerSideTranslations(['login'])

const LoginPage = memo(function LoginPage(): JSX.Element {
	const router = useRouter()
	const { logout } = useAuthUser()

	useEffect(() => {
		const error = router.query?.error
		logout()
		setTimeout(() => router.push(`/login${error ? '?error=' + error : ''}`), 0)
	}, [router, logout])

	return <LoginLayout> </LoginLayout>
})

export default LoginPage
