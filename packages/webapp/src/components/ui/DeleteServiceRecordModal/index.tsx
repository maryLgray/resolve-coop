/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { memo, useEffect, useState } from 'react'
import styles from './index.module.scss'
import type { ComponentProps } from '~types/ComponentProps'
import { wrap } from '~utils/appinsights'
import { Modal, PrimaryButton, DefaultButton, IconButton } from '@fluentui/react'
import { useTranslation } from '~hooks/useTranslation'
import cx from 'classnames'

interface DeleteServiceRecordModalProps extends ComponentProps {
	showModal: boolean
	onSubmit?: () => void
	onDismiss?: () => void
}

export const DeleteServiceRecordModal = wrap(
	memo(function DeleteServiceRecordModal({
		showModal,
		onSubmit,
		onDismiss
	}: DeleteServiceRecordModalProps): JSX.Element {
		const { t } = useTranslation('reporting')
		const [isOpen, setIsOpen] = useState(showModal)

		useEffect(() => {
			setIsOpen(showModal)
		}, [showModal])

		const handleDismiss = () => {
			setIsOpen(false)
			onDismiss?.()
		}

		return (
			<Modal isOpen={isOpen} onDismiss={handleDismiss} isBlocking={false}>
				<div>
					<div className='d-flex justify-content-between align-items-center p-2 bg-primary text-light'>
						<div className='ms-2'>
							<strong>{t('deleteModal.title')}</strong>
						</div>
						<IconButton
							className='text-light btn btn-primary'
							iconProps={{ iconName: 'Cancel' }}
							ariaLabel={t('deleteModal.cancel')}
							onClick={handleDismiss}
						/>
					</div>
					<div className='p-3'>
						<p>{t('deleteModal.subText')}</p>
					</div>
					<div className='d-flex p-3 justify-content-end'>
						<PrimaryButton
							className={cx('me-3', styles.archiveButton)}
							onClick={() => onSubmit?.()}
							text={t('deleteModal.title')}
						/>
						<DefaultButton
							className={styles.cancelButton}
							onClick={handleDismiss}
							text={t('deleteModal.cancel')}
						/>
					</div>
				</div>
			</Modal>
		)
	})
)
