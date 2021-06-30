/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { useAuthUser } from '~hooks/api/useAuth'
import ContainerLayout from '~layouts/ContainerLayout'
import { get } from 'lodash'
import { useOrganization } from '~hooks/api/useOrganization'
import RequestTagsList from '~components/lists/RequestTagsList'
import { memo } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticProps } from 'next'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale, ['common', 'footer']))
		}
	}
}

const RequestTags = memo(function RequestTags(): JSX.Element {
	const { authUser } = useAuthUser()
	const userRole = get(authUser, 'user.roles[0]')
	const { data: orgData } = useOrganization(userRole?.orgId)

	return (
		<ContainerLayout orgName={orgData?.name} documentTitle='Request Tags'>
			{authUser?.accessToken && <RequestTagsList title='Request Tags' />}
		</ContainerLayout>
	)
})
export default RequestTags
