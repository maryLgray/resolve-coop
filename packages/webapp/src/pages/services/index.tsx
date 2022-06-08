/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { FC } from 'react'
import { useCallback, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { ServiceList } from '~components/lists/ServiceList'
import { useServiceList } from '~hooks/api/useServiceList'
import { useCurrentUser } from '~hooks/api/useCurrentUser'
import { Namespace, useTranslation } from '~hooks/useTranslation'
import type { Service, ServiceInput } from '@cbosuite/schema/dist/client-types'
import { ServiceStatus } from '@cbosuite/schema/dist/client-types'
import { ArchiveServiceModal } from '~components/ui/ArchiveServiceModal'
import { Title } from '~components/ui/Title'
import { wrap } from '~utils/appinsights'
import { useBoolean } from '@fluentui/react-hooks'
import { ApplicationRoute } from '~types/ApplicationRoute'

const ServicesPage: FC = wrap(function Services() {
	const { orgId } = useCurrentUser()
	const { t } = useTranslation(Namespace.Services)
	const { serviceList, loading, updateService } = useServiceList(orgId)
	const [isModalShown, { setFalse: hideModal, setTrue: showModal }] = useBoolean(false)
	const serviceInput = useRef(null)
	const title = t('pageTitle')
	const location = useLocation()
	const isKiosk = location.pathname === ApplicationRoute.ServicesKiosk

	const handleServiceClose = useCallback(
		(values: Service) => {
			const updatedService: ServiceInput = {
				id: values.id,
				name: values.name,
				contactFormEnabled: values.contactFormEnabled,
				orgId: orgId,
				status: ServiceStatus.Archive
			}
			serviceInput.current = updatedService
			showModal()
		},
		[orgId, showModal]
	)

	const archiveService = useCallback(async () => {
		await updateService(serviceInput.current)
		serviceInput.current = null
		hideModal()
	}, [hideModal, updateService])

	const serviceName = serviceInput.current ? serviceInput.current.name : ''
	const activeServiceList = useMemo(
		() => serviceList.filter((s) => s.status !== ServiceStatus.Archive),
		[serviceList]
	)

	return (
		<>
			<Title title={title} />
			<ServiceList
				title={title}
				isKiosk={isKiosk}
				services={activeServiceList}
				loading={loading}
				onServiceClose={handleServiceClose}
			/>
			<ArchiveServiceModal
				showModal={isModalShown}
				serviceName={serviceName}
				onSubmit={archiveService}
				onDismiss={hideModal}
			/>
		</>
	)
})

export default ServicesPage
